from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from passlib.context import CryptContext
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.environ.get('JWT_SECRET', 'scubaplaydate_secret_key_2025')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

UPLOAD_DIR = Path("/app/frontend/public/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class UserRole:
    ADMIN = "admin"
    EDITOR = "editor"
    WRITER = "writer"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: str = UserRole.WRITER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = UserRole.WRITER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    title_id: Optional[str] = None
    h2_subtitle: str
    h2_subtitle_id: Optional[str] = None
    content_html: str
    content_html_id: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    author_name: str
    slug: str
    featured: bool = False
    status: str = "draft"
    language: str = "en"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    featured_image: Optional[str] = None
    related_articles: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArticleCreate(BaseModel):
    title: str
    title_id: Optional[str] = None
    h2_subtitle: str
    h2_subtitle_id: Optional[str] = None
    content_html: str
    content_html_id: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    author_name: str
    slug: str
    featured: bool = False
    status: str = "draft"
    language: str = "en"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    featured_image: Optional[str] = None
    related_articles: List[str] = Field(default_factory=list)

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    parent_category: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    slug: str
    parent_category: Optional[str] = None

class Banner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image_url: str
    link_url: Optional[str] = None
    position: str
    clicks: int = 0
    impressions: int = 0
    active: bool = True

class BannerCreate(BaseModel):
    name: str
    image_url: str
    link_url: Optional[str] = None
    position: str
    active: bool = True

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    google_analytics_id: Optional[str] = None
    google_adsense_id: Optional[str] = None
    logo_url: Optional[str] = None

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate, _admin: User = Depends(require_admin)):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user_dict = user_data.model_dump()
    user_dict.pop("password")
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    doc["password_hash"] = hashed_pw
    doc["created_at"] = doc["created_at"].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["email"], "role": user["role"]})
    user_data = User(**user)
    return {"token": token, "user": user_data}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/users", response_model=List[User])
async def list_users(_admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for u in users:
        if isinstance(u.get("created_at"), str):
            u["created_at"] = datetime.fromisoformat(u["created_at"])
    return users

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, _admin: User = Depends(require_admin)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@api_router.post("/articles", response_model=Article)
async def create_article(article_data: ArticleCreate, current_user: User = Depends(get_current_user)):
    article_obj = Article(**article_data.model_dump())
    doc = article_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.articles.insert_one(doc)
    return article_obj

@api_router.get("/articles", response_model=List[Article])
async def list_articles(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    status: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 100
):
    query = {}
    if category:
        query["category"] = category
    if subcategory:
        # Case-insensitive exact match so lowercased URL slugs (e.g. "indonesia",
        # "marine life") still match DB values stored in proper case ("Indonesia",
        # "Marine Life").
        query["subcategory"] = {
            "$regex": f"^{re.escape(subcategory)}$",
            "$options": "i",
        }
    if status:
        query["status"] = status
    if featured is not None:
        query["featured"] = featured
    
    articles = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for a in articles:
        if isinstance(a.get("created_at"), str):
            a["created_at"] = datetime.fromisoformat(a["created_at"])
        if isinstance(a.get("updated_at"), str):
            a["updated_at"] = datetime.fromisoformat(a["updated_at"])
    return articles

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if isinstance(article.get("created_at"), str):
        article["created_at"] = datetime.fromisoformat(article["created_at"])
    if isinstance(article.get("updated_at"), str):
        article["updated_at"] = datetime.fromisoformat(article["updated_at"])
    return Article(**article)

@api_router.get("/articles/slug/{slug}", response_model=Article)
async def get_article_by_slug(slug: str):
    article = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if isinstance(article.get("created_at"), str):
        article["created_at"] = datetime.fromisoformat(article["created_at"])
    if isinstance(article.get("updated_at"), str):
        article["updated_at"] = datetime.fromisoformat(article["updated_at"])
    return Article(**article)

@api_router.put("/articles/{article_id}", response_model=Article)
async def update_article(article_id: str, article_data: ArticleCreate, current_user: User = Depends(get_current_user)):
    existing = await db.articles.find_one({"id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = article_data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.articles.update_one({"id": article_id}, {"$set": update_data})
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if isinstance(updated.get("created_at"), str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    if isinstance(updated.get("updated_at"), str):
        updated["updated_at"] = datetime.fromisoformat(updated["updated_at"])
    return Article(**updated)

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, current_user: User = Depends(get_current_user)):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted"}

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, current_user: User = Depends(get_current_user)):
    category_obj = Category(**category_data.model_dump())
    doc = category_obj.model_dump()
    await db.categories.insert_one(doc)
    return category_obj

@api_router.get("/categories", response_model=List[Category])
async def list_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return categories

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user: User = Depends(get_current_user)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

@api_router.post("/banners", response_model=Banner)
async def create_banner(banner_data: BannerCreate, _admin: User = Depends(require_admin)):
    banner_obj = Banner(**banner_data.model_dump())
    doc = banner_obj.model_dump()
    await db.banners.insert_one(doc)
    return banner_obj

@api_router.get("/banners", response_model=List[Banner])
async def list_banners(active: Optional[bool] = None):
    query = {}
    if active is not None:
        query["active"] = active
    banners = await db.banners.find(query, {"_id": 0}).to_list(1000)
    return banners

@api_router.put("/banners/{banner_id}", response_model=Banner)
async def update_banner(banner_id: str, banner_data: BannerCreate, _admin: User = Depends(require_admin)):
    await db.banners.update_one({"id": banner_id}, {"$set": banner_data.model_dump()})
    updated = await db.banners.find_one({"id": banner_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Banner not found")
    return Banner(**updated)

@api_router.delete("/banners/{banner_id}")
async def delete_banner(banner_id: str, _admin: User = Depends(require_admin)):
    result = await db.banners.delete_one({"id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"message": "Banner deleted"}

@api_router.post("/banners/{banner_id}/click")
async def track_banner_click(banner_id: str):
    banner = await db.banners.find_one({"id": banner_id})
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.banners.update_one({"id": banner_id}, {"$inc": {"clicks": 1}})
    return {"message": "Click tracked"}

@api_router.post("/banners/{banner_id}/impression")
async def track_banner_impression(banner_id: str):
    banner = await db.banners.find_one({"id": banner_id})
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.banners.update_one({"id": banner_id}, {"$inc": {"impressions": 1}})
    return {"message": "Impression tracked"}

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        return Settings()
    return Settings(**settings)

@api_router.post("/settings", response_model=Settings)
async def update_settings(settings_data: Settings, _admin: User = Depends(require_admin)):
    await db.settings.delete_many({})
    doc = settings_data.model_dump()
    await db.settings.insert_one(doc)
    return settings_data

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}")
    
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB")
    
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    with file_path.open("wb") as buffer:
        buffer.write(contents)
    
    return {"url": f"/uploads/{filename}", "filename": filename}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_seed():
    admin_exists = await db.users.find_one({"email": "admin@scubaplaydate.com"})
    if not admin_exists:
        hashed_pw = hash_password("Admin123!")
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": "admin@scubaplaydate.com",
            "role": UserRole.ADMIN,
            "password_hash": hashed_pw,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Admin user created: admin@scubaplaydate.com / Admin123!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()