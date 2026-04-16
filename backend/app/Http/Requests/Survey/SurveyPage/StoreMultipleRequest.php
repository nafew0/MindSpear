<?php

namespace App\Http\Requests\Survey\SurveyPage;

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
            'pages' => 'required|array',
            'pages.*.survey_id' => 'required|exists:surveys,id',
            'pages.*.page_number' => 'required|integer|min:1',
            'pages.*.title' => 'nullable|string|max:100',
            'pages.*.description' => 'nullable|string',
            'pages.*.has_conditional_logic' => 'boolean',
            'pages.*.conditional_parent_type' => 'nullable|string|in:question,page',
            'pages.*.conditional_question_id' => 'nullable|exists:survey_questions,id',
            'pages.*.conditional_page_id' => 'nullable|exists:survey_pages,id',
            'pages.*.conditional_value' => 'nullable|string|max:100',
            'pages.*.conditional_operator' => 'nullable|string|in:equals,not_equals,greater_than,less_than,contains',
        ];
    }
}
