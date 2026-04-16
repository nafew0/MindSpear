<?php

namespace App\Http\Requests\Survey\SurveyQuestionBank;

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
            'q_bank_category_id' => 'nullable|exists:survey_q_bank_categories,id',
            'question_text' => 'required|string',
            'question_type' => 'nullable|string',
            'options' => 'nullable|array',
            'visibility' => 'nullable|in:public,private,unlisted',
            'is_required' => 'boolean',
            'display_type' => 'nullable|string',
            'display_conditions' => 'nullable|array',
        ];
    }
}

