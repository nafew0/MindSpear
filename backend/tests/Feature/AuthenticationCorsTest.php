<?php

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;

uses(DatabaseTransactions::class);

it('logs in from the local frontend origin without sanctum csrf stateful handling', function () {
    config([
        'cors.allowed_origins' => ['http://localhost:2000'],
    ]);

    $user = User::create([
        'first_name' => 'Local',
        'last_name' => 'Host',
        'email' => 'local-host-' . str()->uuid() . '@example.test',
        'email_verified_at' => now(),
        'is_verified' => true,
        'password' => Hash::make('password'),
    ]);

    $this->withHeader('Origin', 'http://localhost:2000')
        ->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
        ->assertOk()
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:2000')
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonStructure(['data' => ['token']]);
});
