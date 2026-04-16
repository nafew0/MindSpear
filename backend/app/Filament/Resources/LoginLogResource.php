<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LoginLogResource\Pages;
use App\Models\Log\LoginLog;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LoginLogResource extends Resource
{
    protected static ?string $model = LoginLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-left-on-rectangle';
    protected static ?string $navigationGroup = 'Logs';
    protected static ?int $navigationSort = 50;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('user.full_name')->label('User')->searchable(),
                Tables\Columns\TextColumn::make('guard')->badge(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('ip'),
                Tables\Columns\TextColumn::make('logged_in_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('logged_out_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('id', 'desc')
            ->filters([])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLoginLogs::route('/'),
            'view' => Pages\ViewLoginLog::route('/{record}'),
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('User')
                    ->schema([
                        TextEntry::make('user.full_name')->label('User'),
                        TextEntry::make('guard')->badge()->label('Guard'),
                        TextEntry::make('status')->badge()->label('Status'),
                    ])->columns(3),
                Section::make('Request')
                    ->schema([
                        TextEntry::make('ip')->label('IP Address'),
                        TextEntry::make('user_agent')->label('User Agent')->columnSpanFull(),
                    ])->columns(2),
                Section::make('Timestamps')
                    ->schema([
                        TextEntry::make('logged_in_at')->dateTime()->label('Logged In At'),
                        TextEntry::make('logged_out_at')->dateTime()->label('Logged Out At'),
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('updated_at')->dateTime()->label('Updated'),
                    ])->columns(4),
            ]);
    }
}
