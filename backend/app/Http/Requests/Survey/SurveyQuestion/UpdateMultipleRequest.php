<?php

namespace App\Http\Requests\Survey\SurveyQuestion;

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
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:survey_questions,id',
            'questions.*.survey_id' => 'sometimes|required|exists:surveys,id',
            'questions.*.page_id' => 'nullable|exists:survey_pages,id',
            // bank category moved to survey bank questions
            'questions.*.serial_number' => 'nullable|integer',
            'questions.*.question_text' => 'sometimes|required|string',
            'questions.*.question_type' => 'sometimes|nullable|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.visibility' => 'sometimes|nullable|string|in:public,private,unlisted',
            'questions.*.is_required' => 'boolean',
            'questions.*.has_conditional_logic' => 'boolean',
            'questions.*.conditional_parent_type' => 'nullable|string|in:question,page',
            'questions.*.conditional_question_id' => 'nullable|exists:survey_questions,id',
            'questions.*.conditional_page_id' => 'nullable|exists:survey_pages,id',
            'questions.*.conditional_value' => 'nullable|string|max:100',
            'questions.*.conditional_operator' => 'nullable|string|in:equals,not_equals,greater_than,less_than,contains',
            'questions.*.display_type' => 'nullable|string|in:default,inline,matrix,grid',
            'questions.*.display_conditions' => 'nullable|array',
        ];
    }
}
