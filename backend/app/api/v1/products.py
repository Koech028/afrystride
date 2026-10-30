#app/api/v1/products.py
from fastapi import APIRouter, HTTPException, Query, Depends, File, UploadFile
from typing import Optional, List
from app.services.product_service import product_service
from app.models.mongo.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.product_schema import ProductFilterParams
from app.api.v1.admin import get_current_admin
from app.utils.image_upload import upload_image

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=dict)
async def list_products(
    category: Optional[str] = None,
    size: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", regex="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100)
):
    """Public endpoint - list all products with filters"""
    return await product_service.list_products(
        category=category, size=size, min_price=min_price,
        max_price=max_price, in_stock=in_stock, tag=tag,
        search=search, sort_by=sort_by, sort_order=sort_order,
        page=page, limit=limit
    )


@router.get("/featured", response_model=List[dict])
async def get_featured_products(limit: int = Query(default=8, ge=1, le=20)):
    """Get featured/best seller/new products for homepage"""
    return await product_service.get_featured(limit=limit)


@router.get("/categories", response_model=List[dict])
async def get_categories_with_counts():
    """Get all categories with product counts"""
    return await product_service.get_categories_with_counts()


# UPLOAD ENDPOINT MUST COME BEFORE /{product_id}
@router.post("/upload-image", response_model=dict)
async def upload_product_image(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    """Upload a product image to Cloudflare R2 (admin only)"""
    result = await upload_image(file, folder="afrystride/products")
    return {
        "url": result["url"],
        "key": result["key"]
    }

@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: str):
    """Get single product by ID"""
    product = await product_service.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {**product.model_dump(by_alias=True), "_id": str(product.id)}


@router.get("/slug/{slug}", response_model=dict)
async def get_product_by_slug(slug: str):
    """Get single product by slug (for SEO-friendly URLs)"""
    product = await product_service.get_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {**product.model_dump(by_alias=True), "_id": str(product.id)}


# Admin-only endpoints
@router.post("", response_model=dict, status_code=201)
async def create_product(product: ProductCreate, admin=Depends(get_current_admin)):
    """Create new product (admin only)"""
    new_product = await product_service.create(product)
    return {**new_product.model_dump(by_alias=True), "_id": str(new_product.id)}


@router.put("/{product_id}", response_model=dict)
async def update_product(product_id: str, update: ProductUpdate, admin=Depends(get_current_admin)):
    """Update product (admin only)"""
    updated = await product_service.update(product_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return {**updated.model_dump(by_alias=True), "_id": str(updated.id)}


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str, admin=Depends(get_current_admin)):
    """Delete product (admin only)"""
    deleted = await product_service.delete(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return None