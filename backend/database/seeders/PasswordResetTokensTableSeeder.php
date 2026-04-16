<?php

namespace Database\Seeders;

use App\Models\PasswordResetToken;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PasswordResetTokensTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PasswordResetToken::create([
            'email' => 'admin@admin.com',
            'token' => Str::random(64),
            'created_at' => now(),
        ]);

        PasswordResetToken::create([
            'email' => 'instructor@instructor.com',
            'token' => Str::random(64),
            'created_at' => now(),
        ]);

        PasswordResetToken::create([
            'email' => 'participant@participant.com',
            'token' => Str::random(64),
            'created_at' => now(),
        ]);
    }
}
