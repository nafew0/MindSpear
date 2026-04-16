<?php

namespace Database\Seeders\Quiz;

use App\Models\Quiz\Question;
use App\Models\Quiz\Quiz;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find a quiz to attach questions to; create a minimal one if none exists
        $quiz = Quiz::first();
        if (! $quiz) {
            $quiz = Quiz::create([
                'title' => 'Sample Quiz for Questions',
                'description' => 'Auto-created for seeding demo questions',
                'user_id' => 1,
                'is_published' => true,
                'visibility' => 'private',
                'timezone' => 'UTC',
                'join_link' => generate_quiz_join_link(),
                'join_code' => generate_quiz_join_code(),
            ]);
        }

        $questions = [
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 1,
                'question_text' => 'What is 2+2?',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    'choices' => ['3', '4', '5'],
                    'correct_answer' => 1,
                    'color' => ['#ff0000', '#00ff00', '#0000ff'] // Custom colors for each choice
                ]),
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 2,
                'question_text' => 'Is the Earth round?',
                'question_type' => 'true_false',
                'options' => json_encode([
                    'correct_answer' => true,
                    'color' => ['#222', '#000']
                ]),
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 3,
                'question_text' => 'What is your full name?',
                'question_type' => 'text_line',
                'options' => json_encode([
                    'correct_answer' => 'My Full Name'
                ]),
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 4,
                'question_text' => 'Explain your motivation for joining this course.',
                'question_type' => 'paragraph',
                'options' => json_encode([
                    'correct_answer' => 'Answers may vary'
                ]),
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 5,
                'question_text' => 'Select the primary colors:',
                'question_type' => 'multiple_choice',
                'options' => json_encode([
                    'choices' => ['Red', 'Green', 'Blue', 'Yellow'],
                    'correct_answers' => [0, 2, 3],
                    'color' => [
                        'linear-gradient(45deg, #ff0000, #ff8080)', // Red gradient
                        'linear-gradient(45deg, #00ff00, #66ff66)', // Green gradient
                        'linear-gradient(45deg, #0000ff, #6699ff)', // Blue gradient
                        'linear-gradient(45deg, #ffff00, #fff799)'  // Yellow gradient
                    ]
                ]),
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 6,
                'question_text' => 'Explain your motivation for joining this course.',
                'question_type' => 'paragraph',
                'options' => json_encode([
                    'correct_answer' => 'I joined this course to enhance my skills, gain new knowledge, and advance my career in this field.'
                ]),
                'visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        Question::insert($questions);
    }
}
