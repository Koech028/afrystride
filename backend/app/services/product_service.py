from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from app.core.database import get_db
from app.models.mongo.product import ProductCreate, ProductUpdate, ProductInDB


class ProductService:
    @property
    def collection(self):
        return get_db()["products"]

    async def create(self, product: ProductCreate) -> ProductInDB:
        data = product.model_dump()
        data["created_at"] = datetime.now(timezone.utc)
        data["updated_at"] = None
        result = await self.collection.insert_one(data)
        doc = await self.collection.find_one({"_id": result.inserted_id})
        return ProductInDB(**doc)

    async def get_by_id(self, product_id: str) -> Optional[ProductInDB]:
        if not ObjectId.is_valid(product_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(product_id)})
        return ProductInDB(**doc) if doc else None

    async def get_by_slug(self, slug: str) -> Optional[ProductInDB]:
        doc = await self.collection.find_one({"slug": slug})
        return ProductInDB(**doc) if doc else None

    async def list_products(
        self,
        category: Optional[str] = None,
        size: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock: Optional[bool] = None,
        tag: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 20
    ) -> dict:
        # Build filter
        query = {}
        if category:
            query["category"] = category
        if size:
            query["sizes"] = {"$in": [size]}
        if min_price is not None or max_price is not None:
            query["price"] = {}
            if min_price is not None:
                query["price"]["$gte"] = min_price
            if max_price is not None:
                query["price"]["$lte"] = max_price
        if in_stock is not None:
            query["stock_status"] = "in_stock" if in_stock else "out_of_stock"
        if tag:
            query["tags"] = {"$in": [tag]}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]

        # Sorting
        sort_direction = -1 if sort_order == "desc" else 1

        # Pagination
        skip = (page - 1) * limit
        total = await self.collection.count_documents(query)
        cursor = self.collection.find(query).sort(sort_by, sort_direction).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)

        # Convert ObjectId to string for JSON
        for item in items:
            item["_id"] = str(item["_id"])

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }

    async def update(self, product_id: str, update: ProductUpdate) -> Optional[ProductInDB]:
        if not ObjectId.is_valid(product_id):
            return None
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            await self.collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        doc = await self.collection.find_one({"_id": ObjectId(product_id)})
        return ProductInDB(**doc) if doc else None

    async def delete(self, product_id: str) -> bool:
        if not ObjectId.is_valid(product_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0

    async def get_categories_with_counts(self) -> List[dict]:
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        return await self.collection.aggregate(pipeline).to_list(length=None)

    async def get_featured(self, limit: int = 8) -> List[dict]:
        cursor = self.collection.find({"tags": {"$in": ["featured", "best_seller", "new"]}}).limit(limit)
        items = await cursor.to_list(length=limit)
        for item in items:
            item["_id"] = str(item["_id"])
        return items


product_service = ProductService()