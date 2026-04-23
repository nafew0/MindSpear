# MindSpear Local Dev Commands

Run each long-running command in its own terminal tab.

## Start

### 1. Redis

```bash
cd /home/bdren/Projects/MindSpear/backend
redis-server --bind 127.0.0.1 --port 6379
```

### 2. Backend API

```bash
cd /home/bdren/Projects/MindSpear/backend
php artisan optimize:clear
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Queue Worker

```bash
cd /home/bdren/Projects/MindSpear/backend
php artisan queue:work redis --tries=3
```

### 4. Reverb WebSocket Server

```bash
cd /home/bdren/Projects/MindSpear/backend
php artisan optimize:clear
php artisan reverb:start --host=0.0.0.0 --port=8080
```

### 5. Frontend

```bash
cd /home/bdren/Projects/MindSpear/frontend
npm run dev
```

## Verify

```bash
redis-cli -h 127.0.0.1 -p 6379 ping
ss -ltnp | grep -E ':6379|:8000|:8080|:2000'
```

Expected ports:

```text
6379  Redis
8000  Laravel API
8080  Reverb WebSocket
2000  Next.js frontend
```

## Stop

### Stop Reverb Only

```bash
pkill -f "php artisan reverb:start"
```

### Stop Queue Worker Only

```bash
pkill -f "php artisan queue:work"
```

### Restart Queue Worker After Backend Code Changes

```bash
pkill -f "php artisan queue:work"
cd /home/bdren/Projects/MindSpear/backend
php artisan queue:work redis --tries=3
```

### Stop Backend API Only

```bash
pkill -f "php artisan serve"
```

### Stop Frontend Only

```bash
pkill -f "next dev"
```

### Stop Redis Only

```bash
redis-cli -h 127.0.0.1 -p 6379 shutdown
```

## Stop Everything Local

```bash
pkill -f "php artisan reverb:start"
pkill -f "php artisan queue:work"
pkill -f "php artisan serve"
pkill -f "next dev"
redis-cli -h 127.0.0.1 -p 6379 shutdown
```

## If Reverb Says Redis Connection Refused

Start Redis first, then restart Reverb:

```bash
cd /home/bdren/Projects/MindSpear/backend
redis-server --bind 127.0.0.1 --port 6379
```

Then in a separate terminal:

```bash
cd /home/bdren/Projects/MindSpear/backend
php artisan optimize:clear
php artisan reverb:start --host=0.0.0.0 --port=8080
```
