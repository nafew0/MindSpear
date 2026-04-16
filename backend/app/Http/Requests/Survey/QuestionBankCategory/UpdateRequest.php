<?php

namespace App\Http\Requests\Survey\QuestionBankCategory;

use App\Http\Requests\BaseFormRequest;

class UpdateRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:50',
            'description' => 'nullable|string',
            'is_parent' => 'boolean',
            'parent_category_id' => 'nullable|exists:survey_q_bank_categories,id',
        ];
    }
}

