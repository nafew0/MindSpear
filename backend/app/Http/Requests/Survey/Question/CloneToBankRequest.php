<?php

namespace App\Http\Requests\Survey\Question;

use App\Http\Requests\BaseFormRequest;

class CloneToBankRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => 'required|exists:survey_questions,id',
            'q_bank_category_id' => 'nullable|exists:survey_q_bank_categories,id',
        ];
    }
}

