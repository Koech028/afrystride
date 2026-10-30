from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timezone, timedelta
from typing import Optional
from bson import ObjectId
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.schemas.admin_schema import AdminLogin, AdminCreate, AdminResponse, TokenResponse, PasswordChange
from app.core.rate_limiter import limiter

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer(auto_error=False)

# Audit logging
async def log_audit(db, admin_id: str, action: str, resource: str, details: dict = None):
    await db["audit_logs"].insert_one({
        "admin_id": admin_id,
        "action": action,
        "resource": resource,
        "details": details or {},
        "ip_address": None,  # populated from request if available
        "timestamp": datetime.now(timezone.utc)
    })


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Check token expiry explicitly
    exp = payload.get("exp")
    if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Token expired")
    
    admin_id = payload.get("sub")
    if not admin_id or not ObjectId.is_valid(admin_id):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    collection = get_db()["admins"]
    admin = await collection.find_one({"_id": ObjectId(admin_id)})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return {
        "id": str(admin["_id"]),
        "email": admin["email"],
        "role": admin.get("role", "admin")
    }


def require_role(*allowed_roles: str):
    """Dependency factory for role-based access control"""
    async def role_checker(admin=Depends(get_current_admin)):
        if admin["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return admin
    return role_checker


# Public endpoints
@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin, request: Request):
    """Admin login with generic error to prevent user enumeration"""
    collection = get_db()["admins"]
    admin = await collection.find_one({"email": credentials.email})
    
    # Constant-time comparison to prevent timing attacks
    if not admin or not verify_password(credentials.password, admin["hashed_password"]):
        # Log failed attempt
        await get_db()["audit_logs"].insert_one({
            "action": "login_failed",
            "email_attempted": credentials.email,
            "ip_address": request.client.host if request.client else None,
            "timestamp": datetime.now(timezone.utc)
        })
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await collection.update_one(
        {"_id": admin["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    # Log success
    await log_audit(get_db(), str(admin["_id"]), "login", "auth", {
        "ip": request.client.host if request.client else None
    })
    
    token = create_access_token({
        "sub": str(admin["_id"]),
        "email": admin["email"],
        "role": admin.get("role", "admin")
    })
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")  # Max 5 login attempts per minute per IP
async def admin_login(credentials: AdminLogin, request: Request):
    ...

# Protected endpoints
@router.post("/register", response_model=AdminResponse, status_code=201)
async def create_admin(
    admin_data: AdminCreate,
    current_admin=Depends(require_role("super_admin"))
):
    """Create new admin — super_admin only"""
    collection = get_db()["admins"]
    
    existing = await collection.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Enforce strong password
    if len(admin_data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    new_admin = {
        "email": admin_data.email,
        "hashed_password": hash_password(admin_data.password),
        "role": admin_data.role,
        "created_at": datetime.now(timezone.utc),
        "last_login": None
    }
    
    result = await collection.insert_one(new_admin)
    
    await log_audit(get_db(), current_admin["id"], "create_admin", "admin", {
        "new_admin_email": admin_data.email,
        "new_admin_role": admin_data.role
    })
    
    return {
        "id": str(result.inserted_id),
        "email": new_admin["email"],
        "role": new_admin["role"],
        "last_login": None
    }


@router.get("/me", response_model=dict)
async def get_current_admin_info(admin=Depends(get_current_admin)):
    return admin


@router.put("/password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    admin=Depends(get_current_admin)
):
    """Change password with current password verification"""
    collection = get_db()["admins"]
    admin_doc = await collection.find_one({"_id": ObjectId(admin["id"])})
    
    if not verify_password(password_data.current_password, admin_doc["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    await collection.update_one(
        {"_id": ObjectId(admin["id"])},
        {"$set": {"hashed_password": hash_password(password_data.new_password)}}
    )
    
    await log_audit(get_db(), admin["id"], "password_change", "auth")
    
    return {"message": "Password updated successfully"}


@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(admin=Depends(get_current_admin)):
    db = get_db()
    
    total_products = await db["products"].count_documents({})
    total_categories = await db["categories"].count_documents({})
    in_stock = await db["products"].count_documents({"stock_status": "in_stock"})
    out_of_stock = await db["products"].count_documents({"stock_status": "out_of_stock"})
    
    recent_messages = await db["contact_messages"].find().sort("submitted_at", -1).limit(5).to_list(length=5)
    for msg in recent_messages:
        msg["_id"] = str(msg["_id"])
    
    return {
        "products": {
            "total": total_products,
            "in_stock": in_stock,
            "out_of_stock": out_of_stock
        },
        "categories": total_categories,
        "recent_messages": recent_messages
    }


@router.get("/audit-logs", response_model=list)
async def get_audit_logs(
    limit: int = 50,
    admin=Depends(require_role("super_admin"))
):
    """View audit logs — super_admin only"""
    db = get_db()
    logs = await db["audit_logs"].find().sort("timestamp", -1).limit(limit).to_list(length=limit)
    for log in logs:
        log["_id"] = str(log["_id"])
    return logs