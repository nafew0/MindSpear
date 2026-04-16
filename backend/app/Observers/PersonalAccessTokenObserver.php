<?php

namespace App\Observers;

use App\Models\Log\LoginLog;
use Illuminate\Support\Facades\Request;
use Laravel\Sanctum\PersonalAccessToken;

class PersonalAccessTokenObserver
{
    public function created(PersonalAccessToken $token): void
    {
        LoginLog::create([
            'user_id' => $token->tokenable_id,
            'guard' => 'sanctum',
            'ip' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'status' => 'success',
            'logged_in_at' => now(),
        ]);
    }
}

