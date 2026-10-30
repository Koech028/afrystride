from datetime import datetime, timezone
from typing import Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId


def validate_object_id(v):
    if isinstance(v, ObjectId):
        return str(v)
    if ObjectId.is_valid(v):
        return str(ObjectId(v))
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


class CategoryBase(BaseModel):
    name: str
    slug: str
    display_order: int = 0
    parent_category: Optional[str] = None
    image: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    display_order: Optional[int] = None
    parent_category: Optional[str] = None
    image: Optional[str] = None


class CategoryInDB(CategoryBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True