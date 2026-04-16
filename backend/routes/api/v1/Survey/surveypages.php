<?php

use App\Http\Controllers\api\v1\Survey\SurveyPageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('survey-pages')->group(function () {
        Route::get('/', [SurveyPageController::class, 'index'])->name('survey-pages.index');
        Route::get('/show/{id}', [SurveyPageController::class, 'show'])->name('survey-pages.show');
        Route::post('/store', [SurveyPageController::class, 'store'])->name('survey-pages.store');
        Route::post('/update/{id}', [SurveyPageController::class, 'update'])->name('survey-pages.update');
        Route::delete('/delete/{id}', [SurveyPageController::class, 'destroy'])->name('survey-pages.destroy');
        Route::post('/restore/{id}', [SurveyPageController::class, 'restore'])->name('survey-pages.restore');
        Route::post('/restore-multiple', [SurveyPageController::class, 'restoreMultiple'])->name('survey-pages.restore-multiple');
        Route::post('/store-multiple', [SurveyPageController::class, 'storeMultiple'])->name('survey-pages.store-multiple');
        Route::post('/update-multiple', [SurveyPageController::class, 'updateMultiple'])->name('survey-pages.update-multiple');
        Route::delete('/delete-multiple', [SurveyPageController::class, 'destroyMultiple'])->name('survey-pages.destroy-multiple');
        Route::get('/survey/{surveyId}', [SurveyPageController::class, 'getBySurvey'])->name('survey-pages.by-survey');
    });
});
