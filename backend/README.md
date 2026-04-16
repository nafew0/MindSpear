<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Super Admin Panel (Filament) Deployment

This project includes a Super Admin panel built with Filament, mounted at the base URL (`/`). It uses the `web` guard (session-based) and restricts access to users with the `Super Admin` role. No registration or forgot-password pages are exposed in the admin. Super Admins can change their password from the profile page.

### 1) Requirements
- PHP 8.4+
- Node 18+ and npm (for asset build)
- Composer
- A configured database (see `.env`)

### 2) Install dependencies
```
composer install --no-interaction --prefer-dist
npm ci
```

### 3) Configure environment
- Copy `.env.example` to `.env` (if you haven’t).
- Set `APP_URL`, `APP_ENV`, and database credentials.
- Optional (sets initial Super Admin credentials):
```
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your-strong-password
```

### 4) Migrate and seed
```
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=Database\\Seeders\\SuperAdminSeeder --force
```

This seeds the `Super Admin` role and a user with the credentials from the env variables above.

### 5) Build admin assets
The Super Admin panel uses a custom Filament theme for a professional login page.
```
npm run build
```

During local development, you can run:
```
npm run dev
```

### 6) Publish Filament assets
Filament’s core CSS/JS (forms, support, notifications, app) must be published to `public/`.
```
php artisan filament:assets
php artisan optimize:clear
```

### 7) Access the panel
- Visit: `https://your-domain.com/`
- Log in using the seeded Super Admin credentials.
- Change password from the profile page (top-right user menu).

Note: The default Laravel welcome route at `/` may conflict with mounting the panel at `/`. If present in `routes/web.php`, remove or change that route to avoid a conflict.

## Email & Queues

- Current behavior: Emails are sent synchronously using `Mail::send(...)`. A queue worker is not required for this project to send verification and password reset emails.

- Optional (recommended for production): Queue emails to avoid blocking API responses and to improve throughput.
  - Env: set `QUEUE_CONNECTION=database` (or `redis` if available).
  - Migrations: `php artisan queue:table && php artisan migrate`.
  - Code change: replace synchronous sends with queued sends.
    - Example in `app/Http/Controllers/api/v1/AuthenticationController.php`:
      - `Mail::to($user->email)->send(new VerifyEmailMail(...));`
        to `Mail::to($user->email)->queue(new VerifyEmailMail(...));`
      - `Mail::to($validated['email'])->send(new PasswordResetMail($token));`
        to `Mail::to($validated['email'])->queue(new PasswordResetMail($token));`
    - Alternatively, implement `ShouldQueue` on the `VerifyEmailMail` and `PasswordResetMail` classes.
  - Run worker (simple): `php artisan queue:work --tries=3 --backoff=5`.
  - Run worker (Supervisor on Linux):
    - `/etc/supervisor/conf.d/laravel-queue.conf`
      - `[program:laravel-queue]`
      - `process_name=%(program_name)s_%(process_num)02d`
      - `command=php /var/www/bdren_mindspear_backend/artisan queue:work --tries=3 --backoff=5 --sleep=1`
      - `autostart=true`
      - `autorestart=true`
      - `numprocs=1`
      - `redirect_stderr=true`
      - `stdout_logfile=/var/log/supervisor/laravel-queue.log`
    - `supervisorctl reread && supervisorctl update && supervisorctl start laravel-queue:*`

Note: If you keep synchronous emails (default), no queue worker or extra deployment steps are needed.

### Notes
- Admin-only logs are enabled:
  - Login logs: `login_logs`
  - Activity logs: `activity_logs`
  - Email logs: `email_logs`
- Event & observer wiring is already registered in `bootstrap/providers.php`.
- Brand/theme configuration lives in:
  - `app/Providers/Filament/AdminPanelProvider.php` (branding and theme reference)
  - `resources/css/filament/admin/theme.css` (styles)
  - `public/images/logo.svg` and `public/images/admin-bg.svg` (assets)
- If you wish to fully customize the auth views, publish Filament views:
```
php artisan vendor:publish --tag=filament-panels-views
```

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
