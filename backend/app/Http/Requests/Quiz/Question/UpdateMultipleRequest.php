<?php

namespace App\Http\Requests\Quiz\Question;

use App\Http\Requests\BaseFormRequest;

class UpdateMultipleRequest extends BaseFormRequest
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
            'questions' => 'sometimes|required|array',
            'questions.*.id' => 'sometimes|required|exists:questions,id',
            'questions.*.quiz_id' => 'sometimes|nullable|integer',
            'questions.*.serial_number' => 'sometimes|nullable|integer',
            'questions.*.question_text' => 'sometimes|required|string',
            'questions.*.question_type' => 'sometimes|nullable|string',
            'questions.*.visibility' => 'sometimes|required|string|in:public,private,unlisted',
            'questions.*.time_limit_seconds' => 'sometimes|nullable|integer|min:0',
            'questions.*.points' => 'sometimes|nullable|integer|min:0',
            'questions.*.is_ai_generated' => 'sometimes|boolean',
            'questions.*.source_content_url' => 'sometimes|nullable|url',
            'questions.*.options' => 'sometimes|nullable|array',
            'questions.*.deleted_at' => 'sometimes|nullable|date',
            'questions.*.deleted_by' => 'sometimes|nullable|exists:users,id',
        ];
    }
}
