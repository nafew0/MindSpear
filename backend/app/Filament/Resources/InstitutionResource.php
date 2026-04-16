<?php

namespace App\Filament\Resources;

use App\Filament\Resources\InstitutionResource\Pages;
use App\Models\Institution;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InstitutionResource extends Resource
{
    protected static ?string $model = Institution::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';
    protected static ?string $navigationGroup = 'Management';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')->label('Name')->required()->maxLength(255),
                Forms\Components\TextInput::make('type')->label('Type')->maxLength(255),
                Forms\Components\TextInput::make('email')->label('Email')->email()->maxLength(255),
                Forms\Components\TextInput::make('phone')->label('Phone')->tel()->maxLength(50),
                Forms\Components\TextInput::make('website')->label('Website')->url()->maxLength(255),
                Forms\Components\Select::make('status')->label('Status')->options([
                    'active' => 'Active',
                    'inactive' => 'Inactive',
                ])->default('active'),
                Forms\Components\TextInput::make('logo')->label('Logo URL')->maxLength(255),
                Forms\Components\Textarea::make('address')->label('Address')->columnSpanFull(),
                Forms\Components\TextInput::make('city')->label('City')->maxLength(255),
                Forms\Components\TextInput::make('state')->label('State')->maxLength(255),
                Forms\Components\TextInput::make('country')->label('Country')->maxLength(255),
                Forms\Components\TextInput::make('postal_code')->label('Postal Code')->maxLength(20),
            ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->label('Name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('type')->label('Type')->toggleable()->searchable(),
                Tables\Columns\TextColumn::make('email')->label('Email')->toggleable()->searchable(),
                Tables\Columns\TextColumn::make('phone')->label('Phone')->toggleable(),
                Tables\Columns\TextColumn::make('status')->label('Status')->badge()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->label('Created')->dateTime()->sortable(),
            ])
            ->defaultSort('id', 'desc')
            ->filters([])
            ->actions([
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
            'index' => Pages\ListInstitutions::route('/'),
            'create' => Pages\CreateInstitution::route('/create'),
            'edit' => Pages\EditInstitution::route('/{record}/edit'),
        ];
    }
}
