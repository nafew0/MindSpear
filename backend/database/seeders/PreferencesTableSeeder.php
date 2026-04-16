<?php

namespace Database\Seeders;

use App\Models\Preference;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PreferencesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $preferences = [
            [
                'category' => 'site',
                'field' => 'title',
                'value' => 'What will you ask your audience?',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category' => 'site',
                'field' => 'message',
                'value' => 'Turn presentations into conversations with interactive polls that engage meetings and classrooms.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category' => 'site',
                'field' => 'logo',
                'value' => 'images/logo/logo.svg',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category' => 'site',
                'field' => 'tagline',
                'value' => 'Learn through questions. Teach through conversation.',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'category' => 'site',
                'field' => 'favicon',
                'value' => 'images/favicon/favicon.ico',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category' => 'site',
                'field' => 'logo_dark',
                'value' => 'images/logo/logo-dark.svg',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category' => 'site',
                'field' => 'logo_light',
                'value' => 'images/logo/logo-light.svg',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($preferences as $preference) {
            Preference::updateOrCreate(
                [
                    'category' => $preference['category'],
                    'field' => $preference['field']],
                    $preference
            );
        }
    }
}
