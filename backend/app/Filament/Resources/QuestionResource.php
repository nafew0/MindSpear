<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuestionResource\Pages;
use App\Models\Quiz\Question;
use App\Models\Quiz\Quiz;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuestionResource extends Resource
{
    protected static ?string $model = Question::class;

    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 14;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('quiz_id')
                    ->label('Quiz')
                    ->options(fn () => Quiz::query()->pluck('title', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\TextInput::make('serial_number')->numeric()->required(),
                Forms\Components\Textarea::make('question_text')->required()->columnSpanFull(),
                Forms\Components\Select::make('question_type')->options([
                    'text' => 'Text',
                    'textarea' => 'Textarea',
                    'select' => 'Select',
                    'radio' => 'Radio',
                    'checkbox' => 'Checkbox',
                    'date' => 'Date',
                    'number' => 'Number',
                ])->required(),
                Forms\Components\TextInput::make('time_limit_seconds')->numeric()->minValue(0),
                Forms\Components\TextInput::make('points')->numeric()->minValue(0),
                Forms\Components\Toggle::make('is_ai_generated'),
                Forms\Components\TextInput::make('source_content_url')->url(),
                Forms\Components\Select::make('visibility')->options([
                    'public' => 'Public',
                    'private' => 'Private',
                ])->default('public'),
                Forms\Components\Textarea::make('options')
                    ->label('Options (JSON array)')
                    ->helperText('For select/radio/checkbox types, provide a JSON array of options')
                    ->columnSpanFull(),
            ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('quiz.title')->label('Quiz')->searchable(),
                Tables\Columns\TextColumn::make('serial_number')->sortable(),
                Tables\Columns\TextColumn::make('question_text')->limit(50),
                Tables\Columns\TextColumn::make('question_type')->badge(),
                Tables\Columns\TextColumn::make('points')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
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
            'index' => Pages\ListQuestions::route('/'),
            'view' => Pages\ViewQuestion::route('/{record}'),
            'create' => Pages\CreateQuestion::route('/create'),
            'edit' => Pages\EditQuestion::route('/{record}/edit'),
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('Question')
                    ->schema([
                        TextEntry::make('quiz.title')->label('Quiz'),
                        TextEntry::make('owner.full_name')->label('Owner'),
                        TextEntry::make('serial_number')->label('Serial Number'),
                        TextEntry::make('question_text')->label('Question')->columnSpanFull(),
                        TextEntry::make('question_type')->label('Type')->badge(),
                        TextEntry::make('time_limit_seconds')
                            ->label('Time Limit')
                            ->formatStateUsing(fn ($state) => $state !== null ? $state . ' sec' : '—'),
                        TextEntry::make('points')->label('Points'),
                        TextEntry::make('is_ai_generated')
                            ->label('AI Generated')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('visibility')->label('Visibility')->badge(),
                    ])->columns(2),
                Section::make('Source')
                    ->schema([
                        TextEntry::make('source_content_url')->label('Source URL')->columnSpanFull(),
                    ])->columns(1),
                Section::make('Options')
                    ->schema([
                        TextEntry::make('options')
                            ->label('Options (JSON)')
                            ->formatStateUsing(function ($state) {
                                return is_array($state)
                                    ? json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                                    : (string) $state;
                            })
                            ->columnSpanFull()
                            ->extraAttributes(['style' => 'white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;']),
                    ]),
                Section::make('Meta')
                    ->schema([
                        TextEntry::make('created_at')->dateTime()->label('Created'),
                        TextEntry::make('updated_at')->dateTime()->label('Updated'),
                        TextEntry::make('id')->label('ID'),
                    ])->columns(3),
            ]);
    }
}
