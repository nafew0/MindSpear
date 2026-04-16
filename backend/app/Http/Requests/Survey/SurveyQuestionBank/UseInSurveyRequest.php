<?php

namespace App\Http\Requests\Survey\SurveyQuestionBank;

use App\Http\Requests\BaseFormRequest;

class UseInSurveyRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'survey_id' => 'required|exists:surveys,id',
            'page_id' => 'nullable|exists:survey_pages,id',
            'serial_number' => 'nullable|integer',
        ];
    }
}

