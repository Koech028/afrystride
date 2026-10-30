from datetime import datetime, timezone
from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator
from bson import ObjectId


def validate_object_id(v):
    if isinstance(v, ObjectId):
        return str(v)
    if ObjectId.is_valid(v):
        return str(ObjectId(v))
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


class ProductBase(BaseModel):
    name: str
    slug: str
    category: str
    price: float
    sizes: List[str] = []
    colours: List[str] = []
    images: List[str] = []
    stock_status: str = "in_stock"  # in_stock | out_of_stock
    tags: List[str] = []
    description: Optional[str] = None
    badge: Optional[str] = None  # New, Best Seller, School Uniform


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    sizes: Optional[List[str]] = None
    colours: Optional[List[str]] = None
    images: Optional[List[str]] = None
    stock_status: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    badge: Optional[str] = None


class ProductInDB(ProductBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ProductResponse(ProductBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True