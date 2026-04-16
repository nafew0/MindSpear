<?php

namespace App\Http\Requests\Quiz\Quiz;

use App\Http\Requests\BaseFormRequest;

class StoreRequest extends BaseFormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'is_published' => 'nullable|boolean',
            'visibility' => 'nullable|string|in:public,private,unlisted',
            'quiztime_mode' => 'nullable|boolean',
            'duration' => 'nullable|integer|min:0',
            'logged_in_users_only' => 'nullable|boolean',
            'safe_browser_mode' => 'nullable|boolean',
            'quiz_mode' => 'nullable|string|in:normal,practice,exam',
            'timezone' => 'nullable|string|max:255',
            'deleted_at' => 'nullable|date',
            'deleted_by' => 'nullable|exists:users,id',
            'open_datetime' => [
                'nullable',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $timezone = $this->input('timezone') ?: config('app.timezone');
                    $this->validateDateTimeInTimezone($attribute, $value, $timezone, $fail);
                },
            ],
            'close_datetime' => [
                'nullable',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $timezone = $this->input('timezone') ?: config('app.timezone');
                    $this->validateDateTimeInTimezone($attribute, $value, $timezone, $fail);
                },
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => auth()->id(),
            'join_link' => generate_quiz_join_link(),
            'join_code' => generate_quiz_join_code(),
        ]);
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

        return array_merge($data, [
            'user_id' => $this->input('user_id'),
            'join_link' => $this->input('join_link'),
            'join_code' => $this->input('join_code'),
            'open_datetime' => $this->convertToUtc($this->input('open_datetime'), $timezone),
            'close_datetime' => $this->convertToUtc($this->input('close_datetime'), $timezone),
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
