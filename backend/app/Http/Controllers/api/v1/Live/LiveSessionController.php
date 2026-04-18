<?php

namespace App\Http\Controllers\api\v1\Live;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Models\Quest\QuestSession;
use App\Models\Quest\QuestTask;
use App\Models\Quiz\Question;
use App\Models\Quiz\QuizSession;
use App\Services\Live\LiveAggregateService;
use App\Services\Live\LiveSessionService;
use App\Services\Live\ParticipantTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LiveSessionController extends ApiBaseController
{
    public function __construct(
        private readonly LiveSessionService $liveSessions,
        private readonly ParticipantTokenService $participantTokens,
        private readonly LiveAggregateService $aggregates,
    ) {}

    public function questState(Request $request, int $sessionId): JsonResponse
    {
        $session = QuestSession::with('quest')->find($sessionId);

        if (! $session) {
            return $this->notFoundResponse([], __('Quest session not found.'));
        }

        if ($response = $this->ensureQuestStateAccess($request, $session)) {
            return $response;
        }

        return $this->okResponse([
            'state' => $this->stateWithAggregate(LiveSessionService::MODULE_QUEST, $session),
        ], __('Quest session state retrieved successfully.'));
    }

    public function changeQuestTask(Request $request, int $sessionId): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => ['required', 'integer', 'exists:quest_tasks,id'],
            'timer_state' => ['nullable', 'array'],
        ]);

        $session = QuestSession::with('quest')->find($sessionId);

        if (! $session) {
            return $this->notFoundResponse([], __('Quest session not found.'));
        }

        if ($response = $this->ensureQuestOwner($session)) {
            return $response;
        }

        $task = QuestTask::where('quest_id', $session->quest_id)->find($validated['task_id']);

        if (! $task) {
            return $this->badRequestResponse([], __('The selected task does not belong to this quest session.'));
        }

        DB::transaction(function () use ($session, $task, $validated) {
            $session->update([
                'current_task_id' => $task->id,
                'timer_state' => $validated['timer_state'] ?? null,
            ]);

            $payload = [
                'session_id' => $session->id,
                'task_id' => $task->id,
                'timer_state' => $session->timer_state,
            ];

            $this->liveSessions->broadcastPublic(LiveSessionService::MODULE_QUEST, $session, 'task.changed', $payload);
        });

        return $this->okResponse([
            'state' => $this->liveSessions->state(LiveSessionService::MODULE_QUEST, $session->refresh()),
        ], __('Quest task changed successfully.'));
    }

    public function quizState(Request $request, int $sessionId): JsonResponse
    {
        $session = QuizSession::with('quiz')->find($sessionId);

        if (! $session) {
            return $this->notFoundResponse([], __('Quiz session not found.'));
        }

        if ($response = $this->ensureQuizStateAccess($request, $session)) {
            return $response;
        }

        return $this->okResponse([
            'state' => $this->stateWithAggregate(LiveSessionService::MODULE_QUIZ, $session),
        ], __('Quiz session state retrieved successfully.'));
    }

    public function changeQuizQuestion(Request $request, int $sessionId): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'timer_state' => ['nullable', 'array'],
        ]);

        $session = QuizSession::with('quiz')->find($sessionId);

        if (! $session) {
            return $this->notFoundResponse([], __('Quiz session not found.'));
        }

        if ($response = $this->ensureQuizOwner($session)) {
            return $response;
        }

        $question = Question::where('quiz_id', $session->quiz_id)->find($validated['question_id']);

        if (! $question) {
            return $this->badRequestResponse([], __('The selected question does not belong to this quiz session.'));
        }

        DB::transaction(function () use ($session, $question, $validated) {
            $session->update([
                'current_question_id' => $question->id,
                'timer_state' => $validated['timer_state'] ?? null,
            ]);

            $payload = [
                'session_id' => $session->id,
                'question_id' => $question->id,
                'timer_state' => $session->timer_state,
            ];

            $this->liveSessions->broadcastPublic(LiveSessionService::MODULE_QUIZ, $session, 'question.changed', $payload);
        });

        return $this->okResponse([
            'state' => $this->liveSessions->state(LiveSessionService::MODULE_QUIZ, $session->refresh()),
        ], __('Quiz question changed successfully.'));
    }

    private function ensureQuestOwner(QuestSession $session): ?JsonResponse
    {
        if (! $session->quest || $session->quest->creator_id !== auth()->id()) {
            return $this->forbiddenResponse([], __('You are not allowed to access this quest session.'));
        }

        return null;
    }

    private function stateWithAggregate(string $module, QuestSession|QuizSession $session): array
    {
        $state = $this->liveSessions->state($module, $session);
        $state['current_aggregate'] = $this->aggregates->currentSnapshot($module, $session);

        return $state;
    }

    private function ensureQuestStateAccess(Request $request, QuestSession $session): ?JsonResponse
    {
        $user = $request->user('sanctum') ?? $request->user();

        if ($user && $session->quest && $session->quest->creator_id === $user->id) {
            return null;
        }

        if ($this->participantTokens->participantForSession($request, LiveSessionService::MODULE_QUEST, (int) $session->id)) {
            return null;
        }

        return $user
            ? $this->forbiddenResponse([], __('You are not allowed to access this quest session.'))
            : $this->unauthorizedResponse([], __('A valid host session or participant token is required.'));
    }

    private function ensureQuizStateAccess(Request $request, QuizSession $session): ?JsonResponse
    {
        $user = $request->user('sanctum') ?? $request->user();

        if ($user && $session->quiz && $session->quiz->user_id === $user->id) {
            return null;
        }

        if ($this->participantTokens->participantForSession($request, LiveSessionService::MODULE_QUIZ, (int) $session->id)) {
            return null;
        }

        return $user
            ? $this->forbiddenResponse([], __('You are not allowed to access this quiz session.'))
            : $this->unauthorizedResponse([], __('A valid host session or participant token is required.'));
    }

    private function ensureQuizOwner(QuizSession $session): ?JsonResponse
    {
        if (! $session->quiz || $session->quiz->user_id !== auth()->id()) {
            return $this->forbiddenResponse([], __('You are not allowed to access this quiz session.'));
        }

        return null;
    }
}
