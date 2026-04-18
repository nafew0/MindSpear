<?php

namespace App\Services\Live;

use App\Jobs\Live\BroadcastLiveAggregateSnapshot;
use App\Models\Quest\QuestSession;
use App\Models\Quest\QuestTask;
use App\Models\Quest\QuestTaskCompletion;
use App\Models\Quiz\QuizSession;
use App\Models\Quiz\UserQuizAnswer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LiveAggregateService
{
    private const DEBOUNCE_MILLISECONDS = 1000;
    private const DEBOUNCE_SECONDS = 1;

    public function recordAnswer(string $module, int $sessionId, int $itemId): void
    {
        Cache::increment($this->counterKey($module, $sessionId, $itemId));

        if (! Cache::add($this->debounceKey($module, $sessionId, $itemId), true, self::DEBOUNCE_SECONDS)) {
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
                $this->snapshot($module, $sessionId, $itemId),
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
            $this->snapshot($module, $sessionId, $itemId),
        );
    }

    public function currentSnapshot(string $module, QuestSession|QuizSession $session): ?array
    {
        $itemId = $module === LiveSessionService::MODULE_QUEST
            ? $session->current_task_id
            : $session->current_question_id;

        if (! $itemId) {
            return null;
        }

        return $this->snapshot($module, (int) $session->id, (int) $itemId);
    }

    public function snapshot(string $module, int $sessionId, int $itemId): array
    {
        $snapshot = $module === LiveSessionService::MODULE_QUEST
            ? $this->questSnapshot($sessionId, $itemId)
            : $this->quizSnapshot($sessionId, $itemId);

        return array_merge($snapshot, [
            'module' => $module,
            'event' => 'answer.aggregate.updated',
        ]);
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
        $task = QuestTask::find($taskId);
        $completions = QuestTaskCompletion::query()
            ->where('task_id', $taskId)
            ->whereHas('participant', fn ($query) => $query->where('quest_session_id', $sessionId))
            ->get(['completion_data', 'status']);
        $payloads = $completions->pluck('completion_data')->all();

        return [
            'session_id' => $sessionId,
            'task_id' => $taskId,
            'total_answers' => $completions->count(),
            'statuses' => $completions->countBy('status')->all(),
            'answers' => $this->countAnswerValues($payloads),
            'chart' => $this->questChart($task, $payloads, $completions->count()),
        ];
    }

    private function questChart(?QuestTask $task, array $payloads, int $totalAnswers): ?array
    {
        if (! $task) {
            return null;
        }

        $taskType = strtolower((string) $task->task_type);

        if (in_array($taskType, ['ranking', 'sorting', 'shorting'], true)) {
            return $this->rankingChart($task, $payloads, $totalAnswers, $taskType);
        }

        if (in_array($taskType, ['scales', 'scaling'], true)) {
            return $this->scalesChart($task, $payloads, $totalAnswers);
        }

        return null;
    }

    private function rankingChart(QuestTask $task, array $payloads, int $totalAnswers, string $taskType): array
    {
        $questions = $this->taskQuestions($task);
        $optionCount = count($questions);
        $sums = array_fill(0, $optionCount, 0);

        foreach ($payloads as $payload) {
            $ranking = $this->normalizeSelectedArray(
                $this->extractAnswerValue($this->normalizePayload($payload))
            );

            foreach ($ranking as $position => $optionIndex) {
                $index = $this->numericIndex($optionIndex);

                if ($index === null || $index < 0 || $index >= $optionCount) {
                    continue;
                }

                $rankValue = $optionCount - (int) $position;
                if ($rankValue > 0) {
                    $sums[$index] += $rankValue;
                }
            }
        }

        $maxSum = $sums ? max($sums) : 0;
        $scores = [];

        foreach ($sums as $index => $sum) {
            $scores[(string) $index] = $maxSum > 0 ? (int) round(($sum * 100) / $maxSum) : 0;
        }

        return [
            'type' => $taskType,
            'value_type' => 'percentage',
            'total_answers' => $totalAnswers,
            'scores' => (object) $scores,
            'order' => $this->scoreOrder($scores),
        ];
    }

    private function scalesChart(QuestTask $task, array $payloads, int $totalAnswers): array
    {
        $questions = $this->taskQuestions($task);
        $optionCount = count($questions);
        $taskData = is_array($task->task_data) ? $task->task_data : [];
        $scaleMax = is_numeric($taskData['maxNumber'] ?? null) ? (float) $taskData['maxNumber'] : 5.0;
        $highestValue = max((int) ceil(max($scaleMax, 1) / 5) * 5, 1);
        $sums = array_fill(0, $optionCount, 0.0);
        $counts = array_fill(0, $optionCount, 0);

        foreach ($payloads as $payload) {
            $values = $this->normalizeSelectedArray(
                $this->extractAnswerValue($this->normalizePayload($payload))
            );

            foreach ($values as $position => $value) {
                $positionIndex = $this->numericIndex($position);

                if ($positionIndex === null || $positionIndex < 0 || $positionIndex >= $optionCount || ! is_numeric($value)) {
                    continue;
                }

                $sums[$positionIndex] += (float) $value;
                $counts[$positionIndex]++;
            }
        }

        $scores = [];

        foreach ($sums as $index => $sum) {
            $scores[(string) $index] = $counts[$index] > 0
                ? (int) round(($sum / ($highestValue * $counts[$index])) * 100)
                : 0;
        }

        return [
            'type' => 'scales',
            'value_type' => 'percentage',
            'total_answers' => $totalAnswers,
            'scores' => (object) $scores,
            'order' => $this->scoreOrder($scores),
            'highest_value' => $highestValue,
        ];
    }

    private function taskQuestions(QuestTask $task): array
    {
        $taskData = is_array($task->task_data) ? $task->task_data : [];
        $questions = $taskData['questions'] ?? [];

        return is_array($questions) ? $questions : [];
    }

    private function scoreOrder(array $scores): array
    {
        $order = array_keys($scores);

        usort($order, function (string $left, string $right) use ($scores) {
            $scoreDiff = ($scores[$right] ?? 0) <=> ($scores[$left] ?? 0);

            return $scoreDiff !== 0 ? $scoreDiff : ((int) $left <=> (int) $right);
        });

        return array_map('intval', $order);
    }

    private function countAnswerValues(array $payloads): array
    {
        $counts = [];

        foreach ($payloads as $payload) {
            $value = $this->extractAnswerValue($this->normalizePayload($payload));
            $key = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value;
            $key = $key !== '' ? $key : 'submitted';
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }

        ksort($counts);

        return $counts;
    }

    private function normalizePayload(mixed $payload): array
    {
        if (is_array($payload)) {
            return $payload;
        }

        $decoded = json_decode((string) $payload, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function normalizeSelectedArray(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return $value === null || $value === '' ? [] : [$value];
    }

    private function numericIndex(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value;
        }

        return null;
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
