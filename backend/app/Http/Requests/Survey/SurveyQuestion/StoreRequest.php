<?php

namespace App\Http\Requests\Survey\SurveyQuestion;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'survey_id' => 'required|exists:surveys,id',
            'page_id' => 'nullable|exists:survey_pages,id',
            // bank category moved to survey bank questions
            'serial_number' => 'nullable|integer',
            'question_text' => 'required|string',
            'question_type' => 'nullable|string',
            'options' => 'nullable|array',
            'visibility' => 'nullable|string|in:public,private,unlisted',
            'is_required' => 'boolean',
            'has_conditional_logic' => 'boolean',
            'conditional_parent_type' => 'nullable|string|in:question,page',
            'conditional_question_id' => 'nullable|exists:survey_questions,id',
            'conditional_page_id' => 'nullable|exists:survey_pages,id',
            'conditional_value' => 'nullable|string|max:100',
            'conditional_operator' => 'nullable|string|in:equals,not_equals,greater_than,less_than,contains',
            'display_type' => 'nullable|string|in:default,inline,matrix,grid',
            'display_conditions' => 'nullable|array',
        ];
    }
}
