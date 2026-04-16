<?php

namespace App\Http\Requests\Quest\QuestAttempt;

use App\Http\Requests\BaseFormRequest;

class RecordTaskCompletionRequest extends BaseFormRequest
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
            'task_id' => 'required|exists:quest_tasks,id',
            'completion_data' => 'required|array',
        ];
    }
}
