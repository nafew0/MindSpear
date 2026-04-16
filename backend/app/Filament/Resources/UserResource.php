<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\Institution;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Info')->schema([
                    Forms\Components\TextInput::make('first_name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('last_name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('email')->email()->required()->maxLength(255),
                    Forms\Components\TextInput::make('phone')->tel()->maxLength(255),
                    Forms\Components\Select::make('institution_id')
                        ->label('Institution')
                        ->options(fn () => Institution::query()->pluck('name', 'id'))
                        ->searchable(),
                    Forms\Components\TextInput::make('designation')->maxLength(255),
                    Forms\Components\TextInput::make('department')->maxLength(255),
                ])->columns(2),
                Forms\Components\Section::make('Security')->schema([
                    Forms\Components\TextInput::make('password')
                        ->password()
                        ->dehydrateStateUsing(fn ($state) => filled($state) ? bcrypt($state) : null)
                        ->dehydrated(fn ($state) => filled($state))
                        ->maxLength(255)
                        ->revealable()
                        ->required(fn (string $operation) => $operation === 'create'),
                ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('full_name')
                    ->label('Name')
                    ->searchable(['first_name','last_name'])
                    ->formatStateUsing(function ($record) {
                        $name = e($record->full_name);
                        $raw = $record->getRawOriginal('profile_picture');
                        if (! empty($raw)) {
                            $img = filter_var($raw, FILTER_VALIDATE_URL) ? $raw : \Illuminate\Support\Facades\Storage::disk('public')->url($raw);
                            $img = e($img);
                            $avatar = "<img src=\"{$img}\" alt=\"\" class=\"h-9 w-9 rounded-full object-cover\"/>";
                        } else {
                            $base = $record->first_name ?: ($record->last_name ?: ($record->email ?: '?'));
                            $initial = strtoupper(mb_substr($base, 0, 1));
                            $avatar = "<span class=\"h-9 w-9 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 inline-flex items-center justify-center text-sm font-semibold shrink-0\">{$initial}</span>";
                        }
                        return "<span class=\"inline-flex items-center gap-2\">{$avatar}<span>{$name}</span></span>";
                    })
                    ->html(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('institution.name')->label('Institution')->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('id', 'desc')
            ->filters([])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'view' => Pages\ViewUser::route('/{record}'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Profile')
                    ->schema([
                        TextEntry::make('full_name')->label('Name'),
                        TextEntry::make('email')->label('Email'),
                        TextEntry::make('phone')->label('Phone'),
                        TextEntry::make('institution.name')->label('Institution'),
                        TextEntry::make('designation')->label('Designation'),
                        TextEntry::make('department')->label('Department'),
                    ])->columns(2),
                Section::make('Account')
                    ->schema([
                        TextEntry::make('account_type')->label('Account Type'),
                        TextEntry::make('provider')->label('Provider'),
                        TextEntry::make('provider_id')->label('Provider ID'),
                        TextEntry::make('is_verified')
                            ->label('Verified')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('email_verified_at')->dateTime()->label('Email Verified At'),
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('updated_at')->dateTime()->label('Updated'),
                        TextEntry::make('id')->label('ID'),
                    ])->columns(3),
            ]);
    }
}
