<?php

namespace App\Http\Requests\Survey\SurveyQuestionBank;

use App\Http\Requests\BaseFormRequest;

class UpdateRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q_bank_category_id' => 'nullable|exists:survey_q_bank_categories,id',
            'question_text' => 'sometimes|string',
            'question_type' => 'sometimes|nullable|string',
            'options' => 'sometimes|nullable|array',
            'visibility' => 'sometimes|nullable|in:public,private,unlisted',
            'is_required' => 'sometimes|boolean',
            'display_type' => 'sometimes|nullable|string',
            'display_conditions' => 'sometimes|nullable|array',
        ];
    }
}

