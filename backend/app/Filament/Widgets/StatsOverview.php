<?php

namespace App\Filament\Widgets;

use App\Models\Institution;
use App\Models\Quest\Quest;
use App\Models\Quiz\Quiz;
use App\Models\Survey\Survey;
use App\Models\Survey\SurveyResponse;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Card;

class StatsOverview extends BaseWidget
{
    protected function getCards(): array
    {
        return [
            Card::make('Users', (string) User::count()),
            Card::make('Institutions', (string) Institution::count()),
            Card::make('Surveys', (string) Survey::count()),
            Card::make('Quizzes', (string) Quiz::count()),
            Card::make('Quests', (string) Quest::count()),
            Card::make('Survey Responses', (string) SurveyResponse::count()),
        ];
    }
}

