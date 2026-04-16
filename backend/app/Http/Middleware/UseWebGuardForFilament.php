<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UseWebGuardForFilament
{
    public function handle(Request $request, Closure $next)
    {
        // Force the default auth guard to 'web' for Filament requests
        config(['auth.defaults.guard' => 'web']);
        auth()->shouldUse('web');

        return $next($request);
    }
}

