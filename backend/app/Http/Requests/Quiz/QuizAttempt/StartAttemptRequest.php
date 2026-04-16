<?php

namespace App\Http\Requests\Quiz\QuizAttempt;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Support\Facades\Auth;

class StartAttemptRequest extends BaseFormRequest
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
            'is_anonymous' => 'sometimes|boolean',
            'anonymous_details' => 'nullable|array',
            'start_time' => 'nullable|date_format:Y-m-d H:i:s',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_id' => Auth::guard('api')->id(),
        ]);
    }

    /**
     * Get the validated data with the added user_id.
     */
    public function validated($key = null, $default = null)
    {
        return array_merge(parent::validated(), [
            'user_id' => $this->input('user_id'),
        ]);
    }
}
