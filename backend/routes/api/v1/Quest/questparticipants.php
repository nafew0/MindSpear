<?php

use App\Http\Controllers\api\v1\Quest\QuestParticipantController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('quest-participants')->group(function () {
        Route::get('/', [QuestParticipantController::class, 'index'])->name('quest.participants.index');
        Route::get('/show/{id}', [QuestParticipantController::class, 'show'])->name('quest.participants.show');
        Route::delete('/delete/{id}', [QuestParticipantController::class, 'destroy'])->name('quest.participants.delete');
    });
});
