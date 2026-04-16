<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@admin.com',
            'phone' => '1111111111',
            'email_verified_at' => $now,
            'email_verification_token' => null,
            'is_verified' => true,
            'profile_picture' => null,
            'account_type' => 'admin',
            'institution_name' => 'Admin Institution',
            'designation' => 'System Admin',
            'department' => 'IT',
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        User::create([
            'first_name' => 'Instructor',
            'last_name' => 'One',
            'email' => 'instructor@instructor.com',
            'phone' => '2222222222',
            'email_verified_at' => $now,
            'email_verification_token' => null,
            'is_verified' => true,
            'profile_picture' => null,
            'account_type' => 'instructor',
            'institution_name' => 'Instructor Institute',
            'designation' => 'Lecturer',
            'department' => 'Education',
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        User::create([
            'first_name' => 'Participant',
            'last_name' => 'User',
            'email' => 'participant@participant.com',
            'phone' => '3333333333',
            'email_verified_at' => $now,
            'email_verification_token' => null,
            'is_verified' => true,
            'profile_picture' => null,
            'account_type' => 'participant',
            'institution_name' => 'Participant College',
            'designation' => 'Student',
            'department' => 'Science',
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }
}
