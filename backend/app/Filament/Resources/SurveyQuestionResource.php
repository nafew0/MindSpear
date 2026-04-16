<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SurveyQuestionResource\Pages;
use App\Models\Survey\Survey;
use App\Models\Survey\SurveyPage;
use App\Models\Survey\SurveyQuestion;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SurveyQuestionResource extends Resource
{
    protected static ?string $model = SurveyQuestion::class;

    protected static ?string $navigationIcon = 'heroicon-o-question-mark-circle';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 13;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('survey_id')
                    ->label('Survey')
                    ->options(fn () => Survey::query()->pluck('title', 'id'))
                    ->searchable()
                    ->required(),
                Forms\Components\Select::make('page_id')
                    ->label('Page')
                    ->options(fn () => SurveyPage::query()->orderBy('page_number')->pluck('title', 'id'))
                    ->searchable(),
                // sections removed
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
                Forms\Components\Toggle::make('is_required'),
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
                Tables\Columns\TextColumn::make('survey.title')->label('Survey')->searchable(),
                Tables\Columns\TextColumn::make('serial_number')->sortable(),
                Tables\Columns\TextColumn::make('question_text')->limit(50),
                Tables\Columns\TextColumn::make('question_type')->badge(),
                Tables\Columns\IconColumn::make('is_required')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('id', 'desc')
            ->actions([
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
            'index' => Pages\ListSurveyQuestions::route('/'),
            'create' => Pages\CreateSurveyQuestion::route('/create'),
            'edit' => Pages\EditSurveyQuestion::route('/{record}/edit'),
        ];
    }
}
