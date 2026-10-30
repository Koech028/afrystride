from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.mongo.category import CategoryCreate, CategoryUpdate, CategoryInDB, CategoryResponse
from app.api.v1.admin import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


def get_collection():
    return get_db()["categories"]


@router.get("", response_model=List[dict])
async def list_categories():
    collection = get_collection()
    cursor = collection.find().sort("display_order", 1)
    items = await cursor.to_list(length=None)
    for item in items:
        item["_id"] = str(item["_id"])
    return items


@router.get("/{category_id}", response_model=dict)
async def get_category(category_id: str):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    collection = get_collection()
    doc = await collection.find_one({"_id": ObjectId(category_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Category not found")
    doc["_id"] = str(doc["_id"])
    return doc


@router.post("", response_model=dict, status_code=201)
async def create_category(category: CategoryCreate, admin=Depends(get_current_admin)):
    collection = get_collection()
    data = category.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    result = await collection.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data


@router.put("/{category_id}", response_model=dict)
async def update_category(category_id: str, update: CategoryUpdate, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    collection = get_collection()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await collection.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_data}
        )
    doc = await collection.find_one({"_id": ObjectId(category_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Category not found")
    doc["_id"] = str(doc["_id"])
    return doc


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: str, admin=Depends(get_current_admin)):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    collection = get_collection()
    result = await collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return None