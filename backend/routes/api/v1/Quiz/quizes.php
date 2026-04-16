<?php

use App\Http\Controllers\api\v1\Quiz\QuizController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('quizes')->group(function () {
        Route::get('/', [QuizController::class, 'index'])->name('quizes.index');
        Route::get('/show/{id}', [QuizController::class, 'show'])->name('quizes.show');
        // Quiz show with session id details
        Route::get('/show-with-sessions/{sessionId}', [QuizController::class, 'showWithSessions'])->name('quizes.show.with.sessions');
        Route::post('/store', [QuizController::class, 'store'])->name('quizes.store');
        Route::post('/update/{id}', [QuizController::class, 'update'])->name('quizes.update');
        Route::delete('/delete/{id}', [QuizController::class, 'destroy'])->name('quizes.delete');

        // Quiz copy route
        Route::post('/copy-with-questions/{id}', [QuizController::class, 'copyWithQuestions'])->name('quizes.copy.with.questions');
        Route::post('/add-my-library/{id}', [QuizController::class, 'addMyLibrary'])->name('quizes.add.my.library');

        Route::post('/host-live/{id}', [QuizController::class, 'hostLive'])->name('quiz.host.live');
        Route::post('/update-host-live/{id}', [QuizController::class, 'updateHostLive'])->name('quiz.update.host.live');
        Route::post('/end-host-live/{id}', [QuizController::class, 'endLive'])->name('quiz.end.live');
        Route::post('/status-host-live/{id}', [QuizController::class, 'statusLive'])->name('quiz.status.live');
        Route::get('host-live-check/{userId}', [QuizController::class, 'checkHostLive'])->name('quiz.check.host.live');

        Route::post('/host-later/{id}', [QuizController::class, 'hostLater'])->name('quiz.host.later');
        Route::post('/update-host-later/{id}', [QuizController::class, 'updateHostLater'])->name('quiz.update.host.later');
        Route::post('/time-host-later/{id}', [QuizController::class, 'timeHostLater'])->name('quiz.time.host.later');
        Route::post('/status-host-later/{id}', [QuizController::class, 'statusLater'])->name('quiz.status.host.later');
        Route::get('host-later-check/{userId}', [QuizController::class, 'checkHostLater'])->name('quiz.check.host.later');
    });
});

Route::middleware('auth:sanctum')->prefix('quizes-public')->group(function () {
    Route::get('/', [QuizController::class, 'publicIndex'])->name('quizes.public.index');
    Route::get('/show/{id}', [QuizController::class, 'publicShow'])->name('quizes.public.show');
});

Route::prefix('quizes-check')->group(function () {
    Route::get('/id/{id}', [QuizController::class, 'checkQuizById'])->name('quizes.check.id');
    Route::get('/join-link/{joinLink}', [QuizController::class, 'checkQuizByJoinLink'])->name('quizes.check.joinlink');
    Route::get('/join-code/{joinCode}', [QuizController::class, 'checkQuizByJoinCode'])->name('quizes.check.joincode');
});
