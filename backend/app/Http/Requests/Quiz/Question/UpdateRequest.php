<?php

namespace App\Http\Requests\Quiz\Question;

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
            'quiz_id' => 'sometimes|nullable|integer',
            // Bank category removed from quiz questions
            'serial_number' => 'sometimes|nullable|integer',
            'question_text' => 'sometimes|required|string',
            'question_type' => 'sometimes|nullable|string',
            'visibility' => 'sometimes|required|string|in:public,private,unlisted',
            'time_limit_seconds' => 'sometimes|nullable|integer|min:0',
            'points' => 'sometimes|nullable|integer|min:0',
            'is_ai_generated' => 'sometimes|boolean',
            'source_content_url' => 'sometimes|nullable|url',
            'options' => 'sometimes|nullable|array',
            'deleted_at' => 'sometimes|nullable|date',
            'deleted_by' => 'sometimes|nullable|exists:users,id',
        ];
    }
}
