<?php

namespace App\Filament\Resources;

use App\Filament\Resources\QuizResource\Pages;
use App\Models\Quiz\Quiz;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class QuizResource extends Resource
{
    protected static ?string $model = Quiz::class;

    protected static ?string $navigationIcon = 'heroicon-o-pencil-square';
    protected static ?string $navigationGroup = 'Content';
    protected static ?int $navigationSort = 11;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('title')->required()->maxLength(255),
                Forms\Components\Textarea::make('description')->columnSpanFull(),
                Forms\Components\Select::make('user_id')
                    ->label('Owner')
                    ->options(fn () => User::query()->pluck('full_name', 'id'))
                    ->searchable(),
                Forms\Components\Toggle::make('is_published'),
                Forms\Components\Toggle::make('is_live'),
                Forms\Components\TextInput::make('join_link')->maxLength(255),
                Forms\Components\TextInput::make('join_code')->maxLength(255),
                Forms\Components\Select::make('visibility')->options([
                    'public' => 'Public',
                    'private' => 'Private',
                ])->default('public'),
                Forms\Components\DateTimePicker::make('open_datetime'),
                Forms\Components\DateTimePicker::make('close_datetime'),
                Forms\Components\TextInput::make('duration')->numeric()->suffix('mins'),
                Forms\Components\Toggle::make('is_pin_required'),
                Forms\Components\TextInput::make('pin')->maxLength(20),
            ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\IconColumn::make('is_published')->boolean(),
                Tables\Columns\IconColumn::make('is_live')->boolean(),
                Tables\Columns\TextColumn::make('visibility')->badge(),
                Tables\Columns\TextColumn::make('window')
                    ->label('Schedule')
                    ->getStateUsing(function ($record) {
                        $open = $record->open_datetime ? $record->open_datetime->format('Y-m-d H:i') : '—';
                        $close = $record->close_datetime ? $record->close_datetime->format('Y-m-d H:i') : '—';
                        return "$open → $close";
                    })
                    ->toggleable(),
                Tables\Columns\TextColumn::make('owner_created')
                    ->label('Owner • Created')
                    ->getStateUsing(function ($record) {
                        $owner = $record->user->full_name ?? '—';
                        $created = $record->created_at ? $record->created_at->format('Y-m-d H:i') : '—';
                        return "$owner • $created";
                    }),
                Tables\Columns\TextColumn::make('questions_count')->counts('questions')->label('Questions'),
                Tables\Columns\TextColumn::make('duration')->suffix(' mins')->toggleable(),
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
            'index' => Pages\ListQuizzes::route('/'),
            'view' => Pages\ViewQuiz::route('/{record}'),
            'create' => Pages\CreateQuiz::route('/create'),
            'edit' => Pages\EditQuiz::route('/{record}/edit'),
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
                        TextEntry::make('user.full_name')->label('Owner'),
                        TextEntry::make('visibility')->label('Visibility')->badge(),
                        TextEntry::make('is_published')
                            ->label('Published')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('is_live')
                            ->label('Live')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('open_datetime')->dateTime()->label('Open At'),
                        TextEntry::make('close_datetime')->dateTime()->label('Close At'),
                        TextEntry::make('duration')
                            ->label('Duration')
                            ->formatStateUsing(fn ($state) => $state !== null ? $state . ' mins' : '—'),
                    ])->columns(2),
                Section::make('Access')
                    ->schema([
                        TextEntry::make('join_link')->label('Join Link')->columnSpanFull(),
                        TextEntry::make('join_code')->label('Join Code'),
                        TextEntry::make('is_pin_required')
                            ->label('Pin Required')
                            ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No'),
                        TextEntry::make('pin')->label('Pin'),
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
