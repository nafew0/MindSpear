<?php

use App\Http\Controllers\api\v1\Survey\SurveyQuestionBankCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('survey')->group(function () {
    Route::prefix('question-bank-categories')->group(function () {
        Route::get('/', [SurveyQuestionBankCategoryController::class, 'index']);
        Route::post('/store', [SurveyQuestionBankCategoryController::class, 'store']);
        Route::get('/show/{id}', [SurveyQuestionBankCategoryController::class, 'show']);
        Route::post('/update/{id}', [SurveyQuestionBankCategoryController::class, 'update']);
        Route::delete('/delete/{id}', [SurveyQuestionBankCategoryController::class, 'destroy']);
    });
});

