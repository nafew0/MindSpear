<?php

namespace App\Http\Requests\Quest\QuestTask;

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
            'q_bank_category_id' => 'nullable|exists:quest_task_bank_categories,id',
        ];
    }
}

