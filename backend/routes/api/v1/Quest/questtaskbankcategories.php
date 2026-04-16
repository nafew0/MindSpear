<?php

use App\Http\Controllers\api\v1\Quest\QuestTaskBankCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('quest')->group(function () {
    Route::prefix('task-bank-categories')->group(function () {
        Route::get('/', [QuestTaskBankCategoryController::class, 'index']);
    });
});

