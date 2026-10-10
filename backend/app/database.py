import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger(__name__)

# Global variables to hold MongoDB client and database instances
client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo():
    """Initializes the motor AsyncIOMotorClient and stores the database reference."""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
        db = client[settings.DATABASE_NAME]
        # Verify connection by issuing a ping command
        await client.admin.command("ping")
        print("Successfully connected to MongoDB.")
        logger.info("Successfully connected to MongoDB at %s", settings.MONGODB_URI)
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        logger.error("Error connecting to MongoDB: %s", e)


async def close_mongo_connection():
    """Closes the motor MongoDB client connection."""
    global client, db
    try:
        if client is not None:
            client.close()
            client = None
            db = None
            print("MongoDB connection closed.")
            logger.info("MongoDB connection closed.")
    except Exception as e:
        print(f"Error closing MongoDB connection: {e}")
        logger.error("Error closing MongoDB connection: %s", e)


def get_database() -> AsyncIOMotorDatabase | None:
    """Helper function that returns the database instance."""
    global client, db
    if db is None and client is not None:
        db = client[settings.DATABASE_NAME]
    return db
