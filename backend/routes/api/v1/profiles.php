<?php

use App\Http\Controllers\api\v1\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Profile routes
    Route::prefix('profile')->group(function () {
        // Show Profile
        Route::get('/show', [ProfileController::class, 'show'])->name('profile.show');
        // Update Profile
        Route::put('/update', [ProfileController::class, 'update'])->name('profile.update');
        // Change Password
        Route::post('/change-password', [ProfileController::class, 'changePassword'])->name('profile.change-password');
        // Update Profile Picture
        Route::post('/update-profile-picture', [ProfileController::class, 'updateProfilePicture'])->name('profile.update-profile-picture');
        // Delete Profile Picture
        Route::delete('/delete-profile-picture', [ProfileController::class, 'deleteProfilePicture'])->name('profile.delete-profile-picture');
    });
});
