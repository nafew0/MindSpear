<?php

namespace App\Exports\Quizzes;

use App\Models\Quiz\Quiz;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuizSessionsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $quizSessions;

    protected $quiz;

    public function __construct(Collection $quizSessions, Quiz $quiz)
    {
        $this->quizSessions = $quizSessions;
        $this->quiz = $quiz;
    }

    public function collection()
    {
        return $this->quizSessions;
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
