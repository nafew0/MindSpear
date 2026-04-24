# MindSpear Production Reset + Clean Deploy Guide

This is the recommended deployment path for a clean Ubuntu 24.04 server running only MindSpear.

Use this guide for **server1**. Do **not** deploy MindSpear onto server2 while it is serving other real-user Django/React/PostgreSQL apps unless you first isolate it in a separate VM/container. MindSpear needs its own Nginx vhosts, PostgreSQL database, Redis, PHP-FPM, Laravel Reverb WebSockets, and a Next.js process. Those pieces can collide with existing production apps through Nginx defaults, ports, Redis DBs, certificates, process managers, and package upgrades.

The production host assumed here is:

- Frontend: `https://mindspear.app`
- Laravel API: `https://mindspear.app/api/v1`
- Broadcast auth: `https://mindspear.app/broadcasting/auth`
- Reverb WebSocket: `wss://mindspear.app/app/...`

Nginx exposes one public domain and routes paths internally:

- `/` and most frontend routes -> Next.js on `127.0.0.1:2000`
- `/api/v1`, `/broadcasting/auth`, `/up`, `/super-admin`, `/storage`, and Laravel/Filament assets -> Laravel/PHP-FPM
- `/app` and `/apps` -> Laravel Reverb on `127.0.0.1:8080`

The app stack in this repo is **Laravel 12 + PostgreSQL + Redis + Reverb + Next.js 15**.

## Recommendation

Best option:

1. Rebuild server1 from your VPS/provider panel as a fresh **Ubuntu 24.04 LTS** server.
2. Point only these DNS records to server1: `mindspear.app`, `www.mindspear.app`.
3. Remove or repoint old testing records such as `api.mindspear.app`, `ws.mindspear.app`, `new.mindspear.app`, `admin.new.mindspear.app`, and `admin.mindspear.app`.
4. Run the clean deploy below.

Second-best option:

Use the destructive in-server purge below, then run the clean deploy. This is less clean than an OS rebuild because package repositories, global Node packages, old certificates, and old Nginx fragments can still leave traces if a command is missed.

## Why The Current Server Looks Suspicious

Your Nginx logs show requests for old hosts such as `admin.mindspear.app`, `new.mindspear.app`, and `admin.new.mindspear.app` being handled by the `api.mindspear.app` server block. That usually means one or both of these are true:

- Old DNS records still point to server1.
- Nginx is using the API vhost as the default for unmatched hosts.

That may not be the only live-hosting bug, but it can absolutely break live quiz/quest hosting because browser `Origin`, CORS, Sanctum broadcast auth, and Reverb allowed origins all depend on the exact host used by the browser.

This guide adds an explicit Nginx default reject vhost so unknown old domains do not silently hit the API app.

It also removes the separate `api.mindspear.app` and `ws.mindspear.app` production hosts. Same-domain routing is simpler for this app because the browser origin stays `https://mindspear.app` for the frontend, API, broadcast auth, and WebSocket connection.

## Before You Start

Have these ready:

- Git repo URL.
- SSH key or deploy token that can clone the repo.
- A real admin email for Let's Encrypt.
- A fresh OpenAI API key if production uses OpenAI.
- SMTP settings, or temporarily use a non-production mail setup.

Generate secrets on the server when needed:

```bash
openssl rand -hex 16   # IDs/password fragments
openssl rand -hex 20   # public Reverb app key
openssl rand -hex 32   # private secrets
```

## DNS Checklist

Before Certbot:

```bash
dig +short mindspear.app
dig +short www.mindspear.app
```

Both should return server1's public IP.

Also check old hosts:

```bash
dig +short api.mindspear.app
dig +short ws.mindspear.app
dig +short new.mindspear.app
dig +short admin.new.mindspear.app
dig +short admin.mindspear.app
```

These should not point to server1 unless you intentionally add them to Nginx, CORS, and Reverb allowed origins. The clean production setup should not use them.

## Environment File Policy

Keep backend and frontend env files separate.

This is better than a single shared `.env` because the two runtimes load env files differently and have different security boundaries:

- Laravel reads `backend/.env` at runtime. This file contains server-only secrets such as database password, `APP_KEY`, `REVERB_APP_SECRET`, SMTP credentials, and admin seeder credentials.
- Next.js reads frontend env during build/start. Any variable prefixed with `NEXT_PUBLIC_` is intentionally baked into browser JavaScript. Server-only frontend values such as `OPENAI_API_KEY` must never be renamed with `NEXT_PUBLIC_`.

The naming difference is framework convention, not a MindSpear invention:

- Backend production runtime file: `/var/www/mindspear/backend/.env` (Laravel standard).
- Frontend production secret override: `/var/www/mindspear/frontend/.env.production.local` (Next.js standard for machine-local production values that should not be committed).

The committed `frontend/.env.production` and local ignored `backend/.env.production` are templates. On the server, copy them to the real runtime files, then put real values in the runtime files.

A single top-level env file is possible with a deploy script that generates both runtime files, but do not symlink one file into both apps. That makes it too easy to leak backend-only secrets into a frontend build.

## Destructive Purge For Server1

Skip this section if you rebuild the OS from your VPS/provider panel.

Run this only on server1, and only if server1 can be deleted completely.

```bash
set -e

# Stop app-level processes.
sudo systemctl stop mindspear-frontend mindspear-reverb mindspear-queue 2>/dev/null || true
sudo systemctl disable mindspear-frontend mindspear-reverb mindspear-queue 2>/dev/null || true
sudo rm -f /etc/systemd/system/mindspear-frontend.service
sudo rm -f /etc/systemd/system/mindspear-reverb.service
sudo rm -f /etc/systemd/system/mindspear-queue.service
sudo systemctl daemon-reload

# Stop and remove PM2 leftovers from the old deployment style.
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sudo npm uninstall -g pm2 2>/dev/null || true
sudo rm -rf /root/.pm2 /home/*/.pm2
for u in $(systemctl list-unit-files --type=service | awk 'tolower($1) ~ /^pm2/ {print $1}'); do
  sudo systemctl disable --now "$u" 2>/dev/null || true
  sudo rm -f "/etc/systemd/system/$u"
done
sudo systemctl daemon-reload

# Remove MindSpear files, logs, cron, Nginx fragments, and certbot data.
sudo rm -rf /var/www/mindspear /var/log/mindspear
sudo rm -f /etc/nginx/sites-enabled/*mindspear*
sudo rm -f /etc/nginx/sites-available/*mindspear*
sudo rm -f /etc/nginx/conf.d/*mindspear*
sudo crontab -u www-data -r 2>/dev/null || true
sudo rm -rf /etc/letsencrypt /var/lib/letsencrypt /var/log/letsencrypt

# Drop old database and user if PostgreSQL is still present.
if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql <<'SQL' || true
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mindspear';
DROP DATABASE IF EXISTS mindspear;
DROP USER IF EXISTS mindspear;
SQL
fi

# Purge packages used by the old MindSpear deployment.
sudo apt purge -y 'php8.4*' composer nodejs nginx certbot python3-certbot-nginx redis-server postgresql-16 postgresql-client-16 2>/dev/null || true
sudo apt autoremove -y --purge
sudo apt autoclean

# Remove common residual config directories after package purge.
sudo rm -rf /etc/nginx /etc/php/8.4 /etc/redis /var/lib/redis

sudo reboot
```

After reboot, reconnect and continue with the clean deploy.

## Clean Deploy

Run as `root` or a sudo-capable deploy user. If you use a non-root user, keep the same commands and use `sudo` where shown.

### 1. Base Packages

```bash
sudo apt update
sudo apt -y upgrade

sudo apt -y install \
  ca-certificates curl gnupg git unzip ufw software-properties-common lsb-release \
  build-essential pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
  nginx certbot python3-certbot-nginx redis-server \
  postgresql-16 postgresql-client-16
```

### 2. Firewall

Only expose SSH, HTTP, and HTTPS. Reverb listens on localhost and is proxied through Nginx.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

### 3. PHP 8.4

```bash
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt -y install \
  php8.4 php8.4-fpm php8.4-cli php8.4-common \
  php8.4-pgsql php8.4-redis php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-bcmath php8.4-intl php8.4-gd php8.4-opcache
```

Edit `/etc/php/8.4/fpm/php.ini`:

```ini
memory_limit = 512M
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 60
expose_php = Off
display_errors = Off
log_errors = On
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0
```

```bash
sudo systemctl enable --now php8.4-fpm
sudo systemctl restart php8.4-fpm
```

### 4. Composer And Node.js 20

```bash
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
composer --version

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
node -v
npm -v
```

Expected Node major version: `20`.

### 5. PostgreSQL And Redis

```bash
sudo systemctl enable --now postgresql redis-server nginx
redis-cli ping
```

Expected Redis output: `PONG`.

Create the database:

```bash
DB_PASSWORD='REPLACE_WITH_STRONG_DB_PASSWORD'

sudo -u postgres psql <<SQL
CREATE USER mindspear WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE mindspear OWNER mindspear;
GRANT ALL PRIVILEGES ON DATABASE mindspear TO mindspear;
ALTER DATABASE mindspear SET timezone TO 'UTC';
SQL
```

Keep this `DB_PASSWORD`; it must go into `backend/.env`.

### 6. Clone The App

```bash
sudo mkdir -p /var/www/mindspear
sudo chown -R "$USER":www-data /var/www/mindspear
cd /var/www/mindspear
git clone REPLACE_REPO_URL .
```

### 7. Backend Environment

```bash
cd /var/www/mindspear/backend
composer install --no-dev --optimize-autoloader --no-interaction
cp .env.production .env
chmod 600 .env
```

Edit `/var/www/mindspear/backend/.env`.

Required production values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://mindspear.app
FRONTEND_URL=https://mindspear.app
CORS_ALLOWED_ORIGINS=https://mindspear.app,https://www.mindspear.app
SANCTUM_STATEFUL_DOMAINS=
SESSION_DOMAIN=.mindspear.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mindspear
DB_USERNAME=mindspear
DB_PASSWORD=REPLACE_WITH_STRONG_DB_PASSWORD

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
BROADCAST_CONNECTION=reverb
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
REDIS_DB=0
REDIS_CACHE_DB=1

REVERB_APP_ID=REPLACE_WITH_RANDOM_ID
REVERB_APP_KEY=REPLACE_WITH_RANDOM_PUBLIC_KEY
REVERB_APP_SECRET=REPLACE_WITH_RANDOM_SECRET
REVERB_HOST=mindspear.app
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080
REVERB_ALLOWED_ORIGINS=https://mindspear.app,https://www.mindspear.app
REVERB_SCALING_ENABLED=true
```

Important:

- `REDIS_PASSWORD=null` must match default Redis with no password.
- `REVERB_APP_KEY` must be copied exactly into the frontend env.
- `REVERB_HOST=mindspear.app` is public-facing. The Reverb daemon still listens privately on `127.0.0.1:8080`.
- Do not include old hosts like `new.mindspear.app` unless you intentionally serve production from them.

Finish backend setup:

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder --force
php artisan storage:link

php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache

sudo chown -R www-data:www-data storage bootstrap/cache
sudo find storage -type d -exec chmod 775 {} \;
sudo find storage -type f -exec chmod 664 {} \;
```

### 8. Frontend Environment And Build

```bash
cd /var/www/mindspear/frontend
cp .env.production .env.production.local
chmod 600 .env.production.local
```

Edit `/var/www/mindspear/frontend/.env.production.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://mindspear.app/api/v1
NEXT_PUBLIC_REVERB_APP_KEY=REPLACE_WITH_SAME_BACKEND_REVERB_APP_KEY
NEXT_PUBLIC_REVERB_HOST=mindspear.app
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
APP_URL=https://mindspear.app
OPENAI_API_KEY=REPLACE_WITH_REAL_OPENAI_KEY
```

Build:

```bash
npm ci
npm run build
sudo chown -R www-data:www-data /var/www/mindspear/frontend/.next
```

### 9. systemd Services

This guide uses systemd for all long-running app processes. PM2 is intentionally not used.

Create `/etc/systemd/system/mindspear-frontend.service`:

```ini
[Unit]
Description=MindSpear Next.js frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mindspear/frontend
Environment=NODE_ENV=production
Environment=PORT=2000
ExecStart=/usr/bin/node /var/www/mindspear/frontend/node_modules/next/dist/bin/next start -p 2000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/mindspear-reverb.service`:

```ini
[Unit]
Description=MindSpear Laravel Reverb WebSocket
After=network.target redis-server.service
Requires=redis-server.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mindspear/backend
ExecStart=/usr/bin/php8.4 artisan reverb:start --host=127.0.0.1 --port=8080
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/mindspear-queue.service`:

```ini
[Unit]
Description=MindSpear Laravel queue worker
After=network.target redis-server.service postgresql.service
Requires=redis-server.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mindspear/backend
ExecStart=/usr/bin/php8.4 artisan queue:work redis --queue=default,broadcasts --sleep=1 --tries=3 --backoff=3 --max-time=3600 --max-jobs=1000 --timeout=60
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Start services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mindspear-frontend mindspear-reverb mindspear-queue
sudo systemctl status mindspear-frontend mindspear-reverb mindspear-queue --no-pager
```

Check local listeners:

```bash
ss -ltnp | grep -E ':2000|:8080|:5432|:6379'
curl -I http://127.0.0.1:2000
```

### 10. Nginx

Remove the default site:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Create `/etc/nginx/sites-available/00-reject-unknown-hosts`:

```nginx
server {
    listen 80 default_server;
    server_name _;
    return 444;
}

server {
    listen 443 ssl default_server;
    server_name _;
    ssl_reject_handshake on;
}
```

Create `/etc/nginx/sites-available/api.mindspear.app`:

```nginx
server {
    listen 80;
    server_name api.mindspear.app;

    root /var/www/mindspear/backend/public;
    index index.php;
    client_max_body_size 50M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 60s;
    }

    location ~ /\.(?!well-known).* { deny all; }
    location ~* \.(?:env|log|sqlite)$ { deny all; }

    access_log /var/log/nginx/api.mindspear.app.access.log;
    error_log  /var/log/nginx/api.mindspear.app.error.log;
}
```

Create `/etc/nginx/sites-available/ws.mindspear.app`:

```nginx
server {
    listen 80;
    server_name ws.mindspear.app;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }

    access_log /var/log/nginx/ws.mindspear.app.access.log;
    error_log  /var/log/nginx/ws.mindspear.app.error.log;
}
```

Create `/etc/nginx/sites-available/mindspear.app`:

```nginx
server {
    listen 80;
    server_name www.mindspear.app;
    return 301 https://mindspear.app$request_uri;
}

server {
    listen 80;
    server_name mindspear.app;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:2000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:2000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    access_log /var/log/nginx/mindspear.app.access.log;
    error_log  /var/log/nginx/mindspear.app.error.log;
}
```

Enable sites:

```bash
sudo ln -s /etc/nginx/sites-available/00-reject-unknown-hosts /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/mindspear.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.mindspear.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ws.mindspear.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 11. TLS

Run Certbot only after DNS is correct.

```bash
sudo certbot --nginx \
  -d mindspear.app -d www.mindspear.app \
  -d api.mindspear.app \
  -d ws.mindspear.app \
  --redirect --agree-tos -m REPLACE_ADMIN_EMAIL --no-eff-email

sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status certbot.timer --no-pager
```

### 12. Scheduler

```bash
echo '* * * * * cd /var/www/mindspear/backend && /usr/bin/php8.4 artisan schedule:run >> /dev/null 2>&1' | sudo crontab -u www-data -
```

## Post-Deploy Verification

### Services

```bash
sudo systemctl status nginx php8.4-fpm postgresql redis-server --no-pager
sudo systemctl status mindspear-frontend mindspear-reverb mindspear-queue --no-pager
```

### HTTP

```bash
curl -I https://mindspear.app
curl -I https://api.mindspear.app/up
curl -I https://ws.mindspear.app
```

Expected:

- `https://mindspear.app` returns `200` or a valid app redirect.
- `https://api.mindspear.app/up` returns `200`.
- `https://ws.mindspear.app` may return `404`, `400`, or `426` for plain HTTP-style curl. That is acceptable because real clients use WebSocket upgrade.

### CORS Preflight For Broadcast Auth

```bash
curl -i -X OPTIONS https://api.mindspear.app/broadcasting/auth \
  -H 'Origin: https://mindspear.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type'
```

Expected headers include:

```text
access-control-allow-origin: https://mindspear.app
access-control-allow-methods:
access-control-allow-headers:
```

### Reverb Browser Test

Open `https://mindspear.app`, then run this in the browser console:

```js
const ws = new WebSocket("wss://ws.mindspear.app/app/REPLACE_WITH_REVERB_APP_KEY?protocol=7&client=js&version=8.4.0&flash=false");
ws.onopen = () => console.log("reverb open");
ws.onerror = (event) => console.error("reverb error", event);
ws.onmessage = (event) => console.log(event.data);
```

Expected: `reverb open`.

### Live Quest/Quiz Smoke Test

1. Log in at `https://mindspear.app`.
2. Create or open a quiz/quest.
3. Start a live session.
4. Join from a second browser/device using the public link or code.
5. Confirm the host screen participant count changes without refresh.
6. Start a question/task.
7. Submit from the participant device.
8. Confirm the host screen receives the live update without refresh.

## Debugging Live Hosting

Use these in separate terminals while reproducing the problem:

```bash
sudo journalctl -u mindspear-reverb -f
sudo journalctl -u mindspear-queue -f
sudo journalctl -u mindspear-frontend -f
sudo tail -f /var/log/nginx/api.mindspear.app.error.log /var/log/nginx/ws.mindspear.app.error.log
tail -f /var/www/mindspear/backend/storage/logs/laravel-*.log
```

Useful checks:

```bash
cd /var/www/mindspear/backend
php artisan about
php artisan route:list | grep broadcasting
php artisan tinker --execute="cache()->put('ping','ok',10); echo cache('ping');"
php artisan queue:failed
```

If WebSocket opens but no live events arrive:

- Confirm `BROADCAST_CONNECTION=reverb`.
- Confirm `REVERB_APP_KEY` equals `NEXT_PUBLIC_REVERB_APP_KEY`.
- Run `php artisan optimize:clear && php artisan config:cache`.
- Restart Reverb: `sudo systemctl restart mindspear-reverb`.
- Restart the frontend after rebuilding: `sudo systemctl restart mindspear-frontend`.

If `/broadcasting/auth` returns `401`:

- The browser is not sending a valid bearer token.
- The frontend may be using the wrong API base URL.
- Check browser devtools for the exact request URL and `Authorization` header.

If `/broadcasting/auth` fails CORS:

- Check `CORS_ALLOWED_ORIGINS`.
- Run `php artisan config:cache`.
- Reload PHP-FPM: `sudo systemctl reload php8.4-fpm`.

If Reverb rejects origin:

- Check `REVERB_ALLOWED_ORIGINS`.
- Do not browse from old hosts like `admin.new.mindspear.app`.
- Run `php artisan config:cache`.
- Restart Reverb.

If old hosts still reach the app:

```bash
sudo nginx -T | grep -nE 'new\.mindspear|admin\.mindspear|server_name|default_server'
dig +short new.mindspear.app
dig +short admin.new.mindspear.app
dig +short admin.mindspear.app
```

Remove the DNS records or add explicit reject vhosts. Do not let them silently route to `api.mindspear.app`.

## Update Workflow After The First Deploy

```bash
cd /var/www/mindspear
git pull

cd /var/www/mindspear/backend
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
php artisan queue:restart
sudo systemctl restart mindspear-reverb mindspear-queue
sudo systemctl reload php8.4-fpm

cd /var/www/mindspear/frontend
npm ci
npm run build
sudo chown -R www-data:www-data /var/www/mindspear/frontend/.next
sudo systemctl restart mindspear-frontend

sudo nginx -t
sudo systemctl reload nginx
```

## Quick Answer: Server1 Or Server2?

Use server1.

Server2 already has production users. MindSpear adds a different runtime family and WebSocket stack. That is not worth risking when server1 can be rebuilt or purged. A fresh server1 also gives us a clear failure boundary: if live hosting still fails after this guide, the problem is likely app configuration or code, not old hosting residue.
