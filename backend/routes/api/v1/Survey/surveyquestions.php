<?php

use App\Http\Controllers\api\v1\Survey\SurveyQuestionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('survey-questions')->group(function () {
        Route::get('/', [SurveyQuestionController::class, 'index'])->name('survey-questions.index');
        Route::get('/show/{id}', [SurveyQuestionController::class, 'show'])->name('survey-questions.show');
        Route::post('/store', [SurveyQuestionController::class, 'store'])->name('survey-questions.store');
        Route::post('/store-multiple', [SurveyQuestionController::class, 'storeMultiple'])->name('survey-questions.store-multiple');
        Route::post('/update/{id}', [SurveyQuestionController::class, 'update'])->name('survey-questions.update');
        Route::post('/update-multiple', [SurveyQuestionController::class, 'updateMultiple'])->name('survey-questions.update-multiple');
        Route::delete('/delete/{id}', [SurveyQuestionController::class, 'destroy'])->name('survey-questions.destroy');
        Route::delete('/delete-multiple', [SurveyQuestionController::class, 'destroyMultiple'])->name('survey-questions.destroy-multiple');
        Route::post('/restore/{id}', [SurveyQuestionController::class, 'restore'])->name('survey-questions.restore');
        Route::post('/restore-multiple', [SurveyQuestionController::class, 'restoreMultiple'])->name('survey-questions.restore-multiple');
        Route::post('/clone-to-bank', [SurveyQuestionController::class, 'cloneToMyBank'])->name('survey-questions.clone-to-bank');
        Route::post('/add-to-bank/{id}', [SurveyQuestionController::class, 'addToBank'])->name('survey-questions.add-to-bank');
        Route::get('/my', [SurveyQuestionController::class, 'my'])->name('survey-questions.my');
    });
});
