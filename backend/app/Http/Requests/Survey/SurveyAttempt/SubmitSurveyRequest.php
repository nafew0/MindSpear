<?php

namespace App\Http\Requests\Survey\SurveyAttempt;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class SubmitSurveyRequest extends BaseFormRequest
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
            'survey_id' => 'required|integer|exists:surveys,id',
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
