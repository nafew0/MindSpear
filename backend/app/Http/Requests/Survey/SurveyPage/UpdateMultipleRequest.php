<?php

namespace App\Http\Requests\Survey\SurveyPage;

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
            'pages' => 'required|array',
            'pages.*.id' => 'required|exists:survey_pages,id',
            'pages.*.survey_id' => 'sometimes|required|exists:surveys,id',
            'pages.*.page_number' => 'sometimes|required|integer|min:1',
            'pages.*.title' => 'sometimes|nullable|string|max:100',
            'pages.*.description' => 'sometimes|nullable|string',
            'pages.*.has_conditional_logic' => 'sometimes|boolean',
            'pages.*.conditional_parent_type' => 'sometimes|nullable|string|in:question,page',
            'pages.*.conditional_question_id' => 'sometimes|nullable|exists:survey_questions,id',
            'pages.*.conditional_page_id' => 'sometimes|nullable|exists:survey_pages,id',
            'pages.*.conditional_value' => 'sometimes|nullable|string|max:100',
            'pages.*.conditional_operator' => 'sometimes|nullable|string|in:equals,not_equals,greater_than,less_than,contains',
        ];
    }
}
