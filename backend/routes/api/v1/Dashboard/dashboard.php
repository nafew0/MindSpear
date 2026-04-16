<?php

use App\Http\Controllers\Dashboard\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('dashboard-statistics')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard.statistics.dashboard');
    });
});
