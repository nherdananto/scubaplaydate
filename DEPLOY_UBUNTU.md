# ScubaPlaydate — Ubuntu 22.04 Self-Host Deploy Guide

Target: self-hosted Ubuntu 22.04 VPS that already has **MongoDB** and **nginx** installed.

You will end up with:
- FastAPI backend on `127.0.0.1:8001` (systemd-managed)
- React build served as static files by nginx
- MongoDB content + user uploads migrated from the preview/dev DB
- HTTPS via Let's Encrypt (optional)

---

## 0. Prerequisites on the server

```bash
# Run as your sudo user on the server
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm git curl
# Yarn (classic) for the frontend build
sudo npm install -g yarn
# Verify Mongo is up
sudo systemctl status mongod
```

Pick a domain / IP you'll serve from, e.g. `scubaplaydate.com`. Replace it everywhere below.

---

## 1. Export everything from the current dev server

Run these **on the dev/preview environment** (where the app currently runs — /app), then copy to the server.

### 1a. Dump MongoDB data

```bash
# On dev (/app)
cd /tmp
mkdir -p scubaplaydate-export
# DB_NAME comes from /app/backend/.env — default is 'test_database'
DB_NAME=$(grep '^DB_NAME=' /app/backend/.env | cut -d'=' -f2)
MONGO_URL=$(grep '^MONGO_URL=' /app/backend/.env | cut -d'=' -f2)

mongodump --uri "$MONGO_URL" --db "$DB_NAME" --out scubaplaydate-export/db
# → creates scubaplaydate-export/db/<DB_NAME>/*.bson
```

### 1b. Tarball uploads + code

```bash
cd /tmp
# Uploaded images (banners, logos, seed images)
cp -r /app/frontend/public/uploads scubaplaydate-export/uploads
# App source (exclude node_modules + build)
rsync -a --exclude node_modules --exclude build --exclude .git /app/ scubaplaydate-export/app/

tar czf scubaplaydate-export.tar.gz scubaplaydate-export/
ls -lh scubaplaydate-export.tar.gz
```

### 1c. Copy to your server

From your local machine (or directly from dev if it has SSH access):

```bash
scp /tmp/scubaplaydate-export.tar.gz user@YOUR_SERVER_IP:/tmp/
```

---

## 2. Unpack on the server

```bash
# On server
sudo mkdir -p /var/www/scubaplaydate
sudo chown $USER:$USER /var/www/scubaplaydate
cd /var/www/scubaplaydate

tar xzf /tmp/scubaplaydate-export.tar.gz --strip-components=1
# You should now see: app/, db/, uploads/
```

---

## 3. Restore MongoDB

```bash
# Adjust DB name if you want a different one in production
mongorestore --db scubaplaydate /var/www/scubaplaydate/db/test_database
# Verify
mongosh --eval 'use scubaplaydate; db.articles.countDocuments({})'
```

---

## 4. Move code into place

```bash
sudo mv /var/www/scubaplaydate/app/backend  /var/www/scubaplaydate/backend
sudo mv /var/www/scubaplaydate/app/frontend /var/www/scubaplaydate/frontend
sudo rm -rf /var/www/scubaplaydate/app
```

### 4a. Move uploads to the public dir

```bash
mkdir -p /var/www/scubaplaydate/frontend/public/uploads
cp -r /var/www/scubaplaydate/uploads/* /var/www/scubaplaydate/frontend/public/uploads/
```

---

## 5. Backend setup (FastAPI)

```bash
cd /var/www/scubaplaydate/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt
```

### 5a. Production `.env`

```bash
cat > /var/www/scubaplaydate/backend/.env <<'EOF'
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=scubaplaydate
CORS_ORIGINS=https://scubaplaydate.com,https://www.scubaplaydate.com
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
EOF
# Generate a strong JWT secret
python3 -c "import secrets;print(secrets.token_urlsafe(48))"
# Paste the output into JWT_SECRET above (edit the file)
nano /var/www/scubaplaydate/backend/.env
```

> ⚠️ Replace `CHANGE_ME_...` with a real random string. Never reuse the dev JWT secret.

### 5b. systemd service

```bash
sudo tee /etc/systemd/system/scubaplaydate-backend.service > /dev/null <<'EOF'
[Unit]
Description=ScubaPlaydate FastAPI backend
After=network.target mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/scubaplaydate/backend
EnvironmentFile=/var/www/scubaplaydate/backend/.env
ExecStart=/var/www/scubaplaydate/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Let www-data read the files
sudo chown -R www-data:www-data /var/www/scubaplaydate

sudo systemctl daemon-reload
sudo systemctl enable --now scubaplaydate-backend
sudo systemctl status scubaplaydate-backend --no-pager

# Smoke test
curl -s http://127.0.0.1:8001/api/articles?limit=1 | head -c 200 && echo
```

---

## 6. Frontend build

```bash
cd /var/www/scubaplaydate/frontend

# Production env — the browser will call /api on the same domain,
# so use a relative-to-domain URL (no http/https prefix).
cat > .env.production <<'EOF'
REACT_APP_BACKEND_URL=https://scubaplaydate.com
REACT_APP_TINYMCE_API_KEY=8at83rd9smyi9qk4fuip7ofag7egov9mez24zp89l7qv31h6
EOF

yarn install --frozen-lockfile
yarn build   # produces /var/www/scubaplaydate/frontend/build
```

> If you're using HTTP only (no cert yet), set `REACT_APP_BACKEND_URL=http://scubaplaydate.com` or `http://YOUR_SERVER_IP` and rebuild later.

---

## 7. nginx config

```bash
sudo tee /etc/nginx/sites-available/scubaplaydate > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name scubaplaydate.com www.scubaplaydate.com;

    # Max upload size (images)
    client_max_body_size 10m;

    # Frontend static build
    root /var/www/scubaplaydate/frontend/build;
    index index.html;

    # User-uploaded images (banners, seed images, logos)
    location /uploads/ {
        alias /var/www/scubaplaydate/frontend/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # API → FastAPI on 127.0.0.1:8001
    location /api/ {
        proxy_pass         http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # SPA fallback: any other route → index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/scubaplaydate /etc/nginx/sites-enabled/scubaplaydate
sudo nginx -t
sudo systemctl reload nginx
```

Test it: `curl -I http://scubaplaydate.com/` → should return `200 OK`.

---

## 8. HTTPS with Let's Encrypt (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d scubaplaydate.com -d www.scubaplaydate.com
# Follow prompts. Certbot will auto-edit the nginx config and add the cert.
```

After certbot runs, **rebuild the frontend with `https://` in `.env.production`** (step 6) if you haven't already, then re-run `yarn build`.

---

## 9. Post-deploy smoke test

```bash
# Public site
curl -I https://scubaplaydate.com/
# API (through nginx)
curl -s https://scubaplaydate.com/api/articles?limit=1 | head -c 200 && echo
# Admin login
curl -s -X POST https://scubaplaydate.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@scubaplaydate.com","password":"Admin123!"}' | head -c 200
```

Then in the browser:
1. `https://scubaplaydate.com/` → homepage loads with seeded articles & images
2. `https://scubaplaydate.com/forinternalonly` → log in as admin
3. Upload a logo in Settings → check it appears on the site
4. Create a test article with an image → publish → view on public site

---

## 10. Updating the app later

```bash
# Pull new code
cd /var/www/scubaplaydate
# e.g. git pull, or rsync a new tarball from dev

# Backend
cd backend && source venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart scubaplaydate-backend

# Frontend
cd ../frontend && yarn install --frozen-lockfile && yarn build
sudo systemctl reload nginx   # nginx serves the new build/ directly
```

---

## 11. Backups (do this!)

Put this in `/etc/cron.daily/scubaplaydate-backup`:

```bash
sudo tee /etc/cron.daily/scubaplaydate-backup > /dev/null <<'EOF'
#!/bin/bash
set -e
STAMP=$(date +%F)
BACKUP_DIR=/var/backups/scubaplaydate
mkdir -p "$BACKUP_DIR"

# MongoDB
mongodump --db scubaplaydate --archive="$BACKUP_DIR/db-$STAMP.archive" --gzip

# Uploads
tar czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C /var/www/scubaplaydate/frontend/public uploads

# Keep last 14 days
find "$BACKUP_DIR" -name 'db-*.archive'       -mtime +14 -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz'  -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/scubaplaydate-backup
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `502 Bad Gateway` on `/api/*` | Backend not running | `sudo journalctl -u scubaplaydate-backend -n 100` |
| Images 404 from `/uploads/...` | Path or permissions | `ls /var/www/scubaplaydate/frontend/public/uploads` → must be readable by `www-data` |
| Frontend routes return 404 | SPA fallback missing | Ensure `try_files $uri $uri/ /index.html;` is in `location /` |
| Empty homepage / no articles | DB not restored or wrong DB_NAME | `mongosh --eval 'use scubaplaydate; db.articles.countDocuments({})'` → should be > 0 |
| CORS error in browser | Wrong `CORS_ORIGINS` | Edit `backend/.env`, restart `scubaplaydate-backend` |
| `mongorestore` complains about dup keys | DB already has data | Drop first: `mongosh scubaplaydate --eval 'db.dropDatabase()'` |

---

## What got migrated

- **Articles** (bilingual EN/ID, all subcategory samples, related articles)
- **Banners** (sidebar + bottom, with impression/click counters preserved)
- **Users** (admin + any writers — password hashes intact so everyone can log in)
- **Settings** (logo, tagline, GA id, AdSense id)
- **Uploaded images** (logos, banner images, article featured images in `/uploads/`)
- **Seed images** (`seed-*.jpg` for sample articles)

Everything the preview shows should show on production after steps 1–9.
