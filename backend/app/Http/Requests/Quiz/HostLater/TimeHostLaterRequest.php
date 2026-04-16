<?php

namespace App\Http\Requests\Quiz\HostLater;

use App\Http\Requests\BaseFormRequest;
use App\Models\Quiz\Quiz;
use App\Models\Quiz\QuizSession;

class TimeHostLaterRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'timezone' => 'nullable|string|max:255',
            'start_datetime' => [
                'required',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $timezone = $this->input('timezone') ?: config('app.timezone');
                    $this->validateDateTimeInTimezone($attribute, $value, $timezone, $fail);
                },
            ],
            'end_datetime' => [
                'required',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $timezone = $this->input('timezone') ?: config('app.timezone');
                    $this->validateDateTimeInTimezone($attribute, $value, $timezone, $fail);
                },
                'after:start_datetime',
            ],
        ];
    }

    /**
     * Validate that the datetime is in the specified timezone.
     */
    private function validateDateTimeInTimezone($attribute, $value, $timezone, $fail): void
    {
        if (empty($value)) {
            return;
        }

        try {
            $dt = new \DateTime($value, new \DateTimeZone($timezone));
            // Additional validation if needed
        } catch (\Exception $e) {
            $fail("The $attribute is not a valid datetime in the $timezone timezone.");
        }
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated();
        $timezone = $this->input('timezone') ?: config('app.timezone');

        return array_merge($data, [
            'start_datetime' => $this->convertToUtc($this->input('start_datetime'), $timezone),
            'end_datetime' => $this->convertToUtc($this->input('end_datetime'), $timezone),
            'timezone' => $timezone,
        ]);
    }

    /**
     * Validate that the quiz doesn't overlap with existing quizzes for the same host
     */
    private function validateNoOverlappingQuizzes($attribute, $value, $fail): void
    {
        if (empty($value)) {
            return;
        }

        $timezone = $this->input('timezone') ?: config('app.timezone');
        $userId = auth()->id();

        // Convert input datetime to UTC for database comparison
        $startDateTimeUtc = $this->convertToUtc($value, $timezone);
        $endDateTimeUtc = $this->convertToUtc($this->input('end_datetime'), $timezone);

        if (! $startDateTimeUtc || ! $endDateTimeUtc) {
            $fail('Invalid datetime format provided.');

            return;
        }

        // Get the quiz ID from route if available
        $currentQuizId = $this->route('id');

        // Simplified overlap check for quizzes
        $overlappingQuizSession = QuizSession::query()
            ->whereHas('quiz', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where('start_datetime', '<', $endDateTimeUtc)
            ->where('end_datetime', '>', $startDateTimeUtc)
            ->whereNull('deleted_at');

        if ($currentQuizId) {
            $overlappingQuizSession->where('id', '!=', $currentQuizId);
        }

        $overlappingQuizSession = $overlappingQuizSession->first();

        if ($overlappingQuizSession) {
            $fail("The selected time slot conflicts with an existing quiz '{$overlappingQuizSession->title}' scheduled from {$overlappingQuizSession->start_datetime} to {$overlappingQuizSession->end_datetime}.");
        }
    }

    /**
     * Convert given datetime string from request or config timezone to UTC.
     */
    private function convertToUtc(?string $value, string $timezone): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            $datetime = new \DateTime($value, new \DateTimeZone($timezone));
            $datetime->setTimezone(new \DateTimeZone('UTC'));

            return $datetime->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            return null;
        }
    }
}
