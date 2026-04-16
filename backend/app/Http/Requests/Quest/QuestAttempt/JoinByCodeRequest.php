<?php

namespace App\Http\Requests\Quest\QuestAttempt;

use App\Http\Requests\BaseFormRequest;

class JoinByCodeRequest extends BaseFormRequest
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
            'join_code' => 'required|string|max:255',
            'anonymous_name' => 'nullable|string|max:255',
            'anonymous_email' => 'nullable|email|max:255',
            'start_time' => 'nullable|date_format:Y-m-d H:i:s',
        ];
    }
}
