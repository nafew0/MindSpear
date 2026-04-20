# MindSpear Backend — Deployment Guide

Laravel 11 API for MindSpear on **PHP 8.4**. This file is a step-by-step backend deployment for a fresh Ubuntu 22.04 / 24.04 server. The root [../README.md](../README.md) has the bigger-picture architecture and Nginx details.

Design choices baked in:
- **Redis with default config** (no password, loopback bind — safe).
- **systemd** for long-running processes (no Supervisor).
- **PostgreSQL** for the database.

Follow sections top-to-bottom. Don't skip DNS.

---

## 0) DNS — do this first

At your DNS provider (Cloudflare / Namecheap / Route 53 / etc.) point these subdomains at your server's public IP:

| Subdomain | Type | Used by |
|---|---|---|
| `mindspear.app` | A | Next.js frontend |
| `www.mindspear.app` | A or CNAME | Redirect to apex |
| `api.mindspear.app` | A | Laravel API (this app) |
| `ws.mindspear.app` | A | Reverb WebSocket |

Wait a few minutes, then verify:

```bash
dig +short api.mindspear.app
dig +short ws.mindspear.app
```

Both must return your server's IP. **If they don't, stop — fix DNS first.** Nginx config and Let's Encrypt will fail otherwise.

---

## 1) Install system packages

Ondrej PPA ships PHP 8.4 for Ubuntu. Run everything below as a sudo user (not root, but can sudo).

```bash
# Update base + enable firewall
sudo apt update && sudo apt -y upgrade
sudo apt -y install ca-certificates curl gnupg git unzip ufw software-properties-common lsb-release
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw --force enable

# PHP 8.4 + extensions
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt -y install \
  php8.4 php8.4-fpm php8.4-cli php8.4-common \
  php8.4-pgsql php8.4-redis php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-bcmath php8.4-intl php8.4-gd php8.4-opcache

# Postgres, Redis, Nginx, Certbot
sudo apt -y install postgresql postgresql-client redis-server nginx certbot python3-certbot-nginx

# Composer
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
composer --version

# Node 20 + npm + PM2 (PM2 is used by the frontend; harmless here)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm install -g pm2
node -v && npm -v

# Start services
sudo systemctl enable --now php8.4-fpm redis-server postgresql nginx
```

### Verify

```bash
php -v                          # expect: PHP 8.4.x
php -m | grep -E 'pgsql|redis'  # both should be listed
redis-cli ping                  # expect: PONG
sudo -u postgres psql -c "SELECT version();"
```

If `redis-cli ping` returns `PONG`, Redis is good with its defaults — no config edits needed. Ubuntu's `/etc/redis/redis.conf` already binds to `127.0.0.1` only, and UFW only exposes 22/80/443, so no password is fine.

---

## 2) Create the PostgreSQL database and user

```bash
sudo -u postgres psql <<'SQL'
CREATE USER mindspear WITH PASSWORD 'REPLACE_WITH_STRONG_DB_PASSWORD';
CREATE DATABASE mindspear OWNER mindspear;
ALTER DATABASE mindspear SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mindspear TO mindspear;
SQL
```

Replace `REPLACE_WITH_STRONG_DB_PASSWORD` with a real password and **keep it** — you'll paste it into `.env` in step 4.

Quick connectivity test:

```bash
PGPASSWORD='your-password-here' psql -h 127.0.0.1 -U mindspear -d mindspear -c '\conninfo'
```

---

## 3) Clone the repo

```bash
sudo mkdir -p /var/www/mindspear
sudo chown -R $USER:www-data /var/www/mindspear
cd /var/www/mindspear
git clone <your-repo-url> .
```

You should now have `/var/www/mindspear/backend` and `/var/www/mindspear/frontend`.

---

## 4) Install the Laravel backend

```bash
cd /var/www/mindspear/backend
composer install --no-dev --optimize-autoloader --no-interaction
cp .env.production .env
```

Now **edit `.env`** (`nano .env`) and fill every `REPLACE_*`:

```dotenv
APP_NAME=MindSpear
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.mindspear.app

# Database (from step 2)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mindspear
DB_USERNAME=mindspear
DB_PASSWORD=your-db-password-from-step-2

# Redis + cache + queue + sessions — defaults, no password
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
BROADCAST_CONNECTION=reverb
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null
REDIS_DB=0
REDIS_CACHE_DB=1

# Reverb — generate fresh credentials (any random strings work; keep them secret)
REVERB_APP_ID=your-random-app-id
REVERB_APP_KEY=your-random-app-key
REVERB_APP_SECRET=your-random-app-secret
REVERB_HOST=ws.mindspear.app
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080
REVERB_ALLOWED_ORIGINS=https://mindspear.app
REVERB_SCALING_ENABLED=true

# Super Admin seed (used by SuperAdminSeeder)
SUPER_ADMIN_EMAIL=admin@mindspear.app
SUPER_ADMIN_PASSWORD=pick-a-strong-password

# Session cookie across subdomains
SESSION_DOMAIN=.mindspear.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

(SMTP/mail settings go in §7.)

Then run the install steps:

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder --force
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan event:cache && php artisan view:cache

# Let Nginx/PHP-FPM write to storage + cache
sudo chown -R www-data:www-data /var/www/mindspear/backend/storage /var/www/mindspear/backend/bootstrap/cache
```

### Smoke-test Redis from Laravel

```bash
php artisan tinker --execute="cache()->put('ping','ok',10); echo cache('ping');"
# expected output: ok
```

If you see `ok`, Laravel is talking to Redis. Done with this section.

---

## 5) Long-running processes — systemd units

Two background processes must stay running:

1. **Reverb** (WebSocket server) — always required.
2. **Queue worker** — required because `QUEUE_CONNECTION=redis`.

Create these two unit files:

### `/etc/systemd/system/mindspear-reverb.service`

```ini
[Unit]
Description=MindSpear Reverb WebSocket
After=network.target redis-server.service
Requires=redis-server.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mindspear/backend
ExecStart=/usr/bin/php8.4 artisan reverb:start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### `/etc/systemd/system/mindspear-queue.service`

```ini
[Unit]
Description=MindSpear queue worker
After=network.target redis-server.service
Requires=redis-server.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mindspear/backend
ExecStart=/usr/bin/php8.4 artisan queue:work redis --tries=3 --backoff=5 --sleep=1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Enable and start

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mindspear-reverb mindspear-queue
sudo systemctl status mindspear-reverb mindspear-queue
```

Both should say **active (running)**.

### After every deploy

```bash
cd /var/www/mindspear/backend
git pull
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan event:cache && php artisan view:cache
sudo chown -R www-data:www-data storage bootstrap/cache
sudo systemctl restart mindspear-reverb mindspear-queue php8.4-fpm
```

### Troubleshooting

```bash
sudo journalctl -u mindspear-reverb -f
sudo journalctl -u mindspear-queue -f
```

---

## 6) Super Admin panel (Filament)

Mounted at `/` and gated by the `Super Admin` role. Build assets once:

```bash
cd /var/www/mindspear/backend
npm ci
npm run build
php artisan filament:assets
php artisan optimize:clear
```

Access at `https://api.mindspear.app/`, log in with the `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` from `.env`, change the password from the profile menu.

---

## 7) Email (SMTP)

Emails are sent synchronously. Add these to `.env`:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.yourprovider.com
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@mindspear.app
MAIL_FROM_NAME="MindSpear"
```

Then reload config:

```bash
php artisan config:cache
```

---

## 8) Nginx + HTTPS

Two server blocks: one for the API, one for Reverb. Replace `/var/www/mindspear/backend/public` if your path differs.

### `/etc/nginx/sites-available/api.mindspear.app`

```nginx
server {
    listen 80;
    server_name api.mindspear.app;
    root /var/www/mindspear/backend/public;
    index index.php;

    client_max_body_size 50M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
    }

    location ~ /\.ht { deny all; }
}
```

### `/etc/nginx/sites-available/ws.mindspear.app`

```nginx
server {
    listen 80;
    server_name ws.mindspear.app;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:8080;
        proxy_read_timeout 3600s;
    }
}
```

### Enable + SSL

```bash
sudo ln -sf /etc/nginx/sites-available/api.mindspear.app /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/ws.mindspear.app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Issue certs (DNS must already resolve — see §0)
sudo certbot --nginx -d api.mindspear.app -d ws.mindspear.app
```

Certbot auto-adds `listen 443 ssl;` blocks and sets up auto-renewal.

---

## 9) Admin-only logs

Populated automatically by observers wired in `bootstrap/providers.php`:

- `login_logs` — every login attempt
- `activity_logs` — admin actions
- `email_logs` — outgoing mail

---

## 10) Redis troubleshooting

If Redis ever misbehaves, the fastest reset (keeps defaults intact):

```bash
redis-cli FLUSHALL                       # clear all data
sudo systemctl restart redis-server
redis-cli ping
```

Nuclear option (only if Redis won't start at all):

```bash
sudo systemctl stop redis-server
sudo rm -f /var/lib/redis/dump.rdb /var/lib/redis/appendonly.aof
sudo systemctl start redis-server
redis-cli ping
```

---

## Deploy checklist

1. DNS records resolve to this server.
2. `redis-cli ping` returns **PONG**.
3. `psql -h 127.0.0.1 -U mindspear -d mindspear -c '\conninfo'` connects.
4. `.env` filled (APP_KEY set, DB, Redis, Reverb, Super Admin, Mail).
5. `php artisan migrate --force` ran clean.
6. `php artisan tinker --execute="cache()->put('x',1,5); echo cache('x');"` prints **1**.
7. `systemctl status mindspear-reverb mindspear-queue php8.4-fpm nginx redis-server postgresql` — all **active (running)**.
8. `curl -I https://api.mindspear.app/` returns 200 or 302.
9. `wss://ws.mindspear.app` upgrades successfully (browser dev tools on a live quiz).
10. Super Admin login works at `https://api.mindspear.app/`.
