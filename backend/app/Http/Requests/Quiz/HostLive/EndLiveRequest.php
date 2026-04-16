<?php

namespace App\Http\Requests\Quiz\HostLive;

use App\Http\Requests\BaseFormRequest;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'end_datetime' => 'required|date|after:start_datetime',
        ];
    }
}
