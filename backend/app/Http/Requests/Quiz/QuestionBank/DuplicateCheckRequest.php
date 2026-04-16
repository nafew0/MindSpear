<?php

namespace App\Http\Requests\Quiz\QuestionBank;

use App\Http\Requests\BaseFormRequest;

class DuplicateCheckRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_text' => 'required|string',
            'question_type' => 'required|string',
            'visibility' => 'required|in:public,private,unlisted',
            'exclude_id' => 'nullable|integer|exists:quiz_bank_questions,id',
        ];
    }
}

