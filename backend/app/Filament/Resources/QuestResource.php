<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuestResource\Pages;
use App\Models\Quest\Quest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuestResource extends Resource
{
    protected static ?string $model = Quest::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 12;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')->required()->maxLength(255),
                Forms\Components\Textarea::make('description')->columnSpanFull(),
                Forms\Components\Toggle::make('is_published'),
                Forms\Components\Select::make('visibility')->options([
                    'public' => 'Public',
                    'private' => 'Private',
                ])->default('public'),
                Forms\Components\DateTimePicker::make('start_datetime'),
                Forms\Components\DateTimePicker::make('end_datetime'),
            ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\IconColumn::make('is_published')->boolean(),
                Tables\Columns\TextColumn::make('visibility')->badge(),
                Tables\Columns\TextColumn::make('window')
                    ->label('Schedule')
                    ->getStateUsing(function ($record) {
                        $start = $record->start_datetime ? $record->start_datetime->format('Y-m-d H:i') : '—';
                        $end = $record->end_datetime ? $record->end_datetime->format('Y-m-d H:i') : '—';
                        return "$start → $end";
                    }),
                Tables\Columns\TextColumn::make('creator_created')
                    ->label('Creator • Created')
                    ->getStateUsing(function ($record) {
                        $creator = $record->creator->full_name ?? '—';
                        $created = $record->created_at ? $record->created_at->format('Y-m-d H:i') : '—';
                        return "$creator • $created";
                    }),
                Tables\Columns\TextColumn::make('tasks_count')->counts('tasks')->label('Tasks'),
                Tables\Columns\TextColumn::make('participants_count')->counts('participants')->label('Participants'),
            ])
            ->defaultSort('id', 'desc')
            ->actions([
                Tables\Actions\ViewAction::make(),
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
            'index' => Pages\ListQuests::route('/'),
            'view' => Pages\ViewQuest::route('/{record}'),
            'create' => Pages\CreateQuest::route('/create'),
            'edit' => Pages\EditQuest::route('/{record}/edit'),
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Details')
                    ->schema([
                        TextEntry::make('title')->label('Title'),
                        TextEntry::make('description')->label('Description')->columnSpanFull(),
                        TextEntry::make('creator.full_name')->label('Creator'),
                        TextEntry::make('status')->label('Status')->badge(),
                        TextEntry::make('visibility')->label('Visibility')->badge(),
                        TextEntry::make('is_published')
                            ->label('Published')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('sequential_progression')
                            ->label('Sequential Progression')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('start_datetime')->dateTime()->label('Start At'),
                        TextEntry::make('end_datetime')->dateTime()->label('End At'),
                    ])->columns(2),
                Section::make('Access')
                    ->schema([
                        TextEntry::make('join_link')->label('Join Link')->columnSpanFull(),
                        TextEntry::make('join_code')->label('Join Code'),
                    ])->columns(2),
                Section::make('Meta')
                    ->schema([
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('updated_at')->dateTime()->label('Updated'),
                        TextEntry::make('id')->label('ID'),
                    ])->columns(3),
            ]);
    }
}
