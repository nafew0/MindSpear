<?php

namespace App\Http\Requests\Quiz\QuizAttempt;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class RecordAnswerRequest extends BaseFormRequest
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
            'question_id' => 'required|exists:questions,id',
            'answer_data' => 'nullable|array',
            'time_taken_seconds' => 'nullable|integer|min:0',
        ];
    }
}
