# ScubaPlaydate — Ubuntu 22.04 Self-Host Deploy Guide

Target: self-hosted Ubuntu 22.04 VPS that already has:
- **MongoDB** installed and running
- **nginx** installed and running
- **An existing FastAPI app** on port **8001** serving **oceamordive.com** — ⚠️ must NOT be disturbed

ScubaPlaydate will run as a **second, fully isolated** app on the same server:
- Backend: FastAPI on `127.0.0.1:8002` (new port, separate systemd service)
- MongoDB database: `scubaplaydate` (separate from whatever oceamordive uses)
- Frontend: static build served by nginx on `scubaplaydate.com`
- Code directory: `/var/www/scubaplaydate/` (isolated from the existing app)

Both sites will coexist behind the same nginx, each with its own server block.

---

## 0. Prerequisites on the server

You already have Python + nginx + Mongo. Just make sure these are present:

```bash
# Run as your sudo user on the server
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm git curl rsync
# Yarn (classic) for the frontend build
sudo npm install -g yarn

# Sanity
sudo systemctl status mongod   --no-pager | head -5
sudo systemctl status nginx    --no-pager | head -5
# Confirm port 8001 is already in use by the existing app
sudo ss -tlnp | grep ':8001'
# Confirm 8002 is FREE — we'll use it
sudo ss -tlnp | grep ':8002' || echo "port 8002 is free ✓"
```

> If port 8002 is also taken, pick any free port (e.g. 8003, 8004). Replace `8002` everywhere below with your choice.

---

## 1. Export everything from the current dev/preview environment

Run these **on the dev/preview environment** (where the app currently runs — /app), then copy to the server.

### 1a. Dump MongoDB data

```bash
cd /tmp
mkdir -p scubaplaydate-export
DB_NAME=$(grep '^DB_NAME=' /app/backend/.env | cut -d'=' -f2)
MONGO_URL=$(grep '^MONGO_URL=' /app/backend/.env | cut -d'=' -f2)

mongodump --uri "$MONGO_URL" --db "$DB_NAME" --out scubaplaydate-export/db
# → scubaplaydate-export/db/<DB_NAME>/*.bson
```

### 1b. Tarball uploads + code

```bash
cd /tmp
cp -r /app/frontend/public/uploads scubaplaydate-export/uploads
rsync -a --exclude node_modules --exclude build --exclude .git /app/ scubaplaydate-export/app/

tar czf scubaplaydate-export.tar.gz scubaplaydate-export/
ls -lh scubaplaydate-export.tar.gz
```

### 1c. Copy to your server

```bash
# From local machine (or directly from dev)
scp /tmp/scubaplaydate-export.tar.gz user@YOUR_SERVER_IP:/tmp/
```

---

## 2. Unpack on the server (isolated directory)

```bash
sudo mkdir -p /var/www/scubaplaydate
sudo chown $USER:$USER /var/www/scubaplaydate
cd /var/www/scubaplaydate

tar xzf /tmp/scubaplaydate-export.tar.gz --strip-components=1
# You should now see: app/, db/, uploads/
```

---

## 3. Restore MongoDB into its OWN database

The DB name `scubaplaydate` is separate from whatever `oceamordive` uses — they live in the same mongod instance without touching each other.

```bash
# Adjust the source path if your DB_NAME wasn't 'test_database' on dev
mongorestore --db scubaplaydate /var/www/scubaplaydate/db/test_database

# Sanity check
mongosh --quiet --eval 'use scubaplaydate; db.articles.countDocuments({})'
# List all DBs — should see BOTH your oceamordive DB and 'scubaplaydate'
mongosh --quiet --eval 'show dbs'
```

> ⚠️ **Do not** drop any existing database. `mongorestore` only writes into `scubaplaydate`.

---

## 4. Move code into place

```bash
sudo mv /var/www/scubaplaydate/app/backend  /var/www/scubaplaydate/backend
sudo mv /var/www/scubaplaydate/app/frontend /var/www/scubaplaydate/frontend
sudo rm -rf /var/www/scubaplaydate/app

mkdir -p /var/www/scubaplaydate/frontend/public/uploads
cp -r /var/www/scubaplaydate/uploads/* /var/www/scubaplaydate/frontend/public/uploads/
```

---

## 5. Backend setup (FastAPI on PORT 8002, separate venv)

The existing oceamordive app has its own Python venv. We create a **new, independent** venv for ScubaPlaydate so dependency versions never conflict.

```bash
cd /var/www/scubaplaydate/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt
deactivate

# Ensure uploads dir exists and is writable by the service user
sudo mkdir -p /var/www/scubaplaydate/frontend/public/uploads
sudo chown -R www-data:www-data /var/www/scubaplaydate
```

### 5a. Production `.env`

```bash
cat > /var/www/scubaplaydate/backend/.env <<'EOF'
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=scubaplaydate
CORS_ORIGINS=https://scubaplaydate.com,https://www.scubaplaydate.com
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
UPLOAD_DIR=/var/www/scubaplaydate/frontend/public/uploads
EOF

# Generate a strong JWT secret, then paste it in
python3 -c "import secrets;print(secrets.token_urlsafe(48))"
nano /var/www/scubaplaydate/backend/.env   # replace CHANGE_ME_...
```

> ⚠️ Use a JWT secret different from the one oceamordive uses.

### 5b. systemd service (unique name → no collision with oceamordive)

Note the **port 8002** and the **unique service name** `scubaplaydate-backend`:

```bash
sudo tee /etc/systemd/system/scubaplaydate-backend.service > /dev/null <<'EOF'
[Unit]
Description=ScubaPlaydate FastAPI backend (port 8002)
After=network.target mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/scubaplaydate/backend
EnvironmentFile=/var/www/scubaplaydate/backend/.env
ExecStart=/var/www/scubaplaydate/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8002 --workers 2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo chown -R www-data:www-data /var/www/scubaplaydate

sudo systemctl daemon-reload
sudo systemctl enable --now scubaplaydate-backend

# Check both backends are now running
sudo systemctl status scubaplaydate-backend --no-pager | head -10
sudo ss -tlnp | grep -E ':(8001|8002)'
# Expect to see BOTH 8001 (oceamordive) and 8002 (scubaplaydate)

# Smoke test
curl -s http://127.0.0.1:8002/api/articles?limit=1 | head -c 200 && echo
```

---

## 6. Frontend build

```bash
cd /var/www/scubaplaydate/frontend

cat > .env.production <<'EOF'
REACT_APP_BACKEND_URL=https://scubaplaydate.com
REACT_APP_TINYMCE_API_KEY=8at83rd9smyi9qk4fuip7ofag7egov9mez24zp89l7qv31h6
EOF

yarn install --frozen-lockfile
yarn build   # output → /var/www/scubaplaydate/frontend/build
```

---

## 7. nginx — ADD a new server block (don't touch oceamordive's)

You'll have **two server blocks in total** — nginx picks the right one based on `server_name`.

```bash
# Confirm oceamordive.com has its own config — DO NOT edit it
ls /etc/nginx/sites-enabled/
sudo nginx -T | grep -B1 'server_name' | head -20
```

Create a **new** file for ScubaPlaydate:

```bash
sudo tee /etc/nginx/sites-available/scubaplaydate > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name scubaplaydate.com www.scubaplaydate.com;

    client_max_body_size 10m;

    root /var/www/scubaplaydate/frontend/build;
    index index.html;

    # User-uploaded images
    location /uploads/ {
        alias /var/www/scubaplaydate/frontend/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # API → FastAPI on 127.0.0.1:8002 (NOT 8001 — that's oceamordive)
    location /api/ {
        proxy_pass         http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # React Router SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/scubaplaydate /etc/nginx/sites-enabled/scubaplaydate
sudo nginx -t && sudo systemctl reload nginx
```

> Both sites now share nginx. Requests for `oceamordive.com` go to its existing server block (port 8001). Requests for `scubaplaydate.com` go to the new one (port 8002). They don't see each other.

Test both:
```bash
curl -I http://oceamordive.com/     # should still work (200 or 301)
curl -I http://scubaplaydate.com/   # new site
```

---

## 8. DNS

Point the domain's A record (and `www` CNAME) to your server's public IP:

```
scubaplaydate.com      A     YOUR_SERVER_IP
www.scubaplaydate.com  CNAME scubaplaydate.com
```

Wait ~5–30 min for DNS to propagate, then continue.

---

## 9. HTTPS with Let's Encrypt

Get a cert just for ScubaPlaydate — won't touch the oceamordive cert:

```bash
# Certbot is probably already installed for oceamordive
sudo certbot --nginx -d scubaplaydate.com -d www.scubaplaydate.com
```

If the frontend was built with `http://` URLs, rebuild with `https://`:
```bash
cd /var/www/scubaplaydate/frontend
sed -i 's|http://scubaplaydate.com|https://scubaplaydate.com|' .env.production
yarn build
```

Certbot auto-renewal is a shared cron on the server — both domains renew together.

---

## 10. Smoke test

```bash
# Both backends running
sudo systemctl status scubaplaydate-backend --no-pager | head -5
sudo ss -tlnp | grep -E ':(8001|8002)'

# Public site
curl -I https://scubaplaydate.com/
curl -s https://scubaplaydate.com/api/articles?limit=1 | head -c 200 && echo

# Admin login
curl -s -X POST https://scubaplaydate.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@scubaplaydate.com","password":"Admin123!"}' | head -c 200 && echo

# Most importantly — oceamordive still works
curl -I https://oceamordive.com/
```

Browser check:
1. `https://scubaplaydate.com/` → homepage with seeded articles
2. `https://scubaplaydate.com/forinternalonly` → admin login (`admin@scubaplaydate.com` / `Admin123!`)
3. `https://oceamordive.com/` → still works, untouched

---

## 11. Updating ScubaPlaydate later

Only touches the ScubaPlaydate service — oceamordive unaffected:

```bash
cd /var/www/scubaplaydate
# pull new code (git or rsync new tarball)

cd backend && source venv/bin/activate && pip install -r requirements.txt && deactivate
sudo systemctl restart scubaplaydate-backend

cd ../frontend && yarn install --frozen-lockfile && yarn build
sudo systemctl reload nginx
```

---

## 12. Backups

```bash
sudo tee /etc/cron.daily/scubaplaydate-backup > /dev/null <<'EOF'
#!/bin/bash
set -e
STAMP=$(date +%F)
BACKUP_DIR=/var/backups/scubaplaydate
mkdir -p "$BACKUP_DIR"

# Only the scubaplaydate DB — oceamordive has its own backup
mongodump --db scubaplaydate --archive="$BACKUP_DIR/db-$STAMP.archive" --gzip

tar czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C /var/www/scubaplaydate/frontend/public uploads

find "$BACKUP_DIR" -name 'db-*.archive'      -mtime +14 -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/scubaplaydate-backup
```

---

## Isolation summary — how both apps stay separate

| Resource | oceamordive (existing) | scubaplaydate (new) |
|---|---|---|
| Code path | your existing dir | `/var/www/scubaplaydate/` |
| Python venv | oceamordive's venv | `/var/www/scubaplaydate/backend/venv/` |
| systemd service | *(existing name)* | `scubaplaydate-backend` |
| Backend port | `8001` | `8002` |
| MongoDB database | *(existing DB)* | `scubaplaydate` |
| Uploads dir | *(its own)* | `/var/www/scubaplaydate/frontend/public/uploads/` |
| nginx server block | `/etc/nginx/sites-enabled/oceamordive` | `/etc/nginx/sites-enabled/scubaplaydate` |
| JWT secret | *(its own)* | separate, generated in step 5a |
| TLS cert | oceamordive's | scubaplaydate's (step 9) |

No shared state. Restarting one service has zero impact on the other.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `PermissionError: [Errno 13] Permission denied: '/app'` in service logs | Old `UPLOAD_DIR` hardcoded to `/app/...` | Add `UPLOAD_DIR=/var/www/scubaplaydate/frontend/public/uploads` to `backend/.env`, restart the service |
| `502 Bad Gateway` on `scubaplaydate.com/api/*` | ScubaPlaydate backend down | `sudo journalctl -u scubaplaydate-backend -n 100` |
| **oceamordive suddenly 502** | You accidentally edited its nginx block or its systemd service | `sudo nginx -T` → diff against backup; `sudo systemctl status <oceamordive-service>` |
| Port 8002 already in use | Something else grabbed it | `sudo ss -tlnp \| grep 8002` → kill or pick 8003 and update the service + nginx |
| Both sites resolve to the same app | nginx default_server or server_name mismatch | `sudo nginx -T \| grep -A3 server_name` → make sure each has its own `server_name` |
| Images 404 from `/uploads/...` | Permissions or wrong path | `ls -la /var/www/scubaplaydate/frontend/public/uploads` → must be readable by `www-data` |
| Mongo: can't tell which DB is whose | Run `mongosh --quiet --eval 'show dbs'` — yours are named `scubaplaydate` and whatever oceamordive picked |
| DB restore complains "already exists" | Previous restore ran | `mongosh scubaplaydate --eval 'db.dropDatabase()'` then re-run `mongorestore` |

---

## What gets migrated from dev

- **Articles** (bilingual EN/ID, all subcategory samples, related articles)
- **Banners** (sidebar + bottom, with impression/click counters preserved)
- **Users** (admin + any writers — password hashes intact so everyone can still log in)
- **Settings** (logo, tagline, GA id, AdSense id)
- **Uploaded images** (logos, banner images, article featured images)
- **Seed images** (`seed-*.jpg` for sample articles)

Everything the preview shows will show on production after steps 1–10.
