import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

async def seed_banners():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if banners already exist
    existing = await db.banners.count_documents({})
    if existing > 0:
        print(f"Banners already exist ({existing} found). Skipping seed.")
        return
    
    seed_banners = [
        {
            "id": str(uuid.uuid4()),
            "name": "Sidebar Sample Banner - Diving Gear Sale",
            "image_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=250&fit=crop",
            "link_url": "https://example.com/gear-sale",
            "position": "sidebar",
            "clicks": 0,
            "impressions": 0,
            "active": True
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bottom Sample Banner - Scuba Course Promo",
            "image_url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=970&h=90&fit=crop",
            "link_url": "https://example.com/courses",
            "position": "bottom",
            "clicks": 0,
            "impressions": 0,
            "active": True
        }
    ]
    
    result = await db.banners.insert_many(seed_banners)
    print(f"✓ Seeded {len(result.inserted_ids)} banners successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_banners())
