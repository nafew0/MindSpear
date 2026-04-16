<?php

namespace App\Http\Requests\Quest\HostLive;

use App\Http\Requests\BaseFormRequest;
use DateTime;
use DateTimeZone;
use Exception;
use Illuminate\Contracts\Validation\ValidationRule;

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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'timezone' => 'nullable|string|max:255',
            'start_datetime' => [
                'required',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    $timezone = $this->input('timezone') ?: config('app.timezone');
                    $this->validateDateTimeInTimezone($attribute, $value, $timezone, $fail);
                },
            ],
//            'end_datetime' => [
//                'required',
//                'date_format:Y-m-d H:i:s',
//                function ($attribute, $value, $fail) {
//                    $timezone = $this->input('timezone') ?: config('app.timezone');
//                    $this->validateDateTimeInTimezone($attribute, $value, $timezone, $fail);
//                },
//            ],
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
            $dt = new DateTime($value, new DateTimeZone($timezone));
            // Additional validation if needed
        } catch (Exception $e) {
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
     * Convert given datetime string from request or config timezone to UTC.
     */
    private function convertToUtc(?string $value, string $timezone): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            $datetime = new DateTime($value, new DateTimeZone($timezone));
            $datetime->setTimezone(new DateTimeZone('UTC'));

            return $datetime->format('Y-m-d H:i:s');
        } catch (Exception $e) {
            return null;
        }
    }
}
