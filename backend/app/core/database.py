from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DB_NAME]
    # Ping to verify connection
    await client.admin.command("ping")
    print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")


async def close_db():
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db