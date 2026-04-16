<?php

use App\Http\Controllers\api\v1\Quest\QuestTaskController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('quest-tasks')->group(function () {
        Route::get('/', [QuestTaskController::class, 'index'])->name('quests.tasks.index');
        Route::get('/show/{id}', [QuestTaskController::class, 'show'])->name('quests.tasks.show');
        Route::post('/store', [QuestTaskController::class, 'store'])->name('quests.tasks.store');
        Route::post('/store-multiple', [QuestTaskController::class, 'storeMultiple'])->name('quests.tasks.storeMultiple');
        Route::post('/update/{id}', [QuestTaskController::class, 'update'])->name('quests.tasks.update');
        Route::post('/update-multiple', [QuestTaskController::class, 'updateMultiple'])->name('quests.tasks.updateMultiple');
        Route::delete('/delete/{id}', [QuestTaskController::class, 'destroy'])->name('quests.tasks.delete');
        Route::delete('/delete-multiple', [QuestTaskController::class, 'destroyMultiple'])->name('quests.tasks.deleteMultiple');
        Route::post('/restore/{id}', [QuestTaskController::class, 'restore'])->name('quests.tasks.restore');
        Route::post('/restore-multiple', [QuestTaskController::class, 'restoreMultiple'])->name('quests.tasks.restoreMultiple');
        Route::post('/force-delete/{id}', [QuestTaskController::class, 'forceDelete'])->name('quests.tasks.forceDelete');
        Route::post('/force-delete-multiple', [QuestTaskController::class, 'forceDeleteMultiple'])->name('quests.tasks.forceDeleteMultiple');
        Route::post('/clone-to-bank', [QuestTaskController::class, 'cloneToMyBank'])->name('quests.tasks.cloneToBank');
        Route::post('/add-to-bank/{id}', [\App\Http\Controllers\api\v1\Quest\QuestTaskController::class, 'addToBank'])->name('quests.tasks.addToBank');
        Route::get('/my', [QuestTaskController::class, 'my'])->name('quests.tasks.my');
    });
});

Route::prefix('quest-tasks')->group(function () {
    Route::get('/{id}/prerequisites', [QuestTaskController::class, 'getPrerequisites'])->name('quests.task.prerequisites');
});
