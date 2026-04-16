<?php

use App\Http\Controllers\api\v1\Survey\SurveyQuestionBankController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('survey/question-bank')->group(function () {
    Route::get('/my', [SurveyQuestionBankController::class, 'my']);
    Route::get('/public', [SurveyQuestionBankController::class, 'public']);
    Route::post('/store', [SurveyQuestionBankController::class, 'store']);
    Route::get('/show/{id}', [SurveyQuestionBankController::class, 'show']);
    Route::post('/update/{id}', [SurveyQuestionBankController::class, 'update']);
    Route::delete('/delete/{id}', [SurveyQuestionBankController::class, 'destroy']);
    Route::post('/restore/{id}', [SurveyQuestionBankController::class, 'restore']);
    Route::post('/use-in-survey/{id}', [SurveyQuestionBankController::class, 'useInSurvey']);
});

