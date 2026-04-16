<?php

namespace App\Http\Requests\Quiz\Question;

use App\Http\Requests\BaseFormRequest;
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
            'quiz_id' => 'nullable|integer',
            // Bank category removed from quiz questions
            'serial_number' => 'nullable|integer',
            'question_text' => 'nullable|string',
            'question_type' => 'nullable|string',
            'visibility' => 'nullable|string|in:public,private,unlisted',
            'time_limit_seconds' => 'nullable|integer|min:0',
            'points' => 'nullable|integer|min:0',
            'is_ai_generated' => 'boolean',
            'source_content_url' => 'nullable|url',
            'options' => 'nullable|array',
            'options.choices' => 'nullable|array',
            'options.correct_answer' => 'nullable',
            'deleted_at' => 'nullable|date',
            'deleted_by' => 'nullable|exists:users,id',
        ];
    }
}
