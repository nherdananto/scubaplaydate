import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

async def seed_articles():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if articles already exist
    existing = await db.articles.count_documents({})
    if existing > 0:
        print(f"Articles already exist ({existing} found). Skipping seed.")
        return
    
    seed_articles = [
        {
            "id": str(uuid.uuid4()),
            "title": "Top 10 Dive Sites in Raja Ampat",
            "h2_subtitle": "Discover the most spectacular underwater landscapes in Indonesia's biodiversity hotspot",
            "content_html": "<p>Raja Ampat, located in West Papua, Indonesia, is renowned as one of the most biodiverse marine regions on Earth. With over 1,500 species of fish and 600 species of coral, it's a diver's paradise.</p><h3>Why Raja Ampat?</h3><p>The region offers pristine reefs, dramatic walls, and abundant marine life including manta rays, sharks, and rare pygmy seahorses.</p>",
            "category": "Destinations",
            "subcategory": "Indonesia",
            "author_name": "Sarah Mitchell",
            "slug": "top-10-dive-sites-raja-ampat",
            "featured": True,
            "status": "published",
            "seo_title": "Top 10 Dive Sites in Raja Ampat - ScubaPlaydate",
            "seo_description": "Explore the best diving locations in Raja Ampat, Indonesia",
            "seo_keywords": "raja ampat, diving, indonesia, scuba, marine biodiversity",
            "featured_image": "https://images.unsplash.com/photo-1631102403791-8e33d9be6603?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwbWFyaW5lJTIwbGlmZSUyMHR1cnRsZXxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85",
            "related_articles": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "New Marine Protected Area Announced in the Coral Triangle",
            "h2_subtitle": "Conservation milestone as 50,000 hectares of reef ecosystem receives protection status",
            "content_html": "<p>Environmental authorities have announced the establishment of a new marine protected area covering 50,000 hectares in the Coral Triangle region.</p><h3>Conservation Impact</h3><p>This initiative aims to protect critical spawning grounds and nursery habitats for numerous marine species.</p>",
            "category": "News",
            "subcategory": "Conservation",
            "author_name": "Dr. James Chen",
            "slug": "new-marine-protected-area-coral-triangle",
            "featured": True,
            "status": "published",
            "seo_title": "New Marine Protected Area in Coral Triangle",
            "seo_description": "Major conservation news as new MPA is established",
            "seo_keywords": "marine conservation, coral triangle, MPA, protected area",
            "featured_image": "https://images.unsplash.com/photo-1623409300746-1e96643dbdb4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHx1bmRlcndhdGVyJTIwbWFyaW5lJTIwbGlmZSUyMHR1cnRsZXxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85",
            "related_articles": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Review: Scubapro MK25 EVO Regulator",
            "h2_subtitle": "In-depth testing of Scubapro's flagship regulator in various diving conditions",
            "content_html": "<p>The Scubapro MK25 EVO represents the pinnacle of regulator technology, combining exceptional breathing performance with robust construction.</p><h3>Performance</h3><p>During our tests in cold water and at depth, the MK25 EVO delivered smooth, effortless breathing throughout.</p>",
            "category": "Gear",
            "subcategory": "Reviews",
            "author_name": "Mike Thompson",
            "slug": "review-scubapro-mk25-evo-regulator",
            "featured": True,
            "status": "published",
            "seo_title": "Scubapro MK25 EVO Regulator Review",
            "seo_description": "Comprehensive review of the Scubapro MK25 EVO",
            "seo_keywords": "scubapro, mk25 evo, regulator, scuba gear, review",
            "featured_image": "https://static.prod-images.emergentagent.com/jobs/e052bca8-dbf8-4933-8039-fac54198bda4/images/24eff4407ef00897f0c1d1e4036c6158f07f8167c9fe957e6b521f2f0eecd323.png",
            "related_articles": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Mastering Underwater Photography: Essential Tips",
            "h2_subtitle": "From composition to lighting, learn the fundamentals of capturing stunning underwater images",
            "content_html": "<p>Underwater photography presents unique challenges and opportunities. This guide covers essential techniques for beginners and intermediate photographers.</p><h3>Lighting Techniques</h3><p>Natural light is your best friend in shallow water. Learn to position yourself relative to the sun for optimal illumination.</p>",
            "category": "Photography",
            "subcategory": "Tutorials",
            "author_name": "Emma Rodriguez",
            "slug": "mastering-underwater-photography-tips",
            "featured": False,
            "status": "published",
            "seo_title": "Underwater Photography Tips - Master the Art",
            "seo_description": "Learn essential underwater photography techniques",
            "seo_keywords": "underwater photography, tips, camera, lighting, composition",
            "featured_image": "https://images.unsplash.com/photo-1548065822-2cd6b99550f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxzY3ViYSUyMGRpdmVyJTIwdW5kZXJ3YXRlcnxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85",
            "related_articles": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": str(uuid.uuid4()),
            "title": "5 Essential Safety Checks Before Every Dive",
            "h2_subtitle": "Pre-dive safety protocols that could save your life",
            "content_html": "<p>Proper pre-dive safety checks are non-negotiable. Follow these five essential steps before every dive to ensure your equipment is functioning correctly.</p><h3>1. Check Your Air</h3><p>Verify tank pressure and ensure your regulator delivers air smoothly.</p>",
            "category": "Training",
            "subcategory": "Safety",
            "author_name": "Captain John Davis",
            "slug": "5-essential-safety-checks-before-dive",
            "featured": False,
            "status": "published",
            "seo_title": "Pre-Dive Safety Checks - Essential Protocol",
            "seo_description": "Critical safety checks every diver must perform",
            "seo_keywords": "dive safety, pre-dive checks, scuba safety, diving protocol",
            "featured_image": "https://images.unsplash.com/photo-1628371190872-df8c9dee1093?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxzY3ViYSUyMGRpdmVyJTIwdW5kZXJ3YXRlcnxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85",
            "related_articles": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    ]
    
    result = await db.articles.insert_many(seed_articles)
    print(f"✓ Seeded {len(result.inserted_ids)} articles successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_articles())
