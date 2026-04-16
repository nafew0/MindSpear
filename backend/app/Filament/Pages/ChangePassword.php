<?php

namespace App\Filament\Pages;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ChangePassword extends Page
{
    protected static bool $shouldRegisterNavigation = false;
    protected static string $view = 'filament.pages.change-password';

    public ?array $data = [];

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Change Password')
                    ->schema([
                        Forms\Components\TextInput::make('current_password')
                            ->label('Current Password')
                            ->password()
                            ->required(),
                        Forms\Components\TextInput::make('password')
                            ->label('New Password')
                            ->password()
                            ->required()
                            ->rule('min:8')
                            ->same('password_confirmation'),
                        Forms\Components\TextInput::make('password_confirmation')
                            ->label('Confirm New Password')
                            ->password()
                            ->required(),
                    ])->columns(1),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $user = Auth::user();
        $state = $this->form->getState();

        if (! Hash::check($state['current_password'] ?? '', $user->password)) {
            Notification::make()->title('Current password is incorrect')->danger()->send();
            return;
        }

        $user->password = Hash::make($state['password']);
        $user->save();

        // Clear the form fields
        $this->form->fill([
            'current_password' => null,
            'password' => null,
            'password_confirmation' => null,
        ]);

        Notification::make()->title('Password updated')->success()->send();
    }
}
