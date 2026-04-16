<?php

use Filament\Facades\Filament;
use Filament\Models\Contracts\FilamentUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/super-admin/login', function (Request $request) {
    $panel = Filament::getPanel('admin');

    Filament::setCurrentPanel($panel);
    Filament::bootCurrentPanel();

    $data = $request->validate([
        'data.email' => ['required', 'email'],
        'data.password' => ['required'],
    ]);

    $credentials = [
        'email' => data_get($data, 'data.email'),
        'password' => data_get($data, 'data.password'),
    ];

    $remember = $request->boolean('data.remember');

    if (! Filament::auth()->attempt($credentials, $remember)) {
        throw ValidationException::withMessages([
            'data.email' => __('filament-panels::pages/auth/login.messages.failed'),
        ]);
    }

    $user = Filament::auth()->user();

    if (($user instanceof FilamentUser) && (! $user->canAccessPanel($panel))) {
        Filament::auth()->logout();

        throw ValidationException::withMessages([
            'data.email' => __('filament-panels::pages/auth/login.messages.failed'),
        ]);
    }

    $request->session()->regenerate();

    return redirect()->intended($panel->getUrl());
})->name('filament.admin.auth.login.post');
