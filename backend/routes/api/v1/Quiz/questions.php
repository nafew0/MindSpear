<?php

use App\Http\Controllers\api\v1\Quiz\QuestionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('quiz/questions')->group(function () {
        Route::get('/', [QuestionController::class, 'index'])->name('questions.index');
        Route::get('/show/{id}', [QuestionController::class, 'show'])->name('questions.show');
        Route::post('/store', [QuestionController::class, 'store'])->name('questions.store');
        Route::post('/store-multiple', [QuestionController::class, 'storeMultiple'])->name('questions.store.multiple');
        Route::post('/update/{id}', [QuestionController::class, 'update'])->name('questions.update');
        Route::post('/update-multiple', [QuestionController::class, 'updateMultiple'])->name('questions.update.multiple');
        Route::delete('/delete/{id}', [QuestionController::class, 'destroy'])->name('questions.delete');
        Route::delete('/delete-multiple', [QuestionController::class, 'destroyMultiple'])->name('questions.delete.multiple');
        Route::post('/restore/{id}', [QuestionController::class, 'restore'])->name('questions.restore');
        Route::post('/restore-multiple', [QuestionController::class, 'restoreMultiple'])->name('questions.restore.multiple');
        Route::post('/add-to-bank/{id}', [QuestionController::class, 'addToBank'])->name('questions.add-to-bank');
    });

});
