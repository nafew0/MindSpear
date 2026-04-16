<?php

namespace App\Http\Requests\Quest\QuestTask;

use App\Http\Requests\BaseFormRequest;

class UpdateRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'quest_id' => 'sometimes|exists:quests,id',
            // bank category moved to quest bank tasks
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'task_type' => 'sometimes|string',
            'serial_number' => 'sometimes|integer',
            'task_data' => 'nullable|array',
            'is_required' => 'nullable|boolean',
            'visibility' => 'sometimes|nullable|string|in:public,private,unlisted',
            'prerequisite_task_id' => 'sometimes|nullable|exists:quest_tasks,id',
        ];
    }
}
