<?php

namespace App\Http\Requests\Quiz\Quiz;

use App\Http\Requests\BaseFormRequest;

class UpdateRequest extends BaseFormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|nullable|string',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'is_published' => 'sometimes|nullable|boolean',
            'visibility' => 'sometimes|nullable|string|in:public,private,unlisted',
            'quiztime_mode' => 'sometimes|nullable|boolean',
            'duration' => 'sometimes|nullable|integer|min:0',
            'logged_in_users_only' => 'sometimes|nullable|boolean',
            'safe_browser_mode' => 'sometimes|nullable|boolean',
            'quiz_mode' => 'sometimes|nullable|string|in:normal,practice,exam',
            'timezone' => 'sometimes|nullable|string|max:255',
            'deleted_at' => 'sometimes|nullable|date',
            'deleted_by' => 'sometimes|nullable|exists:users,id',
            'open_datetime' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $this->validateDateTimeInTimezone($attribute, $value, $fail);
                },
            ],
            'close_datetime' => [
                'sometimes',
                'nullable',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $this->validateDateTimeInTimezone($attribute, $value, $fail);
                },
            ],
        ];
    }

    /**
     * Validate that the datetime is in the specified timezone.
     */
    private function validateDateTimeInTimezone($attribute, $value, $fail): void
    {
        if (empty($value)) {
            return;
        }

        $timezone = $this->input('timezone') ?: config('app.timezone');

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

        $convertedData = [];

        if ($this->has('open_datetime')) {
            $convertedData['open_datetime'] = $this->convertToUtc(
                $this->input('open_datetime'),
                $timezone
            );
        }

        if ($this->has('close_datetime')) {
            $convertedData['close_datetime'] = $this->convertToUtc(
                $this->input('close_datetime'),
                $timezone
            );
        }

        return array_merge($data, $convertedData, [
            'timezone' => $timezone,
        ]);
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
