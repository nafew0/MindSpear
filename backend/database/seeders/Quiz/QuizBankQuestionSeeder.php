<?php

namespace Database\Seeders\Quiz;

use Illuminate\Database\Seeder;
use App\Models\Quiz\BankQuestion;

class QuizBankQuestionSeeder extends Seeder
{
    public function run(): void
    {
        // Seed a few sample quiz bank questions for dev/testing
        if (BankQuestion::count() > 0) {
            return;
        }

        $samples = [
            [
                'question_text' => 'What is 2 + 2?',
                'question_type' => 'multiple_choice',
                'options' => ['choices' => ['3', '4', '5'], 'correct_answer' => 1],
                'points' => 5,
                'visibility' => 'public',
            ],
            [
                'question_text' => 'Capital of Bangladesh?',
                'question_type' => 'multiple_choice',
                'options' => ['choices' => ['Dhaka', 'Chattogram', 'Khulna'], 'correct_answer' => 0],
                'points' => 10,
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

