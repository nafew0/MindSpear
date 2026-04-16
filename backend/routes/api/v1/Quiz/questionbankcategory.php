<?php

use App\Http\Controllers\api\v1\Quiz\QuestionBankCategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('quiz')->group(function () {
    Route::prefix('question-bank-categories')->group(function () {
        Route::get('/', [QuestionBankCategoryController::class, 'index'])->name('question-bank-categories.index');
        Route::get('/show/{id}', [QuestionBankCategoryController::class, 'show'])->name('question-bank-categories.show');
        Route::post('/store', [QuestionBankCategoryController::class, 'store'])->name('question-bank-categories.store');
        Route::post('/update/{id}', [QuestionBankCategoryController::class, 'update'])->name('question-bank-categories.update');
        Route::delete('/delete/{id}', [QuestionBankCategoryController::class, 'destroy'])->name('question-bank-categories.delete');
    });
});
