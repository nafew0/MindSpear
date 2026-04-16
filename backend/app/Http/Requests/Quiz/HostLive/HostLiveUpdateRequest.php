<?php

namespace App\Http\Requests\Quiz\HostLive;

use App\Http\Requests\BaseFormRequest;

class HostLiveUpdateRequest extends BaseFormRequest
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
            'title' => 'sometimes|string|max:255',
            'quiztime_mode' => 'sometimes|nullable|boolean',
            'quiz_mode' => 'sometimes|nullable|string|max:255',
        ];
    }
}
