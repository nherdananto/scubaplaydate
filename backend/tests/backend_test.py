"""Backend API tests for ScubaPlaydate CMS"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://plunge-daily.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@scubaplaydate.com"
ADMIN_PASSWORD = "Admin123!"

created_ids = {"users": [], "articles": [], "banners": [], "categories": []}


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# Auth
def test_login_success():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "token" in data and data["user"]["email"] == ADMIN_EMAIL and data["user"]["role"] == "admin"


def test_login_invalid():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_auth_me(admin_headers):
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_protected_no_token():
    r = requests.get(f"{BASE_URL}/api/users")
    assert r.status_code in (401, 403)


# Users
def test_user_crud(admin_headers):
    email = f"TEST_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Pass123!", "role": "writer"}, headers=admin_headers)
    assert r.status_code == 200, r.text
    uid = r.json()["id"]
    created_ids["users"].append(uid)
    assert r.json()["email"] == email and r.json()["role"] == "writer"

    # List
    r = requests.get(f"{BASE_URL}/api/users", headers=admin_headers)
    assert r.status_code == 200
    assert any(u["id"] == uid for u in r.json())

    # Duplicate
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "Pass123!", "role": "writer"}, headers=admin_headers)
    assert r.status_code == 400

    # Delete
    r = requests.delete(f"{BASE_URL}/api/users/{uid}", headers=admin_headers)
    assert r.status_code == 200


# Articles
def test_article_crud(admin_headers):
    payload = {
        "title": "TEST Article", "h2_subtitle": "Sub", "content_html": "<p>Hi</p>",
        "category": "news", "subcategory": "industry", "author_name": "Admin",
        "slug": f"test-{uuid.uuid4().hex[:6]}", "featured": True, "status": "published",
        "seo_title": "T", "seo_description": "D", "seo_keywords": "k", "featured_image": "/uploads/x.jpg"
    }
    r = requests.post(f"{BASE_URL}/api/articles", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    aid = r.json()["id"]
    created_ids["articles"].append(aid)
    assert r.json()["title"] == "TEST Article" and r.json()["featured"] is True

    # GET by id
    r = requests.get(f"{BASE_URL}/api/articles/{aid}")
    assert r.status_code == 200 and r.json()["slug"] == payload["slug"]

    # GET by slug
    r = requests.get(f"{BASE_URL}/api/articles/slug/{payload['slug']}")
    assert r.status_code == 200 and r.json()["id"] == aid

    # List with filters
    r = requests.get(f"{BASE_URL}/api/articles?category=news&featured=true")
    assert r.status_code == 200 and any(a["id"] == aid for a in r.json())

    # Update
    upd = {**payload, "title": "TEST Updated"}
    r = requests.put(f"{BASE_URL}/api/articles/{aid}", json=upd, headers=admin_headers)
    assert r.status_code == 200 and r.json()["title"] == "TEST Updated"

    # Verify persistence
    r = requests.get(f"{BASE_URL}/api/articles/{aid}")
    assert r.json()["title"] == "TEST Updated"

    # Delete
    r = requests.delete(f"{BASE_URL}/api/articles/{aid}", headers=admin_headers)
    assert r.status_code == 200
    r = requests.get(f"{BASE_URL}/api/articles/{aid}")
    assert r.status_code == 404


def test_article_404():
    r = requests.get(f"{BASE_URL}/api/articles/nonexistent-id")
    assert r.status_code == 404


# Banners
def test_banner_crud_and_tracking(admin_headers):
    payload = {"name": "TEST Banner", "image_url": "/uploads/b.jpg", "link_url": "https://x.com", "position": "top", "active": True}
    r = requests.post(f"{BASE_URL}/api/banners", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    bid = r.json()["id"]
    created_ids["banners"].append(bid)

    # List
    r = requests.get(f"{BASE_URL}/api/banners?active=true")
    assert r.status_code == 200 and any(b["id"] == bid for b in r.json())

    # Track impression
    requests.post(f"{BASE_URL}/api/banners/{bid}/impression")
    requests.post(f"{BASE_URL}/api/banners/{bid}/impression")
    requests.post(f"{BASE_URL}/api/banners/{bid}/click")
    r = requests.get(f"{BASE_URL}/api/banners")
    b = next(x for x in r.json() if x["id"] == bid)
    assert b["impressions"] >= 2 and b["clicks"] >= 1

    # Update
    upd = {**payload, "name": "TEST Banner Upd"}
    r = requests.put(f"{BASE_URL}/api/banners/{bid}", json=upd, headers=admin_headers)
    assert r.status_code == 200 and r.json()["name"] == "TEST Banner Upd"

    # Delete
    r = requests.delete(f"{BASE_URL}/api/banners/{bid}", headers=admin_headers)
    assert r.status_code == 200


# Settings
def test_settings(admin_headers):
    r = requests.get(f"{BASE_URL}/api/settings")
    assert r.status_code == 200

    payload = {"google_analytics_id": "GA-TEST-123", "google_adsense_id": "ADS-TEST-456"}
    r = requests.post(f"{BASE_URL}/api/settings", json=payload, headers=admin_headers)
    assert r.status_code == 200

    r = requests.get(f"{BASE_URL}/api/settings")
    assert r.json()["google_analytics_id"] == "GA-TEST-123"


# Upload
def test_upload(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    files = {"file": ("test.png", b"\x89PNG\r\n\x1a\nfakepngdata", "image/png")}
    r = requests.post(f"{BASE_URL}/api/upload", files=files, headers=headers)
    assert r.status_code == 200
    assert r.json()["url"].startswith("/uploads/")


# Role-based access (non-admin can't manage users/banners)
def test_role_based_access(admin_headers):
    email = f"TEST_writer_{uuid.uuid4().hex[:6]}@test.com"
    r = requests.post(f"{BASE_URL}/api/auth/register", json={"email": email, "password": "P@ss123", "role": "writer"}, headers=admin_headers)
    assert r.status_code == 200
    uid = r.json()["id"]

    rl = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "P@ss123"})
    writer_token = rl.json()["token"]
    wh = {"Authorization": f"Bearer {writer_token}", "Content-Type": "application/json"}

    # Writer should NOT access users list
    r = requests.get(f"{BASE_URL}/api/users", headers=wh)
    assert r.status_code == 403

    # Writer should NOT create banners
    r = requests.post(f"{BASE_URL}/api/banners", json={"name": "x", "image_url": "/u.jpg", "position": "top"}, headers=wh)
    assert r.status_code == 403

    requests.delete(f"{BASE_URL}/api/users/{uid}", headers=admin_headers)
