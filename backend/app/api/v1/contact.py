from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.api.v1.admin import get_current_admin


router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactMessageCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr | None = None
    message: str


class ContactMessageResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str | None
    message: str
    submitted_at: str
    status: str


@router.post("", status_code=201)
async def submit_contact_message(message: ContactMessageCreate):
    """Public endpoint - submit contact form"""
    collection = get_db()["contact_messages"]
    data = message.model_dump()
    data["submitted_at"] = datetime.now(timezone.utc)
    data["status"] = "unread"  # unread, read, replied
    
    result = await collection.insert_one(data)
    return {
        "id": str(result.inserted_id),
        "message": "Thank you for your message. We'll get back to you soon!"
    }


@router.get("/messages", response_model=list)
async def get_contact_messages(admin=Depends(get_current_admin)):
    """Get all contact messages (admin only)"""
    collection = get_db()["contact_messages"]
    cursor = collection.find().sort("submitted_at", -1)
    messages = await cursor.to_list(length=None)
    
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    
    return messages


@router.put("/messages/{message_id}/read")
async def mark_message_read(message_id: str, admin=Depends(get_current_admin)):
    """Mark contact message as read (admin only)"""
    from bson import ObjectId
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID")
    
    collection = get_db()["contact_messages"]
    await collection.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"status": "read"}}
    )
    return {"message": "Message marked as read"}


@router.delete("/messages/{message_id}", status_code=204)
async def delete_message(message_id: str, admin=Depends(get_current_admin)):
    """Delete contact message (admin only)"""
    from bson import ObjectId
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID")
    
    collection = get_db()["contact_messages"]
    result = await collection.delete_one({"_id": ObjectId(message_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return None