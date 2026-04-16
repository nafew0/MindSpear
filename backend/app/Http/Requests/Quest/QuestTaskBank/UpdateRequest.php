<?php

namespace App\Http\Requests\Quest\QuestTaskBank;

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
            'q_bank_category_id' => 'nullable|exists:quest_task_bank_categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'task_type' => 'sometimes|string',
            'task_data' => 'nullable|array',
            'is_required' => 'nullable|boolean',
            'visibility' => 'sometimes|nullable|string|in:public,private,unlisted',
        ];
    }
}

