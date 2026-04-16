<?php

namespace App\Services\Live;

use App\Jobs\Live\BroadcastLiveAggregateSnapshot;
use App\Models\Quest\QuestSession;
use App\Models\Quest\QuestTaskCompletion;
use App\Models\Quiz\QuizSession;
use App\Models\Quiz\UserQuizAnswer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LiveAggregateService
{
    private const DEBOUNCE_MILLISECONDS = 500;

    public function recordAnswer(string $module, int $sessionId, int $itemId): void
    {
        Cache::increment($this->counterKey($module, $sessionId, $itemId));

        if (! Cache::add($this->debounceKey($module, $sessionId, $itemId), true, 1)) {
            return;
        }

        if (DB::transactionLevel() > 0) {
            DB::afterCommit(fn () => $this->dispatchSnapshot($module, $sessionId, $itemId));

            return;
        }

        $this->dispatchSnapshot($module, $sessionId, $itemId);
    }

    public function broadcastSnapshot(string $module, int $sessionId, int $itemId): void
    {
        if ($module === LiveSessionService::MODULE_QUEST) {
            $session = QuestSession::find($sessionId);

            if (! $session) {
                return;
            }

            app(LiveSessionService::class)->broadcastPublic(
                $module,
                $session,
                'answer.aggregate.updated',
                $this->questSnapshot($sessionId, $itemId),
            );

            return;
        }

        $session = QuizSession::find($sessionId);

        if (! $session) {
            return;
        }

        app(LiveSessionService::class)->broadcastPublic(
            $module,
            $session,
            'answer.aggregate.updated',
            $this->quizSnapshot($sessionId, $itemId),
        );
    }

    private function dispatchSnapshot(string $module, int $sessionId, int $itemId): void
    {
        BroadcastLiveAggregateSnapshot::dispatch($module, $sessionId, $itemId)
            ->delay(now()->addMilliseconds(self::DEBOUNCE_MILLISECONDS));
    }

    private function quizSnapshot(int $sessionId, int $questionId): array
    {
        $answers = UserQuizAnswer::query()
            ->where('question_id', $questionId)
            ->whereHas('quizParticipant', fn ($query) => $query->where('quiz_session_id', $sessionId))
            ->get(['answer_data']);

        return [
            'session_id' => $sessionId,
            'question_id' => $questionId,
            'total_answers' => $answers->count(),
            'answers' => $this->countAnswerValues($answers->pluck('answer_data')->all()),
        ];
    }

    private function questSnapshot(int $sessionId, int $taskId): array
    {
        $completions = QuestTaskCompletion::query()
            ->where('task_id', $taskId)
            ->whereHas('participant', fn ($query) => $query->where('quest_session_id', $sessionId))
            ->get(['completion_data', 'status']);

        return [
            'session_id' => $sessionId,
            'task_id' => $taskId,
            'total_answers' => $completions->count(),
            'statuses' => $completions->countBy('status')->all(),
            'answers' => $this->countAnswerValues($completions->pluck('completion_data')->all()),
        ];
    }

    private function countAnswerValues(array $payloads): array
    {
        $counts = [];

        foreach ($payloads as $payload) {
            $value = $this->extractAnswerValue(is_array($payload) ? $payload : (json_decode((string) $payload, true) ?: []));
            $key = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value;
            $key = $key !== '' ? $key : 'submitted';
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }

        ksort($counts);

        return $counts;
    }

    private function extractAnswerValue(array $payload): mixed
    {
        foreach (['selected_option', 'selected_options', 'answer', 'value', 'option', 'choice'] as $key) {
            if (array_key_exists($key, $payload)) {
                return $payload[$key];
            }
        }

        return 'submitted';
    }

    private function counterKey(string $module, int $sessionId, int $itemId): string
    {
        return "live:{$module}:{$sessionId}:{$itemId}:answers";
    }

    private function debounceKey(string $module, int $sessionId, int $itemId): string
    {
        return "live:{$module}:{$sessionId}:{$itemId}:aggregate-broadcast";
    }
}
