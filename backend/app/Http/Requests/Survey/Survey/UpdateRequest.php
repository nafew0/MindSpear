<?php

namespace App\Http\Requests\Survey\Survey;

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
            'title' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|nullable|string',
            'open_datetime' => 'sometimes|nullable|date',
            'close_datetime' => 'sometimes|nullable|date|after_or_equal:open_datetime',
            'is_published' => 'sometimes|boolean',
            'visibility' => 'sometimes|required|string|in:public,private',
        ];
    }
}
