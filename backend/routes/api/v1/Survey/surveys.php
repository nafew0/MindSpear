<?php

use App\Http\Controllers\api\v1\Survey\SurveyController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('surveys')->group(function () {
        Route::get('/', [SurveyController::class, 'index'])->name('surveys.index');
        Route::get('/show/{id}', [SurveyController::class, 'show'])->name('surveys.show');
        Route::post('/store', [SurveyController::class, 'store'])->name('surveys.store');
        Route::post('/update/{id}', [SurveyController::class, 'update'])->name('surveys.update');
        Route::delete('/delete/{id}', [SurveyController::class, 'destroy'])->name('surveys.delete');
        Route::post('/add-my-library/{id}', [SurveyController::class, 'addMyLibrary'])->name('surveys.add.my.library');
    });
});

Route::prefix('surveys-public')->group(function () {
    Route::get('/', [SurveyController::class, 'publicIndex'])->name('surveys.public.index');
    Route::get('/show/{id}', [SurveyController::class, 'publicShow'])->name('surveys.public.show');
});

Route::prefix('surveys-check')->group(function () {
    Route::get('/id/{id}', [SurveyController::class, 'checkSurveyById'])->name('surveys.check.id');
    Route::get('/join-link/{joinLink}', [SurveyController::class, 'checkSurveyByJoinLink'])->name('surveys.check.joinlink');
});
