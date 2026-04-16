<?php

namespace App\Filament\Pages;

use App\Models\Institution;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Auth;

class MyProfile extends Page
{
    protected static bool $shouldRegisterNavigation = false;
    protected static string $view = 'filament.pages.my-profile';

    public ?array $data = [];

    public function mount(): void
    {
        $user = Auth::user();
        $this->form->fill([
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'designation' => $user->designation,
            'department' => $user->department,
            'institution_id' => $user->institution_id,
            'profile_picture' => $user->getRawOriginal('profile_picture'),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Profile')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('first_name')->label('First name')->required()->maxLength(255),
                                Forms\Components\TextInput::make('last_name')->label('Last name')->required()->maxLength(255),
                                Forms\Components\TextInput::make('email')->label('Email')->email()->required()->maxLength(255),
                            ]),
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('phone')->label('Phone')->tel()->maxLength(50),
                                Forms\Components\TextInput::make('designation')->label('Designation')->maxLength(255),
                                Forms\Components\TextInput::make('department')->label('Department')->maxLength(255),
                            ]),
                        Forms\Components\Select::make('institution_id')
                            ->label('Institution')
                            ->options(fn () => Institution::query()->pluck('name', 'id'))
                            ->searchable(),
                        Forms\Components\FileUpload::make('profile_picture')
                            ->label('Profile Image')
                            ->image()
                            ->avatar()
                            ->directory('profile-photos')
                            ->disk('public')
                            ->imageEditor()
                            ->imageCropAspectRatio('1:1')
                            ->downloadable()
                            ->openable(),
                    ])->columns(1),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $user = Auth::user();
        $state = $this->form->getState();

        $user->fill([
            'first_name' => $state['first_name'] ?? $user->first_name,
            'last_name' => $state['last_name'] ?? $user->last_name,
            'email' => $state['email'] ?? $user->email,
            'phone' => $state['phone'] ?? $user->phone,
            'designation' => $state['designation'] ?? $user->designation,
            'department' => $state['department'] ?? $user->department,
            'institution_id' => $state['institution_id'] ?? $user->institution_id,
        ]);

        // Profile picture is stored as path in public disk
        if (array_key_exists('profile_picture', $state)) {
            $user->profile_picture = $state['profile_picture'] ?: null;
        }

        $user->save();

        Notification::make()->title('Profile updated')->success()->send();
    }
}
