<?php

namespace App\Http\Requests\Quest\QuestTaskBank;

use App\Http\Requests\BaseFormRequest;

class UseInQuestRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quest_id' => 'required|exists:quests,id',
            'serial_number' => 'nullable|integer',
        ];
    }
}

