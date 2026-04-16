<?php

use App\Models\Quest\Quest;
use App\Models\Quiz\Quiz;
use Illuminate\Support\Str;

/**
 * Get the storage path for the given file.
 */
if (! function_exists('getStorageDriver')) {
    /**
     * Get the storage driver.
     */
    function getStorageDriver(): string
    {
        // Return the desired storage driver, e.g., 'public' or 's3'.
        return config('filesystems.default', 'local');
    }
}

/**
 * Get the storage path for the given file.
 */
if (! function_exists('frontend_url')) {
    function frontend_url(string $path = ''): string
    {
        return rtrim(config('app.frontend_url'), '/') . '/' . ltrim($path, '/');
    }
}

/**
 * Generate a unique join link for quizzes.
 */
if (! function_exists('generate_quiz_join_link')) {
    function generate_quiz_join_link(): string
    {
        // Format: xxxx-xxxx-xxxx (4 groups of 3 alphanumeric chars)
        $link = strtolower(implode('-', [
            Str::random(3),
            Str::random(3),
            Str::random(3),
            Str::random(3),
        ]));

        // If the link already exists, generate a new one recursively
        if (Quiz::where('close_datetime', '>', now())->where('join_link', $link)->exists()) {
            return generate_quiz_join_link(); // Try again
        }

        return $link;
    }
}

/**
 * * Generate a unique join code for quizzes.
 */
if (! function_exists('generate_quiz_join_code')) {
    function generate_quiz_join_code(): string
    {
        // Generate a random 6-digit number (000000 to 999999)
        $code = Str::padLeft(random_int(0, 999999), 6, '0');

        // If the code already exists, generate a new one recursively
        if (Quiz::where('close_datetime', '>', now())->where('join_code', $code)->exists()) {
            return generate_quiz_join_code(); // Try again
        }

        return $code;
    }
}

/**
 * Generate a unique join link for surveys.
 */
if (! function_exists('generate_survey_join_link')) {
    function generate_survey_join_link(): string
    {
        // Format: xxxx-xxxx-xxxx (4 groups of 3 alphanumeric chars)
        $link = strtolower(implode('-', [
            Str::random(3),
            Str::random(3),
            Str::random(3),
        ]));

        // If the link already exists, generate a new one recursively
        if (Quiz::where('close_datetime', '>', now())->where('join_link', $link)->exists()) {
            return generate_survey_join_link(); // Try again
        }

        return $link;
    }
}

/**
 * Generate a unique join link for quests.
 */
if (! function_exists('generate_quest_join_link')) {
    function generate_quest_join_link(): string
    {
        // Format: xxxx-xxxx-xxxx (4 groups of 3 alphanumeric chars)
        $link = strtolower(implode('-', [
            Str::random(3),
            Str::random(3),
            Str::random(3),
            Str::random(3),
        ]));

        // If the link already exists, generate a new one recursively
        if (Quest::where('end_datetime', '>', now())->where('join_link', $link)->exists()) {
            return generate_quest_join_link(); // Try again
        }

        return $link;
    }
}

/**
 * * Generate a unique join code for quests.
 */
if (! function_exists('generate_quest_join_code')) {
    function generate_quest_join_code(): string
    {
        // Generate a random 6-digit number (000000 to 999999)
        $code = Str::padLeft(random_int(0, 999999), 6, '0');

        // If the code already exists, generate a new one recursively
        if (Quest::where('end_datetime', '>', now())->where('join_code', $code)->exists()) {
            return generate_quest_join_code(); // Try again
        }

        return $code;
    }
}

/**
 * Generate a unique session ID for quests.
 */
if (! function_exists('generate_quest_session_id')) {
    function generate_quest_session_id($questId, $startTime): string
    {
        $now = $startTime ? date('YmdHis', strtotime($startTime)) : now()->format('YmdHis');
        $randomStr = Str::upper(Str::random(6));
        $questId = $questId ?? Str::random(4);
        $sessionId = "QUEST-{$questId}-{$now}-{$randomStr}";

        return $sessionId;
    }
}

/**
 * Generate a unique session ID for quizzes.
 */
if (! function_exists('generate_quiz_session_id')) {
    function generate_quiz_session_id($quizId, $startTime): string
    {
        $now = $startTime ? date('YmdHis', strtotime($startTime)) : now()->format('YmdHis');
        $randomStr = Str::upper(Str::random(6));
        $quizId = $quizId ?? Str::random(4);
        $sessionId = "QUIZ-{$quizId}-{$now}-{$randomStr}";

        return $sessionId;
    }
}
