<?php

namespace App\Http\Requests\Quiz\QuestionBankCategory;

use App\Http\Requests\BaseFormRequest;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_parent' => 'boolean',
            'parent_category_id' => 'nullable|exists:quiz_q_bank_categories,id',
            'color_code' => 'nullable|string|max:7',
        ];
    }
}
