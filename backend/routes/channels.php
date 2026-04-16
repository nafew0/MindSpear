<?php

use App\Models\Quest\QuestSession;
use App\Models\Quiz\QuizSession;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('host.quest.{sessionId}', function ($user, int $sessionId): bool {
    $session = QuestSession::with('quest')->find($sessionId);

    return (bool) $session?->quest && (int) $session->quest->creator_id === (int) $user->id;
});

Broadcast::channel('host.quiz.{sessionId}', function ($user, int $sessionId): bool {
    $session = QuizSession::with('quiz')->find($sessionId);

    return (bool) $session?->quiz && (int) $session->quiz->user_id === (int) $user->id;
});
