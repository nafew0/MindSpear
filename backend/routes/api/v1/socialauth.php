<?php

use App\Http\Controllers\api\v1\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth/{provider}')->group(function () {
    Route::get('redirect', [SocialAuthController::class, 'redirectToProvider']);
    Route::get('callback', [SocialAuthController::class, 'handleProviderCallback']);
});
