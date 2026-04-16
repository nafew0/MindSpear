<?php

namespace App\Exports\Quests;

use App\Models\Quest\Quest;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuestSessionsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $questSessions;

    protected $quest;

    public function __construct(Collection $questSessions, Quest $quest)
    {
        $this->questSessions = $questSessions;
        $this->quest = $quest;
    }

    public function collection()
    {
        return $this->questSessions;
    }

    public function headings(): array
    {
        return [
            'Title',
            'Session Date',
            'Participants Count',
        ];
    }

    public function map($session): array
    {
        return [
            $session->title,
            $session->start_datetime->format('Y-m-d H:i:s') ?? 'N/A',
            $session->participants_count,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E6E6FA'],
                ],
            ],
        ];
    }
}
