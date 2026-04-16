<?php

namespace App\Http\Requests\Quest\QuestTask;

use App\Http\Requests\BaseFormRequest;

class StoreRequest extends BaseFormRequest
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
            'quest_id' => 'required|exists:quests,id',
            // bank category moved to quest bank tasks
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'task_type' => 'required|string',
            'serial_number' => 'required|integer',
            'task_data' => 'nullable|array',
            'is_required' => 'nullable|boolean',
            'visibility' => 'nullable|string|in:public,private,unlisted',
            'prerequisite_task_id' => 'nullable|exists:quest_tasks,id',
        ];
    }
}
