<?php

use App\Http\Controllers\api\v1\Quiz\QuizParticipantController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('quiz-participants')->group(function () {
        Route::get('/', [QuizParticipantController::class, 'index'])->name('quiz.participants.index');
        Route::get('/show/{id}', [QuizParticipantController::class, 'show'])->name('quiz.participants.show');
        Route::delete('/delete/{id}', [QuizParticipantController::class, 'destroy'])->name('quiz.participants.delete');
    });
});
