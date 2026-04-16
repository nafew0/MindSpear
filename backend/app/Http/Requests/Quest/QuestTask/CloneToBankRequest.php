<?php

namespace App\Http\Requests\Quest\QuestTask;

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
            'task_id' => 'required|exists:quest_tasks,id',
            'q_bank_category_id' => 'nullable|exists:quest_task_bank_categories,id',
        ];
    }
}

