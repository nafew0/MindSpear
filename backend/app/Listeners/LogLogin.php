<?php

namespace App\Listeners;

use App\Models\Log\LoginLog;
use Illuminate\Auth\Events\Login;

class LogLogin
{
    public function handle(Login $event): void
    {
        LoginLog::create([
            'user_id' => $event->user->id,
            'guard' => $event->guard,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => 'success',
            'logged_in_at' => now(),
        ]);
    }
}

