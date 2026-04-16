<?php

namespace Database\Seeders;

use App\Models\Quiz\Question;
use App\Models\Quiz\Quiz;
use DateTime;
use DateTimeZone;
use Illuminate\Database\Seeder;

class DemoQuestionsWithQuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = new DateTime('now', new DateTimeZone('UTC'));
        $openDate = new DateTime('now', new DateTimeZone('UTC'));
        $closeDate = new DateTime('+7 days', new DateTimeZone('UTC'));

        // First create the quiz
        $quiz = Quiz::create([
            'title' => 'Comprehensive Knowledge Quiz',
            'description' => 'A complete quiz covering various topics with all fields populated',
            'user_id' => 1, // Ensure this user exists
            'category_id' => 1, // Ensure this category exists
            'is_published' => true,
            'open_datetime' => $openDate->format('Y-m-d H:i:s'),
            'close_datetime' => $closeDate->format('Y-m-d H:i:s'),
            'quiztime_mode' => true,
            'duration' => 45,
            'logged_in_users_only' => false,
            'safe_browser_mode' => true,
            'quiz_mode' => 'exam',
            'visibility' => 'public',
            'timezone' => 'UTC',
            'join_link' => 'quiz-' . uniqid(),
            'join_code' => strtoupper(substr(md5(uniqid()), 0, 6)),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Then create questions for this quiz
        $questions = [
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 1,
                'question_text' => 'What is the capital of France?',
                'question_type' => 'multiple_choice',
                'visibility' => 'public',
                'time_limit_seconds' => 30,
                'points' => 5,
                'is_ai_generated' => false,
                'options' => json_encode([
                    'choices' => ['London', 'Paris', 'Berlin', 'Madrid'],
                    'correct_answer' => 1,
                    'color' => ['#FF5733', '#33FF57', '#3357FF', '#F333FF']
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 2,
                'question_text' => 'The Earth revolves around the Sun.',
                'question_type' => 'true_false',
                'visibility' => 'public',
                'time_limit_seconds' => 15,
                'points' => 2,
                'is_ai_generated' => false,
                'options' => json_encode([
                    'correct_answer' => true,
                    'color' => ['#222', '#000']
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 3,
                'question_text' => 'Which planet is known as the Red Planet?',
                'question_type' => 'single_choice',
                'visibility' => 'public',
                'time_limit_seconds' => 20,
                'points' => 3,
                'is_ai_generated' => false,
                'options' => json_encode([
                    'choices' => ['Venus', 'Mars', 'Jupiter'],
                    'correct_answer' => 1,
                    'color' => ['#FF9999', '#FF3333', '#FF6666']
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 4,
                'question_text' => 'The process by which plants make their own food is called __________.',
                'question_type' => 'fill_in_the_blanks_choice',
                'visibility' => 'public',
                'time_limit_seconds' => 25,
                'points' => 4,
                'is_ai_generated' => false,
                'options' => json_encode([
                    'correct_answer' => 'photosynthesis',
                    'color' => '#33FFBD'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 5,
                'question_text' => 'Test data New',
                'is_ai_generated' => false,
                'time_limit_seconds' => 25,
                'points' => 4,
                'question_type' => 'sort_answer_choice',
                'options' => json_encode([
                    'choices' => [
                        "New",
                        "Old",
                        "Three"
                    ],
                    'correct_answer' => [0, 1, 2], // Matches your example exactly
                    'color' => [
                        "#F79945",
                        "#BC5EB3",
                        "#5769E7"
                    ]
                ]),
                'visibility' => 'private',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 6,
                'question_text' => 'Which of these are programming languages? (Select all that apply)',
                'question_type' => 'quiz_multiple_choice',
                'visibility' => 'public',
                'time_limit_seconds' => 30,
                'points' => 5,
                'is_ai_generated' => false,
                'options' => json_encode([
                    'choices' => ['Python', 'HTML', 'JavaScript', 'CSS'],
                    'correct_answers' => [0, 2],
                    'color' => [
                        'linear-gradient(45deg, #3776AB, #306998)',
                        'linear-gradient(45deg, #E34C26, #F06529)',
                        'linear-gradient(45deg, #F7DF1E, #D4BB1E)',
                        'linear-gradient(45deg, #264DE4, #2965F1)'
                    ]
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'quiz_id' => $quiz->id,
                'owner_id' => 1,
                'serial_number' => 7,
                'question_text' => 'The Great Wall of China is visible from space with the naked eye.',
                'question_type' => 'true_false_choice',
                'visibility' => 'public',
                'time_limit_seconds' => 15,
                'points' => 2,
                'is_ai_generated' => false,
                'options' => json_encode([
                    'correct_answer' => 1,
                    'color' => ['#555', '#333']
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        Question::insert($questions);
    }
}
