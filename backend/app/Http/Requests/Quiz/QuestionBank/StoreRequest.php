<?php

namespace App\Http\Requests\Quiz\QuestionBank;

use App\Http\Requests\BaseFormRequest;

class StoreRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q_bank_category_id' => 'nullable|exists:quiz_q_bank_categories,id',
            'question_text' => 'required|string',
            'question_type' => 'required|string',
            'visibility' => 'nullable|in:public,private,unlisted',
            'time_limit_seconds' => 'nullable|integer|min:0',
            'points' => 'nullable|integer|min:0',
            'is_ai_generated' => 'boolean',
            'source_content_url' => 'nullable|url',
            'options' => 'nullable|array',
            'options.choices' => 'nullable|array',
            'options.correct_answer' => 'nullable',
        ];
    }
}

