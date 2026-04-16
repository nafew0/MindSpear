<?php

namespace Database\Seeders\Quiz;

use App\Models\Quiz\Quiz;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $quizData = [
            [
                'title' => 'Demo',
                'description' => 'Address',
                'user_id' => 1,
                'category_id' => null,
                'is_published' => true,
                'open_datetime' => null,
                'close_datetime' => null,
                'duration' => 30,
                'logged_in_users_only' => true,
                'safe_browser_mode' => true,
                'visibility' => 'private',
                'quiz_mode' => 'normal',
                'timezone' => 'UTC',
                'join_link' => generate_quiz_join_link(),
                'join_code' => generate_quiz_join_code(),
                'deleted_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Math Quiz',
                'description' => 'Basic arithmetic questions',
                'user_id' => 1,
                'category_id' => 1,
                'is_published' => true,
                'open_datetime' => null,
                'close_datetime' => null,
                'duration' => 20,
                'logged_in_users_only' => false,
                'safe_browser_mode' => false,
                'visibility' => 'public',
                'quiz_mode' => 'normal',
                'timezone' => 'UTC',
                'join_link' => generate_quiz_join_link(),
                'join_code' => generate_quiz_join_code(),
                'deleted_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Science Quiz',
                'description' => 'Physics and Chemistry',
                'user_id' => 2,
                'category_id' => 2,
                'is_published' => true,
                'open_datetime' => null,
                'close_datetime' => null,
                'duration' => 25,
                'logged_in_users_only' => false,
                'safe_browser_mode' => false,
                'visibility' => 'public',
                'quiz_mode' => 'normal',
                'timezone' => 'UTC',
                'join_link' => generate_quiz_join_link(),
                'join_code' => generate_quiz_join_code(),
                'deleted_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'History Quiz',
                'description' => 'World History',
                'user_id' => 1,
                'category_id' => 3,
                'is_published' => true,
                'open_datetime' => null,
                'close_datetime' => null,
                'duration' => 15,
                'logged_in_users_only' => false,
                'safe_browser_mode' => false,
                'visibility' => 'public',
                'quiz_mode' => 'normal',
                'timezone' => 'UTC',
                'join_link' => generate_quiz_join_link(),
                'join_code' => generate_quiz_join_code(),
                'deleted_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Programming Quiz',
                'description' => 'Basic programming concepts',
                'user_id' => 2,
                'category_id' => 4,
                'is_published' => true,
                'open_datetime' => null,
                'close_datetime' => null,
                'duration' => 30,
                'logged_in_users_only' => false,
                'safe_browser_mode' => false,
                'visibility' => 'public',
                'quiz_mode' => 'normal',
                'timezone' => 'UTC',
                'join_link' => generate_quiz_join_link(),
                'join_code' => generate_quiz_join_code(),
                'deleted_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        Quiz::insert($quizData);
    }
}
