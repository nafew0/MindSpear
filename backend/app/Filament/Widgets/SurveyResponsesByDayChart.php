<?php

namespace App\Filament\Widgets;

use App\Models\Survey\SurveyResponse;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class SurveyResponsesByDayChart extends ChartWidget
{
    protected static ?string $heading = 'Survey Responses (Last 30 Days)';

    protected function getData(): array
    {
        $from = Carbon::now()->subDays(29)->startOfDay();
        $rows = SurveyResponse::query()
            ->where('created_at', '>=', $from)
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->orderBy('d')
            ->pluck('c', 'd')
            ->all();

        $labels = [];
        $values = [];
        for ($i = 0; $i < 30; $i++) {
            $date = $from->copy()->addDays($i)->toDateString();
            $labels[] = $date;
            $values[] = (int) ($rows[$date] ?? 0);
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Responses',
                    'data' => $values,
                ],
            ],
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}

