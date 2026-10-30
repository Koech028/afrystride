from fastapi import APIRouter
from app.api.v1 import products, categories, admin, contact, orders, payments, seo

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(admin.router)
api_router.include_router(contact.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)