<?php

namespace App\Http\Requests\Survey\SurveyPage;

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
            'page_number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'has_conditional_logic' => 'boolean',
            'conditional_parent_type' => 'nullable|string|in:question,page',
            'conditional_question_id' => 'nullable|exists:survey_questions,id',
            'conditional_page_id' => 'nullable|exists:survey_pages,id',
            'conditional_value' => 'nullable|string|max:100',
            'conditional_operator' => 'nullable|string|in:equals,not_equals,greater_than,less_than,contains',
        ];
    }
}
