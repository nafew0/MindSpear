<?php

namespace App\Http\Requests\Quest\HostLive;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class EndLiveRequest extends BaseFormRequest
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
            'end_datetime' => 'nullable|date',
        ];
    }
}
