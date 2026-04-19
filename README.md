# MindSpear — Production Deployment Guide

Production hosting guide for MindSpear (Laravel 11 + Next.js 14 + Laravel Reverb) on **Ubuntu 24.04** with domain **mindspear.app**.

- **Frontend:** `https://mindspear.app` (Next.js)
- **Backend API:** `https://api.mindspear.app` (Laravel + PHP-FPM + Nginx)
- **Reverb WSS:** `wss://ws.mindspear.app` (Laravel Reverb behind Nginx)

---

## Architecture at a Glance

| Concern | Dev command | Production equivalent |
|---|---|---|
| HTTP app | `php artisan serve` | Nginx + **PHP-FPM 8.3** (systemd) |
| Queues | `php artisan queue:work redis --tries=3` | **Supervisor** → `queue:work` with production flags |
| Redis | `redis-server --bind 127.0.0.1 --port 6379` | **systemd redis-server**, bind to loopback, password, AOF persistence |
| WebSockets | `php artisan reverb:start --host=0.0.0.0 --port=8080 --debug` | **Supervisor** → `reverb:start` (no `--debug`), behind Nginx WSS |
| Frontend | `npm run dev` | **PM2** → `next start` behind Nginx |

> Put **PHP-FPM**, **PostgreSQL**, **Redis**, and **Nginx** under **systemd** (OS-level services that exist forever). Put **queue workers**, **Reverb**, and the **Next.js process** under **Supervisor / PM2** (app processes that restart on deploy).

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

### 1.3 PHP 8.3 + extensions

```bash
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt -y install php8.3 php8.3-fpm php8.3-cli php8.3-common \
  php8.3-pgsql php8.3-redis php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-zip php8.3-bcmath php8.3-intl php8.3-gd php8.3-opcache
```

Harden `/etc/php/8.3/fpm/php.ini` (production values):

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
sudo systemctl restart php8.3-fpm
sudo systemctl enable php8.3-fpm
```

### 1.4 Composer

```bash
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

### 1.5 Node.js 20 LTS + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
sudo npm install -g pm2
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

### 1.7 Redis 7

```bash
sudo apt -y install redis-server
```

Edit `/etc/redis/redis.conf`:

```
bind 127.0.0.1 ::1
protected-mode yes
port 6379
requirepass REPLACE_WITH_STRONG_REDIS_PASSWORD
supervised systemd
appendonly yes
maxmemory 512mb
maxmemory-policy allkeys-lru
```

```bash
sudo systemctl enable --now redis-server
sudo systemctl restart redis-server
```

### 1.8 Nginx + Certbot + Supervisor

```bash
sudo apt -y install nginx certbot python3-certbot-nginx supervisor
sudo systemctl enable --now nginx supervisor
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

### 2.5 Laravel scheduler (cron)

```bash
sudo crontab -u www-data -e
```

Append:

```
* * * * * cd /var/www/mindspear/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 3. Supervisor — The Four Background Processes

Supervisor replaces your dev terminals. Create `/etc/supervisor/conf.d/mindspear.conf`:

```ini
; ============================================================
; Redis is managed by systemd (see §1.7). Do NOT run it here.
; ============================================================

; ------------------------------------------------------------
; 1) Queue worker  (replaces: php artisan queue:work redis --tries=3)
; ------------------------------------------------------------
[program:mindspear-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/mindspear/backend/artisan queue:work redis --queue=default,broadcasts --sleep=1 --tries=3 --backoff=3 --max-time=3600 --max-jobs=1000 --timeout=60
directory=/var/www/mindspear/backend
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/mindspear/queue.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
stopwaitsecs=70

; ------------------------------------------------------------
; 2) Reverb WebSocket server  (replaces: php artisan reverb:start --host=0.0.0.0 --port=8080 --debug)
;    NOTE: no --debug in production. Bind to loopback; Nginx terminates TLS and proxies WSS.
; ------------------------------------------------------------
[program:mindspear-reverb]
process_name=%(program_name)s
command=php /var/www/mindspear/backend/artisan reverb:start --host=127.0.0.1 --port=8080
directory=/var/www/mindspear/backend
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/mindspear/reverb.log
stdout_logfile_maxbytes=20MB
stdout_logfile_backups=5
stopwaitsecs=15

; ------------------------------------------------------------
; 3) Next.js frontend
;    Alternative: use PM2 (see §5). If you prefer Supervisor, uncomment below.
; ------------------------------------------------------------
;[program:mindspear-frontend]
;process_name=%(program_name)s
;command=/usr/bin/node /var/www/mindspear/frontend/node_modules/.bin/next start -p 2000
;directory=/var/www/mindspear/frontend
;environment=NODE_ENV="production",PORT="2000"
;autostart=true
;autorestart=true
;user=www-data
;stdout_logfile=/var/log/mindspear/frontend.log
;stdout_logfile_maxbytes=20MB
;stdout_logfile_backups=5
;stopwaitsecs=15

[group:mindspear]
programs=mindspear-queue,mindspear-reverb
```

Production flag notes:

- `--sleep=1 --tries=3 --backoff=3` — modest retry, no busy loop.
- `--max-time=3600 --max-jobs=1000` — auto-recycle the worker every hour or 1000 jobs so leaked memory never accumulates. Supervisor restarts it immediately.
- `--timeout=60` — kill stuck jobs after 60s.
- `--queue=default,broadcasts` — priority order; raise `broadcasts` first for live-aggregate events.
- `numprocs=2` — start with two queue workers; scale with Reverb traffic.
- Reverb: **remove `--debug`**. Debug mode logs every frame and is very expensive under load.
- Reverb binds to `127.0.0.1:8080` in production — Nginx handles TLS + the public `:443` endpoint.

Apply:

```bash
sudo mkdir -p /var/log/mindspear
sudo chown www-data:www-data /var/log/mindspear
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

Useful:

```bash
sudo supervisorctl restart mindspear:*      # full restart (post-deploy)
sudo supervisorctl restart mindspear-queue:*  # workers only
sudo supervisorctl tail -f mindspear-reverb
```

After every deploy that touches code:

```bash
php artisan queue:restart                   # tells workers to exit after current job
sudo supervisorctl restart mindspear-reverb
```

---

## 4. Nginx — Three Virtual Hosts

### 4.1 Backend API — `/etc/nginx/sites-available/api.mindspear.app`

```nginx
server {
    listen 80;
    server_name api.mindspear.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mindspear.app;

    root /var/www/mindspear/backend/public;
    index index.php;

    client_max_body_size 50M;

    # TLS (filled by certbot --nginx)
    # ssl_certificate     /etc/letsencrypt/live/api.mindspear.app/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.mindspear.app/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
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
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ws.mindspear.app;

    # ssl_certificate     /etc/letsencrypt/live/ws.mindspear.app/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/ws.mindspear.app/privkey.pem;

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
    server_name mindspear.app www.mindspear.app;
    return 301 https://mindspear.app$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.mindspear.app;
    # ssl_certificate     /etc/letsencrypt/live/mindspear.app/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/mindspear.app/privkey.pem;
    return 301 https://mindspear.app$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mindspear.app;

    # ssl_certificate     /etc/letsencrypt/live/mindspear.app/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/mindspear.app/privkey.pem;

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
SANCTUM_STATEFUL_DOMAINS=
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
# ============================================
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
BROADCAST_CONNECTION=reverb

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=REPLACE_WITH_STRONG_REDIS_PASSWORD
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
php artisan queue:restart
sudo supervisorctl restart mindspear-reverb

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
# PHP-FPM, Nginx, Redis, Postgres
systemctl status php8.3-fpm nginx redis-server postgresql

# Supervisor-managed processes
sudo supervisorctl status

# Reverb listening
ss -tlnp | grep 8080

# Frontend
pm2 status

# End-to-end
curl -sI https://api.mindspear.app/api/v1/health || true
curl -sI https://mindspear.app
```

Verify WSS from a browser console on https://mindspear.app:

```js
new WebSocket("wss://ws.mindspear.app/app/REPLACE_WITH_REAL_APP_KEY")
```

You should see `readyState === 1` within a second.

---

## 9. Common Pitfalls

- **`--debug` left on Reverb in production** — floods disk, chews CPU. Strip it in the Supervisor config.
- **`APP_DEBUG=true` in production** — leaks stack traces containing env values. Keep it `false`.
- **Missing `SESSION_DOMAIN=.mindspear.app`** — Sanctum cookies won't cross the subdomain boundary and host-channel auth fails silently.
- **Forgetting `REVERB_ALLOWED_ORIGINS`** — browser connects, then Reverb drops the handshake.
- **Running `queue:work` without `--max-time` / `--max-jobs`** — long-lived worker memory grows until OOM. Always let Supervisor recycle it.
- **Queue not restarted after deploy** — workers keep running old code. Always run `php artisan queue:restart`.
- **Opcache + `validate_timestamps=0` + no reload** — PHP keeps serving pre-deploy bytecode. Reload PHP-FPM (`sudo systemctl reload php8.3-fpm`) after deploy, or add it to the deploy script.
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

**You're live.** Open https://mindspear.app, log in as the super admin, create a quest session, join it from a second device, and confirm participants show up in real time. If the WSS handshake works and live events flow, the four backend processes are doing their job.
