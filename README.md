# MindSpear — Production Deployment Guide

Production hosting guide for MindSpear (Laravel 11 + Next.js 14 + Laravel Reverb) on **Ubuntu 24.04** with domain **mindspear.app**.

- **Frontend:** `https://mindspear.app` (Next.js)
- **Backend API:** `https://api.mindspear.app` (Laravel + PHP-FPM + Nginx)
- **Reverb WSS:** `wss://ws.mindspear.app` (Laravel Reverb behind Nginx)

Design choices baked in:
- **PHP 8.4** via the Ondrej PPA.
- **Redis with default config** — loopback-only bind, no password, no AOF tweaking. Safe because UFW only exposes 22/80/443.
- **systemd** for long-running backend processes (Reverb + queue worker). No Supervisor.
- **PM2** for the Next.js frontend.

---

## Architecture at a Glance

| Concern | Dev command | Production equivalent |
|---|---|---|
| HTTP app | `php artisan serve` | Nginx + **PHP-FPM 8.4** (systemd) |
| Queues | `php artisan queue:work redis --tries=3` | **systemd** → `mindspear-queue.service` |
| Redis | `redis-server` | **systemd redis-server**, default config |
| WebSockets | `php artisan reverb:start --host=0.0.0.0 --port=8080 --debug` | **systemd** → `mindspear-reverb.service` (no `--debug`), behind Nginx WSS |
| Frontend | `npm run dev` | **PM2** → `next start` behind Nginx |

> PHP-FPM, PostgreSQL, Redis, Nginx, Reverb, and the queue worker are all under **systemd** — one tool, one log stream (`journalctl`), no extra packages. PM2 manages the Next.js process because Next's cluster mode plays nicely with it.

---

## Quick Start (sequential — fresh Ubuntu 24.04)

Run top-to-bottom. DNS for `mindspear.app`, `www.mindspear.app`, `api.mindspear.app`, `ws.mindspear.app` must already resolve to this server. Everything tagged `REPLACE_*` is listed in [§11 Replace Before Go-Live](#11-replace-before-go-live).

```bash
# 1) Base + firewall
sudo apt update && sudo apt -y upgrade
sudo apt -y install ca-certificates curl gnupg git unzip ufw software-properties-common lsb-release \
  nginx certbot python3-certbot-nginx redis-server \
  postgresql-16 postgresql-client-16
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw --force enable

# 2) PHP 8.4
sudo add-apt-repository -y ppa:ondrej/php && sudo apt update
sudo apt -y install php8.4 php8.4-fpm php8.4-cli php8.4-common \
  php8.4-pgsql php8.4-redis php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-bcmath php8.4-intl php8.4-gd php8.4-opcache

# 3) Composer + Node 20 + PM2
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs && sudo npm install -g pm2

# 4) Services + Database (Redis uses default config — no editing)
sudo systemctl enable --now php8.4-fpm postgresql redis-server nginx
redis-cli ping                         # expect: PONG
sudo -u postgres psql -c "CREATE USER mindspear WITH PASSWORD 'REPLACE_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE mindspear OWNER mindspear;"
sudo -u postgres psql -c "ALTER DATABASE mindspear SET timezone TO 'UTC';"

# 5) Clone
sudo mkdir -p /var/www/mindspear
sudo chown -R $USER:www-data /var/www/mindspear
cd /var/www/mindspear
git clone REPLACE_REPO_URL .

# 6) Backend
cd /var/www/mindspear/backend
composer install --no-dev --optimize-autoloader --no-interaction
cp .env.production .env
# edit .env — fill REPLACE_* values (DB/Reverb/Mail), keep REDIS_PASSWORD=null — see §11
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder --force
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan event:cache && php artisan view:cache
sudo chown -R www-data:www-data storage bootstrap/cache

# 7) Frontend
cd /var/www/mindspear/frontend
cp .env.production .env.production.local
# edit .env.production.local — fill REPLACE_* values — see §11
npm ci && npm run build
pm2 start ecosystem.config.js && pm2 save
pm2 startup systemd -u $USER --hp $HOME        # run the sudo command it prints

# 8) systemd units (queue worker + Reverb)
# paste the two unit files from §3 into /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mindspear-reverb mindspear-queue
sudo systemctl status mindspear-reverb mindspear-queue

# 9) Nginx — HTTP-only first (§4). Do NOT add 443/ssl manually; certbot adds it.
# paste the three vhosts from §4 into /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/mindspear.app     /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.mindspear.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ws.mindspear.app  /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 10) TLS — certbot rewrites the vhosts to add the 443 server blocks automatically
sudo certbot --nginx \
  -d mindspear.app -d www.mindspear.app \
  -d api.mindspear.app \
  -d ws.mindspear.app \
  --redirect --agree-tos -m REPLACE_ADMIN_EMAIL --no-eff-email

# 11) Laravel scheduler
echo '* * * * * cd /var/www/mindspear/backend && php /usr/bin/php8.4 artisan schedule:run >> /dev/null 2>&1' | sudo crontab -u www-data -
```

Everything below is the long version with the why, the config files to paste, and post-deploy operations.

---

## 1. Provision the Server

### 1.1 Base packages

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install ca-certificates curl gnupg git unzip ufw software-properties-common lsb-release
```

### 1.2 Firewall (allow SSH + HTTP/HTTPS only — Reverb is proxied through Nginx)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 1.3 PHP 8.4 + extensions

```bash
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt -y install php8.4 php8.4-fpm php8.4-cli php8.4-common \
  php8.4-pgsql php8.4-redis php8.4-mbstring php8.4-xml php8.4-curl \
  php8.4-zip php8.4-bcmath php8.4-intl php8.4-gd php8.4-opcache
```

Harden `/etc/php/8.4/fpm/php.ini` (production values):

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
sudo systemctl restart php8.4-fpm
sudo systemctl enable php8.4-fpm
```

### 1.4 Composer

```bash
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
composer --version
```

### 1.5 Node.js 20 LTS + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm install -g pm2
node -v && npm -v
```

### 1.6 PostgreSQL 16

```bash
sudo apt -y install postgresql-16 postgresql-client-16
sudo systemctl enable --now postgresql
```

Create DB + user:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER mindspear WITH PASSWORD 'REPLACE_WITH_STRONG_DB_PASSWORD';
CREATE DATABASE mindspear OWNER mindspear;
GRANT ALL PRIVILEGES ON DATABASE mindspear TO mindspear;
ALTER DATABASE mindspear SET timezone TO 'UTC';
SQL
```

### 1.7 Redis — default config, no editing

Install and enable. **Do not edit `/etc/redis/redis.conf`** — the defaults already do exactly what we want.

```bash
sudo apt -y install redis-server
sudo systemctl enable --now redis-server
redis-cli ping                         # expect: PONG
```

Why the defaults are safe:

| Default setting | What it does | Why it's fine |
|---|---|---|
| `bind 127.0.0.1 -::1` | Listens on loopback only | Nothing outside the server can reach Redis |
| `protected-mode yes` | Refuses external connections if no password is set | Belt-and-braces with the bind above |
| no `requirepass` | No password required locally | Combined with the loopback bind + UFW (only 22/80/443 open), it's not exposed |

If you ever want password protection later, add `requirepass <secret>` to the conf and update `REDIS_PASSWORD` in backend `.env` accordingly. For now, keep it default — it's one fewer moving part.

### 1.8 Nginx + Certbot

```bash
sudo apt -y install nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
```

---

## 2. Deploy the Backend

### 2.1 Clone

```bash
sudo mkdir -p /var/www/mindspear
sudo chown -R $USER:www-data /var/www/mindspear
cd /var/www/mindspear
git clone <YOUR_REPO_URL> .
```

### 2.2 Install + env

```bash
cd /var/www/mindspear/backend
composer install --no-dev --optimize-autoloader --no-interaction
cp .env.production .env   # see template in §6
php artisan key:generate --force
```

### 2.3 Migrate + cache

```bash
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder --force   # if needed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
```

### 2.4 Permissions

```bash
sudo chown -R www-data:www-data /var/www/mindspear/backend/storage /var/www/mindspear/backend/bootstrap/cache
sudo find /var/www/mindspear/backend/storage -type d -exec chmod 775 {} \;
sudo find /var/www/mindspear/backend/storage -type f -exec chmod 664 {} \;
```

### 2.5 Smoke-test Redis from Laravel

```bash
php artisan tinker --execute="cache()->put('ping','ok',10); echo cache('ping');"
# expected output: ok
```

### 2.6 Laravel scheduler (cron)

```bash
sudo crontab -u www-data -e
```

Append:

```
* * * * * cd /var/www/mindspear/backend && /usr/bin/php8.4 artisan schedule:run >> /dev/null 2>&1
```

---

## 3. systemd — The Two Background Processes

Ubuntu ships with systemd, so we use it for Reverb and the queue worker. No extra packages.

### 3.1 `/etc/systemd/system/mindspear-reverb.service`

```ini
[Unit]
Description=MindSpear Reverb WebSocket
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
StandardOutput=append:/var/log/mindspear/reverb.log
StandardError=append:/var/log/mindspear/reverb.log

[Install]
WantedBy=multi-user.target
```

### 3.2 `/etc/systemd/system/mindspear-queue.service`

```ini
[Unit]
Description=MindSpear queue worker
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
StandardOutput=append:/var/log/mindspear/queue.log
StandardError=append:/var/log/mindspear/queue.log

[Install]
WantedBy=multi-user.target
```

### 3.3 Flag notes

- `--sleep=1 --tries=3 --backoff=3` — modest retry, no busy loop.
- `--max-time=3600 --max-jobs=1000` — worker auto-exits every hour or 1000 jobs so leaked memory never accumulates. systemd restarts it immediately via `Restart=always`.
- `--timeout=60` — kill stuck jobs after 60 seconds.
- `--queue=default,broadcasts` — priority order; `broadcasts` gets picked first so live-aggregate events don't queue behind slow jobs.
- Reverb: **no `--debug`**. Debug mode logs every frame and is very expensive under load.
- Reverb binds to `127.0.0.1:8080` — Nginx handles TLS on `wss://ws.mindspear.app:443`.

### 3.4 Enable + start

```bash
sudo mkdir -p /var/log/mindspear
sudo chown www-data:www-data /var/log/mindspear
sudo systemctl daemon-reload
sudo systemctl enable --now mindspear-reverb mindspear-queue
sudo systemctl status mindspear-reverb mindspear-queue     # both should be "active (running)"
```

### 3.5 Want two queue workers?

systemd uses **template units** for parallel instances. Rename the file to `mindspear-queue@.service` (note the `@`) and start `mindspear-queue@1` and `mindspear-queue@2`. For most deployments, a single worker is plenty — scale only if the queue backs up.

### 3.6 Day-to-day

```bash
sudo systemctl restart mindspear-reverb mindspear-queue   # after a deploy
sudo systemctl status  mindspear-reverb mindspear-queue   # quick health check
sudo journalctl -u mindspear-reverb -f                    # tail Reverb
sudo journalctl -u mindspear-queue  -f                    # tail queue
```

After every deploy that touches code:

```bash
php artisan queue:restart                     # tells workers to exit after current job; systemd respawns them
sudo systemctl restart mindspear-reverb       # Reverb needs a hard restart to pick up code changes
```

---

## 4. Nginx — Three Virtual Hosts

> **Important:** these vhosts listen on **port 80 only**. Do **not** add `listen 443 ssl`, `ssl_certificate`, or `ssl_certificate_key` by hand — `certbot --nginx` rewrites each file to add the HTTPS server block and the HTTP→HTTPS redirect automatically. If you pre-add SSL directives before the cert files exist, `nginx -t` will fail.

### 4.1 Backend API — `/etc/nginx/sites-available/api.mindspear.app`

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

### 4.2 Reverb WebSocket — `/etc/nginx/sites-available/ws.mindspear.app`

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

### 4.3 Frontend — `/etc/nginx/sites-available/mindspear.app`

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

    # Next.js static assets — cache aggressively
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

> After `certbot --nginx ... --redirect` runs, re-check these files: you'll see new `listen 443 ssl` blocks and a small `if ($host = ...)` redirect in the port-80 block. That's expected.

### 4.4 Enable + TLS

Point these DNS A records at the server IP before running certbot:

- `mindspear.app`, `www.mindspear.app`
- `api.mindspear.app`
- `ws.mindspear.app`

```bash
sudo ln -s /etc/nginx/sites-available/mindspear.app     /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.mindspear.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/ws.mindspear.app  /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx \
  -d mindspear.app -d www.mindspear.app \
  -d api.mindspear.app \
  -d ws.mindspear.app \
  --redirect --agree-tos -m admin@mindspear.app --no-eff-email

sudo systemctl status certbot.timer    # auto-renew is enabled by default
```

---

## 5. Deploy the Frontend (Next.js + PM2)

```bash
cd /var/www/mindspear/frontend
cp .env.production .env.production.local   # see §6
npm ci
npm run build
```

Create `/var/www/mindspear/frontend/ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: "mindspear-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 2000",
      cwd: "/var/www/mindspear/frontend",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 2000,
      },
      max_memory_restart: "512M",
      error_file: "/var/log/mindspear/frontend.err.log",
      out_file: "/var/log/mindspear/frontend.out.log",
      merge_logs: true,
    },
  ],
};
```

Start + persist across reboots:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp $HOME    # run the command it prints back with sudo
```

Redeploy:

```bash
cd /var/www/mindspear/frontend
git pull && npm ci && npm run build
pm2 reload mindspear-frontend
```

---

## 6. Production `.env` Templates

### 6.1 Backend — `/var/www/mindspear/backend/.env.production`

```env
# ============================================
# MindSpear Backend — PRODUCTION
# ============================================
APP_NAME=MindSpear
APP_ENV=production
APP_KEY=                                  # run: php artisan key:generate --force
APP_DEBUG=false
APP_URL=https://api.mindspear.app
APP_TIMEZONE=UTC
APP_LOCALE=en
APP_FALLBACK_LOCALE=en

FRONTEND_URL=https://mindspear.app
CORS_ALLOWED_ORIGINS=https://mindspear.app
SANCTUM_STATEFUL_DOMAINS=mindspear.app
SESSION_DOMAIN=.mindspear.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

# Logging
LOG_CHANNEL=daily
LOG_STACK=daily
LOG_LEVEL=warning
LOG_DAYS=14

# ============================================
# Database (PostgreSQL)
# ============================================
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mindspear
DB_USERNAME=mindspear
DB_PASSWORD=REPLACE_WITH_STRONG_DB_PASSWORD

# ============================================
# Cache / Queue / Session / Broadcast
# Redis runs with default config — no password.
# ============================================
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

# ============================================
# Laravel Reverb (WebSockets)
# Public endpoint is wss://ws.mindspear.app (Nginx proxies to 127.0.0.1:8080)
# ============================================
REVERB_APP_ID=REPLACE_WITH_REAL_APP_ID
REVERB_APP_KEY=REPLACE_WITH_REAL_APP_KEY
REVERB_APP_SECRET=REPLACE_WITH_STRONG_APP_SECRET

# What the Laravel app advertises to Echo clients (browser-facing)
REVERB_HOST=ws.mindspear.app
REVERB_PORT=443
REVERB_SCHEME=https

# Where the reverb:start process listens (server-internal)
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080

REVERB_ALLOWED_ORIGINS=https://mindspear.app
REVERB_SCALING_ENABLED=true

# ============================================
# Mail (switch "log" → real SMTP before go-live)
# ============================================
MAIL_MAILER=smtp
MAIL_HOST=smtp.REPLACE.com
MAIL_PORT=587
MAIL_USERNAME=REPLACE
MAIL_PASSWORD=REPLACE
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@mindspear.app"
MAIL_FROM_NAME="${APP_NAME}"

# ============================================
# S3 (optional)
# ============================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# ============================================
# Social auth
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://mindspear.app/auth/google/callback
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=https://mindspear.app/auth/microsoft/callback

# ============================================
# Super admin seeder
# ============================================
SUPER_ADMIN_EMAIL=admin@mindspear.app
SUPER_ADMIN_PASSWORD=REPLACE_WITH_STRONG_ADMIN_PASSWORD

# Hide PHP/server internals
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12
```

### 6.2 Frontend — `/var/www/mindspear/frontend/.env.production`

```env
# ============================================
# MindSpear Frontend — PRODUCTION
# ============================================

NEXT_PUBLIC_API_BASE_URL=https://api.mindspear.app/api/v1

# Must match backend REVERB_APP_KEY exactly
NEXT_PUBLIC_REVERB_APP_KEY=REPLACE_WITH_REAL_APP_KEY
NEXT_PUBLIC_REVERB_HOST=ws.mindspear.app
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https

APP_URL=https://mindspear.app

# Server-side only; never expose with NEXT_PUBLIC_
OPENAI_API_KEY=REPLACE_WITH_REAL_OPENAI_KEY
```

> **Security:** rotate the OpenAI key that was committed to the local `.env` before go-live. Anything that lived in git history should be treated as compromised.

---

## 7. Deployment Workflow (post-initial-setup)

```bash
cd /var/www/mindspear
git pull

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache
php artisan queue:restart                 # graceful worker recycle
sudo systemctl restart mindspear-reverb   # Reverb needs a hard restart
sudo systemctl reload php8.4-fpm          # opcache picks up new bytecode

# Frontend
cd ../frontend
npm ci
npm run build
pm2 reload mindspear-frontend
```

Put that in `/usr/local/bin/mindspear-deploy.sh` once it stabilises.

---

## 8. Health Checks

```bash
# Core systemd services
systemctl status php8.4-fpm nginx redis-server postgresql \
                 mindspear-reverb mindspear-queue

# Reverb listening on loopback
ss -tlnp | grep 8080

# Frontend
pm2 status

# Redis reachable from Laravel
php artisan tinker --execute="cache()->put('x',1,5); echo cache('x');"   # expect: 1

# End-to-end
curl -sI https://api.mindspear.app/api/v1/health || true
curl -sI https://mindspear.app
```

Verify WSS from a browser console on https://mindspear.app:

```js
new WebSocket("wss://ws.mindspear.app/app/REPLACE_WITH_REAL_APP_KEY")
```

You should see `readyState === 1` within a second.

Tail logs:

```bash
sudo journalctl -u mindspear-reverb -f
sudo journalctl -u mindspear-queue  -f
sudo journalctl -u php8.4-fpm       -f
sudo tail -f /var/log/nginx/api.mindspear.app.error.log
```

---

## 9. Common Pitfalls

- **`--debug` left on Reverb in production** — floods disk, chews CPU. The unit file in §3.1 already omits it; don't add it back.
- **`APP_DEBUG=true` in production** — leaks stack traces containing env values. Keep it `false`.
- **Missing `SESSION_DOMAIN=.mindspear.app`** — Sanctum cookies won't cross the subdomain boundary and host-channel auth fails silently.
- **Serving live pages from `www.mindspear.app`** — keep `www` redirected to `https://mindspear.app`; otherwise browser Origin becomes `https://www.mindspear.app` and Reverb/Sanctum will correctly reject it.
- **Running `queue:work` without `--max-time` / `--max-jobs`** — long-lived worker memory grows until OOM. The §3.2 unit already sets these; don't strip them.
- **Queue not restarted after deploy** — workers keep running old code. Always run `php artisan queue:restart` (graceful) plus `sudo systemctl restart mindspear-reverb` (hard).
- **Opcache + `validate_timestamps=0` + no reload** — PHP keeps serving pre-deploy bytecode. `sudo systemctl reload php8.4-fpm` after every deploy, or put it in the deploy script.
- **Setting `REDIS_PASSWORD` in `.env` without `requirepass` in redis.conf** (or vice-versa) — connection fails with `NOAUTH Authentication required` or `ERR Client sent AUTH, but no password is set`. Keep both unset for now, or set both together if you enable auth later.
- **DB migrations forgotten on deploy** — `migrate --force` belongs in the deploy script, not in your memory.

---

## 10. Backups (minimum)

```bash
# Daily Postgres dump, retained 14 days
sudo -u postgres pg_dump mindspear | gzip > /var/backups/mindspear-$(date +%F).sql.gz
find /var/backups -name 'mindspear-*.sql.gz' -mtime +14 -delete
```

Add to root's crontab:

```
15 3 * * * /usr/local/bin/mindspear-backup.sh
```

Ship the gzipped dumps off-box (S3, restic, whatever) — on-disk backups don't survive a disk failure.

---

## 11. Replace Before Go-Live

Everything in the Quick Start that said `REPLACE_*` maps to a real value here. Generate secrets with `openssl rand -hex 32` (for keys/secrets) or `openssl rand -hex 16` (for IDs).

### 11.1 Shell-command placeholders

| Placeholder | Where it appears | What to put there |
|---|---|---|
| `REPLACE_DB_PASSWORD` | `CREATE USER mindspear` in Quick Start step 4 | Strong random password. Must match `DB_PASSWORD` in backend `.env`. |
| `REPLACE_REPO_URL` | `git clone ...` in step 5 | `git@github.com:your-org/mindspear.git` (or HTTPS clone URL). |
| `REPLACE_ADMIN_EMAIL` | `certbot ... -m ...` in step 10 | Email for Let's Encrypt expiry notices, e.g. `admin@mindspear.app`. |

### 11.2 Backend — `/var/www/mindspear/backend/.env`

| Key | Value |
|---|---|
| `APP_KEY` | Filled by `php artisan key:generate --force` — do not set by hand. |
| `DB_PASSWORD` | Same value as `REPLACE_DB_PASSWORD` above. |
| `REDIS_PASSWORD` | **Keep as `null`** — we run Redis with no password. |
| `REVERB_APP_ID` | `openssl rand -hex 8` — numeric-ish ID (any unique string works). |
| `REVERB_APP_KEY` | `openssl rand -hex 20` — **must be copied verbatim into** `NEXT_PUBLIC_REVERB_APP_KEY`. |
| `REVERB_APP_SECRET` | `openssl rand -hex 32` — server-only, never exposed to the browser. |
| `MAIL_HOST` / `MAIL_USERNAME` / `MAIL_PASSWORD` | Your real SMTP provider (Mailgun, Postmark, SES, etc.). |
| `SUPER_ADMIN_PASSWORD` | Strong admin password. Change and redeploy after first login. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From https://console.cloud.google.com/apis/credentials. Optional. |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | From Azure App registrations. Optional. |

After editing `.env`, run:

```bash
php artisan config:cache && php artisan route:cache && php artisan event:cache
php artisan queue:restart
sudo systemctl restart mindspear-reverb
```

### 11.3 Frontend — `/var/www/mindspear/frontend/.env.production.local`

| Key | Value |
|---|---|
| `NEXT_PUBLIC_REVERB_APP_KEY` | **Exact same value** as backend `REVERB_APP_KEY`. If they diverge, WSS handshake fails. |
| `OPENAI_API_KEY` | Fresh key from https://platform.openai.com/api-keys. **Rotate the one that was committed in the dev `.env` — treat it as leaked.** |

After editing, **rebuild** (Next.js bakes `NEXT_PUBLIC_*` into the bundle at build time):

```bash
cd /var/www/mindspear/frontend
npm run build
pm2 reload mindspear-frontend
```

### 11.4 Post-SSL sanity check

After `certbot --nginx ... --redirect` rewrites the vhosts:

```bash
sudo nginx -t
curl -sI https://mindspear.app           # expect HTTP/2 200
curl -sI https://api.mindspear.app       # expect HTTP/2 200 (or 404 on /)
curl -sI --http1.1 -H "Upgrade: websocket" -H "Connection: Upgrade" https://ws.mindspear.app  # expect 101 or 426
```

Then in a browser console on `https://mindspear.app`:

```js
new WebSocket("wss://ws.mindspear.app/app/<YOUR_REVERB_APP_KEY>").onopen = () => console.log("ok")
```

---

**You're live.** Open https://mindspear.app, log in as the super admin, create a quest session, join it from a second device, and confirm participants show up in real time. If the WSS handshake works and live events flow, the backend services are doing their job.
