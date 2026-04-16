<?php

use App\Http\Controllers\api\v1\SocialAuthConfigController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('social-auth-config')->group(function () {
        // Show routes
        Route::get('google', [SocialAuthConfigController::class, 'showGoogleConfig']);
        Route::get('facebook', [SocialAuthConfigController::class, 'showFacebookConfig']);
        Route::get('microsoft', [SocialAuthConfigController::class, 'showMicrosoftConfig']);

        // Single update route
        Route::post('save', [SocialAuthConfigController::class, 'updateSocialConfig']);
    });
});
