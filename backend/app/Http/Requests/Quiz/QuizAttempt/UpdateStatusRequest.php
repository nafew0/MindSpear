<?php

namespace App\Http\Requests\Quiz\QuizAttempt;

use App\Http\Requests\BaseFormRequest;

class UpdateStatusRequest extends BaseFormRequest
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
            'status' => 'required|in:In Progress,Completed,Abandoned',
            'end_time' => 'nullable|date_format:Y-m-d H:i:s',
        ];
    }
}
