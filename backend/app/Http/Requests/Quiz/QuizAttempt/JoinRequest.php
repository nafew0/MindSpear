<?php

namespace App\Http\Requests\Quiz\QuizAttempt;

use App\Http\Requests\BaseFormRequest;

class JoinRequest extends BaseFormRequest
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
            'anonymous_name' => 'nullable|string|max:255',
            'anonymous_email' => 'nullable|email|max:255',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
        ];
    }
}
