<?php

namespace App\Http\Requests\Survey\SurveyPage;

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
            'survey_id' => 'sometimes|required|exists:surveys,id',
            'page_number' => 'sometimes|required|integer|min:1',
            'title' => 'sometimes|nullable|string|max:100',
            'description' => 'sometimes|nullable|string',
            'has_conditional_logic' => 'sometimes|boolean',
            'conditional_parent_type' => 'sometimes|nullable|string|in:question,page',
            'conditional_question_id' => 'sometimes|nullable|exists:survey_questions,id',
            'conditional_page_id' => 'sometimes|nullable|exists:survey_pages,id',
            'conditional_value' => 'sometimes|nullable|string|max:100',
            'conditional_operator' => 'sometimes|nullable|string|in:equals,not_equals,greater_than,less_than,contains',
        ];
    }
}
