<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EmailLogResource\Pages;
use App\Models\Log\EmailLog;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EmailLogResource extends Resource
{
    protected static ?string $model = EmailLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationGroup = 'Logs';
    protected static ?int $navigationSort = 52;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('to')->searchable(),
                Tables\Columns\TextColumn::make('subject')->wrap(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('sent_at')->label('Sent At')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('id', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEmailLogs::route('/'),
            'view' => Pages\ViewEmailLog::route('/{record}'),
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Message')
                    ->schema([
                        TextEntry::make('to')->label('To'),
                        TextEntry::make('subject')->label('Subject')->columnSpanFull(),
                        TextEntry::make('mailable')->label('Mailable'),
                        TextEntry::make('message_id')->label('Message ID')->copyable(),
                    ])->columns(2),
                Section::make('Meta')
                    ->schema([
                        TextEntry::make('status')->badge()->label('Status'),
                        TextEntry::make('sent_at')->dateTime()->label('Sent At'),
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('id')->label('ID'),
                    ])->columns(4),
            ]);
    }
}
