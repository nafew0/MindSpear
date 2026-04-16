<?php

namespace App\Http\Requests\Quiz\QuestionBankCategory;

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
            'name' => 'sometimes|nullable|string|max:50',
            'description' => 'sometimes|nullable|string',
            'is_parent' => 'sometimes|boolean',
            'parent_category_id' => 'sometimes|nullable|exists:quiz_q_bank_categories,id',
            'color_code' => 'sometimes|nullable|string|max:7',
        ];
    }
}
