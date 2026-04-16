<?php

use App\Http\Controllers\api\v1\Survey\SurveyResponseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('survey-responses')->group(function () {
        Route::get('/', [SurveyResponseController::class, 'index'])->name('survey-responses.index');
        Route::get('/show/{id}', [SurveyResponseController::class, 'show'])->name('survey-responses.show');
        Route::delete('/delete/{id}', [SurveyResponseController::class, 'destroy'])->name('survey-responses.delete');
    });
});
