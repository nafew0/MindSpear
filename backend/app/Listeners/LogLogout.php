<?php

namespace App\Listeners;

use App\Models\Log\LoginLog;
use Illuminate\Auth\Events\Logout;

class LogLogout
{
    public function handle(Logout $event): void
    {
        LoginLog::query()
            ->where('user_id', $event->user?->id)
            ->whereNull('logged_out_at')
            ->latest()
            ->first()?->update([
                'status' => 'logout',
                'logged_out_at' => now(),
            ]);
    }
}

