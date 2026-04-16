<?php

namespace App\Http\Requests\Quiz\Question;

use App\Http\Requests\BaseFormRequest;

class StoreMultipleRequest extends BaseFormRequest
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
            'questions' => 'required|array',
            'questions.*.quiz_id' => 'nullable|integer',
            'questions.*.serial_number' => 'nullable|integer',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'nullable|string',
            'questions.*.visibility' => 'required|string|in:public,private,unlisted',
            'questions.*.time_limit_seconds' => 'nullable|integer|min:0',
            'questions.*.points' => 'nullable|integer|min:0',
            'questions.*.is_ai_generated' => 'boolean',
            'questions.*.source_content_url' => 'nullable|url',
            'questions.*.options' => 'nullable|array',
            'questions.*.deleted_at' => 'nullable|date',
            'questions.*.deleted_by' => 'nullable|exists:users,id',
        ];
    }
}
