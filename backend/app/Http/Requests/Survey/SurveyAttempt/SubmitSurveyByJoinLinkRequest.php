<?php

namespace App\Http\Requests\Survey\SurveyAttempt;

use App\Http\Requests\BaseFormRequest;

class SubmitSurveyByJoinLinkRequest extends BaseFormRequest
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
            'responses' => 'required|array|min:1',
            'responses.*.question_id' => 'required|integer|distinct|exists:survey_questions,id',
            'responses.*.answer' => 'present',
            'submitted_at' => 'nullable|date',
            'anonymous_details' => 'nullable|array',
            'anonymous_details.name' => 'nullable|string|max:255',
            'anonymous_details.email' => 'nullable|email|max:255',
        ];
    }
}
