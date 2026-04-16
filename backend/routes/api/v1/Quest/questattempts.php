<?php

use App\Http\Controllers\api\v1\Quest\QuestAttemptController;
use Illuminate\Support\Facades\Route;

Route::prefix('quest-attempts')->group(function () {
    Route::post('/start/{quizId}', [QuestAttemptController::class, 'startAttempt'])->name('quest.attempts.start');
    Route::post('/{attemptId}/answer', [QuestAttemptController::class, 'recordAnswer'])->name('quest.attempts.answer');
    Route::put('/{attemptId}/status', [QuestAttemptController::class, 'updateStatus'])->name('quest.attempts.status');
    Route::get('/{attemptId}', [QuestAttemptController::class, 'getAttemptDetails'])->name('quest.attempts.details');
    Route::get('/user/current', [QuestAttemptController::class, 'getUserCurrentAttempts'])->name('quest.attempts.user.current');
    Route::get('/user/history', [QuestAttemptController::class, 'getUserAttemptHistory'])->name('quest.attempts.user.history');
});

Route::prefix('quest-attempts-url')->group(function () {
    // Public route to get quest details and the quest task by join link
    Route::get('show-by-link/{joinLink}', [QuestAttemptController::class, 'getQuestDetailsByJoinLink'])->name('quests.details.by.join.link');
    // Public route for joining the quest
    Route::post('/join-by-link/{joinLink}', [QuestAttemptController::class, 'joinByLink'])->name('quests.join.by.link');
    // Public route for joining the quest by join code
    Route::post('/join-by-code', [QuestAttemptController::class, 'joinByCode'])->name('quest.join.by.code');
    // Public route to update quest attempt status
    Route::put('/update-status/{joinLink}', [QuestAttemptController::class, 'updateStatusByJoinLink'])->name('quests.update.status.by.join.link');
    // Public Route to get the attempt result by attempt ID
    Route::get('/result/{attemptId}', [QuestAttemptController::class, 'getAttemptResult'])->name('quests.attempt.result');
});

Route::prefix('quest-leaderboard')->group(function () {
    // Public route to get quest leaderboard
    Route::get('/{questId}', [QuestAttemptController::class, 'getQuestLeaderboard'])->name('quests.leaderboard');
    // Public route to get quest leaderboard session list
    Route::get('/session-list/{questId}', [QuestAttemptController::class, 'getQuestLeaderboardSessionList'])->name('quests.leaderboard.session.list');
    // Public route to download session leaderboard as Excel
    Route::get('/download-session-list/{questId}/export/excel', [QuestAttemptController::class, 'downloadSessionLeaderboardExcel'])->name('quests.leaderboard.session.download.excel');
    // Public route to download session leaderboard as CSV
    Route::get('/download-session-list/{questId}/export/csv', [QuestAttemptController::class, 'downloadSessionLeaderboardCSV'])->name('quests.leaderboard.session.download.csv');
    // Public route to download session attempts as Excel
    Route::get('/download-session-attempts/{sessionId}/export/excel', [QuestAttemptController::class, 'downloadSessionAttemptsExcel'])->name('quests.session.attempts.download.excel');
    // Public route to download session attempts as CSV
    Route::get('/download-session-attempts/{sessionId}/export/csv', [QuestAttemptController::class, 'downloadSessionAttemptsCSV'])->name('quests.session.attempts.download.csv');
    // Public route to download session attempts grouped as Excel
    Route::get('/download-session-attempts-grouped/{sessionId}/export/excel', [QuestAttemptController::class, 'downloadSessionAttemptsGroupedExcel'])->name('quests.session.attempts.grouped.download.excel');
    // Public route to download session attempts grouped as CSV
    Route::get('/download-session-attempts-grouped/{sessionId}/export/csv', [QuestAttemptController::class, 'downloadSessionAttemptsGroupedCSV'])->name('quests.session.attempts.grouped.download.csv');
    // Public route to download session attempts vertically as Excel
    Route::get('/download-session-attempts-vertical/{sessionId}/export/excel', [QuestAttemptController::class, 'downloadSessionAttemptsVerticalExcel'])->name('quests.session.attempts.vertical.download.excel');
    // Public route to download session attempts vertically as CSV
    Route::get('/download-session-attempts-vertical/{sessionId}/export/csv', [QuestAttemptController::class, 'downloadSessionAttemptsVerticalCSV'])->name('quests.session.attempts.vertical.download.csv');
    // Public route to get quest leaderboard session details
    Route::get('/session-details/{sessionId}', [QuestAttemptController::class, 'getQuestLeaderboardSessionDetails'])->name('quests.leaderboard.session.details');
    // Public route to get quest leaderboard session details with combined score
    Route::get('/session-details-combined-score/{sessionId}', [QuestAttemptController::class, 'getQuestLeaderboardSessionDetailsWithCombinedScore'])->name('quests.leaderboard.session.details.combined.score');
});
