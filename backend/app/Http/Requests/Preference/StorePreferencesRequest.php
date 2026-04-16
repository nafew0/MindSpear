<?php

namespace App\Http\Requests\Preference;

use App\Http\Requests\BaseFormRequest;

class StorePreferencesRequest extends BaseFormRequest
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
            'category' => 'required|string|max:50',
            'field' => 'required|string|max:50',
            'value' => 'required',
        ];
    }
}
