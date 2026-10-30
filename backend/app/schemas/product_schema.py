from pydantic import BaseModel
from typing import List, Optional


class ProductListResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    limit: int


class ProductFilterParams(BaseModel):
    category: Optional[str] = None
    size: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    in_stock: Optional[bool] = None
    tag: Optional[str] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "created_at"  # created_at, price, name
    sort_order: Optional[str] = "desc"  # asc, desc
    page: int = 1
    limit: int = 20