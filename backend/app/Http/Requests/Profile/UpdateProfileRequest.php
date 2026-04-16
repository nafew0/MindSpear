<?php

namespace App\Http\Requests\Profile;

use App\Http\Requests\BaseFormRequest;

class UpdateProfileRequest extends BaseFormRequest
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
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|max:255|unique:users,email,' . $this->user()->id,
            'phone'      => 'sometimes|string|max:20|unique:users,phone,' . $this->user()->id,
            'designation' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'institution_id' => 'nullable|exists:institutions,id',
            'institution_name' => 'nullable|string|max:255',
        ];
    }
}
