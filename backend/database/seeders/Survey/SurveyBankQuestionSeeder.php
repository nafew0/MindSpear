<?php

namespace Database\Seeders\Survey;

use Illuminate\Database\Seeder;
use App\Models\Survey\BankQuestion;

class SurveyBankQuestionSeeder extends Seeder
{
    public function run(): void
    {
        if (BankQuestion::count() > 0) {
            return;
        }

        $samples = [
            [
                'question_text' => 'How satisfied are you with the service?',
                'question_type' => 'single_choice',
                'options' => ['choices' => ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied']],
                'is_required' => true,
                'visibility' => 'public',
            ],
            [
                'question_text' => 'Any suggestions for improvement?',
                'question_type' => 'text',
                'options' => null,
                'is_required' => false,
                'visibility' => 'private',
            ],
        ];

        foreach ($samples as $row) {
            BankQuestion::create(array_merge($row, [
                'owner_id' => 1,
            ]));
        }
    }
}

