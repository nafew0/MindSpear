<?php

namespace App\Http\Requests\Survey\SurveyQuestion;

use App\Http\Requests\BaseFormRequest;

class CopyToBankRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q_bank_category_id' => 'nullable|exists:survey_q_bank_categories,id',
        ];
    }
}

