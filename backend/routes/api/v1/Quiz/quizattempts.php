<?php

use App\Http\Controllers\api\v1\Quiz\QuizAttemptController;
use Illuminate\Support\Facades\Route;

Route::prefix('quiz-attempts')->group(function () {
    Route::post('/start/{sessionId}', [QuizAttemptController::class, 'startAttempt'])->name('quiz.attempts.start');
    Route::post('/{attemptId}/answer', [QuizAttemptController::class, 'recordAnswer'])->name('quiz.attempts.answer');
    Route::put('/{attemptId}/status', [QuizAttemptController::class, 'updateStatus'])->name('quiz.attempts.status');
    Route::get('/{attemptId}', [QuizAttemptController::class, 'getAttemptDetails'])->name('quiz.attempts.details');
    Route::get('/user/current', [QuizAttemptController::class, 'getUserCurrentAttempts'])->name('quiz.attempts.user.current');
    Route::get('/user/history', [QuizAttemptController::class, 'getUserAttemptHistory'])->name('quiz.attempts.user.history');
});

Route::prefix('quiz-attempts-url')->group(function () {
    // Public route to get quiz details and the quistions by join link
    Route::get('show/{joinLink}', [QuizAttemptController::class, 'getQuizDetailsByJoinLink'])->name('quizes.details.by.joinlink');
    // Public route for joining quiz
    Route::post('/join/{joinLink}', [QuizAttemptController::class, 'join'])->name('quizes.join');
    // Public route to start quiz attempt by join code
    Route::post('/code', [QuizAttemptController::class, 'joinByCode'])->name('quizes.join.by.code');
    // Public route to update quiz attempt status
    Route::put('/update-status/{joinLink}', [QuizAttemptController::class, 'updateStatusByJoinLink'])->name('quizes.update.status.by.joinlink');
    // Public Route to get attempt result by attempt ID
    Route::get('/result/{attemptId}', [QuizAttemptController::class, 'getAttemptResult'])->name('quizes.attempt.result');
});

Route::prefix('quiz-leaderboard')->group(function () {
    // Public route to get quiz leaderboard
    Route::get('/{quizId}', [QuizAttemptController::class, 'getQuizLeaderboard'])->name('quizes.leaderboard');
    // Public route to get quiz leaderboard
    Route::get('/session/{quizId}', [QuizAttemptController::class, 'getQuizSessionLeaderboard'])->name('quizes.leaderboard.session');
    // Public route to get quiz leaderboard session list
    Route::get('/session-list/{quizId}', [QuizAttemptController::class, 'getQuizLeaderboardSessionList'])->name('quizes.leaderboard.session.list');
    // Public route to get quiz leaderboard session details
    Route::get('/session-details/{sessionId}', [QuizAttemptController::class, 'getQuizLeaderboardSessionDetails'])->name('quizes.leaderboard.session.details');
    // Public route to get quiz question's answer based on session ID and question ID
    Route::get('/session-question-answers/{sessionId}/{questionId}', [QuizAttemptController::class, 'getQuizSessionQuestionAnswers'])->name('quizes.leaderboard.session.question.answers');
    // Public route to get quiz questions answer which are answered/completed only based on session ID
    Route::get('/session-answered-questions/{sessionId}', [QuizAttemptController::class, 'getQuizSessionAnsweredQuestions'])->name('quizes.leaderboard.session.answered.questions');

    // Public route to download session leaderboard as Excel
    Route::get('/download-session-list/{quizId}/export/excel', [QuizAttemptController::class, 'downloadSessionLeaderboardExcel'])->name('quizes.leaderboard.session.download.excel');
    // Public route to download session leaderboard as CSV
    Route::get('/download-session-list/{quizId}/export/csv', [QuizAttemptController::class, 'downloadSessionLeaderboardCSV'])->name('quizes.leaderboard.session.download.csv');
    // Public route to download session attempts as Excel
    Route::get('/download-session-attempts/{sessionId}/export/excel', [QuizAttemptController::class, 'downloadSessionAttemptsExcel'])->name('quizes.session.attempts.download.excel');
    // Public route to download session attempts as CSV
    Route::get('/download-session-attempts/{sessionId}/export/csv', [QuizAttemptController::class, 'downloadSessionAttemptsCSV'])->name('quizes.session.attempts.download.csv');
    // Public route to download session attempts grouped as Excel
    Route::get('/download-session-attempts-grouped/{sessionId}/export/excel', [QuizAttemptController::class, 'downloadSessionAttemptsGroupedExcel'])->name('quizes.session.attempts.grouped.download.excel');
    // Public route to download session attempts grouped as CSV
    Route::get('/download-session-attempts-grouped/{sessionId}/export/csv', [QuizAttemptController::class, 'downloadSessionAttemptsGroupedCSV'])->name('quizes.session.attempts.grouped.download.csv');
    // Public route to download session attempts vertical as Excel
    Route::get('/download-session-attempts-vertical/{sessionId}/export/excel', [QuizAttemptController::class, 'downloadSessionAttemptsVerticalExcel'])->name('quizes.session.attempts.vertical.download.excel');
    // Public route to download session attempts vertical as CSV
    Route::get('/download-session-attempts-vertical/{sessionId}/export/csv', [QuizAttemptController::class, 'downloadSessionAttemptsVerticalCSV'])->name('quizes.session.attempts.vertical.download.csv');
});
