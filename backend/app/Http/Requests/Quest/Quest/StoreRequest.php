<?php

namespace App\Http\Requests\Quest\Quest;

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
            'description' => 'nullable|string|max:1000',
            'is_published' => 'nullable',
            'visibility' => 'nullable|in:public,private',
            'sequential_progression' => 'nullable',
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
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'creator_id' => auth()->id(),
            'join_link' => generate_quest_join_link(),
            'join_code' => generate_quest_join_code(),
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
            'creator_id' => $this->input('creator_id'),
            'join_link' => $this->input('join_link'),
            'join_code' => $this->input('join_code'),
            'start_datetime' => $this->convertToUtc($this->input('start_datetime'), $timezone),
            'end_datetime' => $this->convertToUtc($this->input('end_datetime'), $timezone),
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
