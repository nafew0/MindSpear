<?php

use App\Http\Controllers\api\v1\Survey\SurveyAttemptController;
use Illuminate\Support\Facades\Route;

Route::prefix('survey-attempts')->group(function () {
    Route::post('/start/{surveyId}', [SurveyAttemptController::class, 'startAttempt'])->whereNumber('surveyId')->name('survey.attempts.start');
    Route::post('/submit', [SurveyAttemptController::class, 'submit'])->name('survey.attempts.submit');
    Route::get('/user/current', [SurveyAttemptController::class, 'getUserCurrentAttempts'])->name('survey.attempts.user.current');
    Route::get('/user/history', [SurveyAttemptController::class, 'getUserAttemptHistory'])->name('survey.attempts.user.history')->whereNumber('attemptId')->name('survey.attempts.answer');
    Route::put('/{attemptId}/status', [SurveyAttemptController::class, 'updateStatus'])->whereNumber('attemptId')->name('survey.attempts.status');
    Route::get('/{attemptId}', [SurveyAttemptController::class, 'getAttemptDetails'])->whereNumber('attemptId')->name('survey.attempts.details');
});

Route::prefix('survey-attempts-url')->group(function () {
    // Public route to get survey details and the quistions by join link
    Route::get('show/{joinLink}', [SurveyAttemptController::class, 'getSurveyDetailsByJoinLink'])->name('surveys.details.by.joinlink');
    // Public route to submit the full survey via join link
    Route::post('/submit/{joinLink}', [SurveyAttemptController::class, 'submitByJoinLink'])->name('surveys.submit.by.joinlink');
    // Public route for joining survey
    Route::post('/join/{joinLink}', [SurveyAttemptController::class, 'join'])->name('surveys.join');
    // Public route to update survey attempt status
    Route::put('/update-status/{joinLink}', [SurveyAttemptController::class, 'updateStatusByJoinLink'])->name('surveys.update.status.by.joinlink');
    // Public Route to get attempt result by attempt ID
    Route::get('/result/{attemptId}', [SurveyAttemptController::class, 'getAttemptResult'])
        ->whereNumber('attemptId')
        ->name('surveys.attempt.result');
});

Route::prefix('survey-result')->group(function () {
    // Public route to get survey leaderboard
    Route::get('/{surveyId}', [SurveyAttemptController::class, 'getSurveyLeaderboard'])
        ->whereNumber('surveyId')
        ->name('surveys.leaderboard');
});
