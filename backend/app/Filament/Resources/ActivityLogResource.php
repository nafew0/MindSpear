<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ActivityLogResource\Pages;
use App\Models\Log\ActivityLog;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ActivityLogResource extends Resource
{
    protected static ?string $model = ActivityLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Logs';
    protected static ?int $navigationSort = 51;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('user.full_name')->label('User')->searchable(),
                Tables\Columns\TextColumn::make('event')->badge(),
                Tables\Columns\TextColumn::make('subject_type')->toggleable(),
                Tables\Columns\TextColumn::make('subject_id')->toggleable(),
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
            'index' => Pages\ListActivityLogs::route('/'),
            'view' => Pages\ViewActivityLog::route('/{record}'),
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Event')
                    ->schema([
                        TextEntry::make('user.full_name')->label('User'),
                        TextEntry::make('event')->badge()->label('Event'),
                        TextEntry::make('subject_type')->label('Subject Type'),
                        TextEntry::make('subject_id')->label('Subject ID'),
                    ])->columns(4),
                Section::make('Request')
                    ->schema([
                        TextEntry::make('ip')->label('IP Address'),
                        TextEntry::make('user_agent')->label('User Agent')->columnSpanFull(),
                    ])->columns(2),
                Section::make('Changes')
                    ->schema([
                        TextEntry::make('changes')
                            ->label('Changes (JSON)')
                            ->formatStateUsing(function ($state) {
                                return is_array($state)
                                    ? json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                                    : (string) $state;
                            })
                            ->copyable()
                            ->columnSpanFull()
                            ->extraAttributes(['style' => 'white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;']),
                    ]),
                Section::make('Timestamps')
                    ->schema([
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('updated_at')->dateTime()->label('Updated'),
                        TextEntry::make('id')->label('ID'),
                    ])->columns(3),
            ]);
    }
}
