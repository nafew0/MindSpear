<?php

namespace App\Exports\Quizzes;

use App\Models\Quiz\QuizSession;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuizSessionAttemptExportGrouped implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $quizSession;

    protected $uniqueTasks;

    public function __construct(QuizSession $quizSession, $uniqueTasks)
    {
        $this->quizSession = $quizSession;
        $this->uniqueTasks = $uniqueTasks;
    }

    public function collection()
    {
        $data = new Collection();

        foreach ($this->quizSession->participants as $participant) {
            // Add participant info as first row
            $data->push([
                'type' => 'participant_info',
                'participant' => $participant,
                'task' => null,
                'completion' => null,
            ]);

            // Add each task response as subsequent rows
            foreach ($this->uniqueTasks as $task) {
                $completion = $participant->userQuizAnswers->where('question_id', $task->id)->first();

                $data->push([
                    'type' => 'task_response',
                    'participant' => $participant,
                    'task' => $task,
                    'completion' => $completion,
                ]);
            }

            // Add empty row as separator between participants
            $data->push([
                'type' => 'separator',
                'participant' => null,
                'task' => null,
                'completion' => null,
            ]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Field Type',
            'Value',
        ];
    }

    public function map($row): array
    {
        if ($row['type'] === 'participant_info') {
            return $this->mapParticipantInfo($row['participant']);
        } elseif ($row['type'] === 'task_response') {
            return $this->mapTaskResponse($row['participant'], $row['task'], $row['completion']);
        } else {
            // Separator row
            return ['', ''];
        }
    }

    private function mapParticipantInfo($participant): array
    {
        // Extract name from anonymous_details if it's a JSON string
        $name = $this->extractNameFromAnonymousDetails($participant);
        $email = $this->extractEmailFromAnonymousDetails($participant);

        return [
            'PARTICIPANT INFORMATION',
            $name . ' (' . $email . ')',
        ];
    }

    private function mapTaskResponse($participant, $task, $completion): array
    {
        $taskData = $this->parseTaskData($task->options);
        $questions = $this->extractQuestions($taskData, $task->question_type);

        $taskTitle = $task->title ?? 'Task Question';
        $response = $this->formatCompletionData($completion, $task);

        return [
            $taskTitle . "\n" . $questions,
            $response,
        ];
    }

    private function extractNameFromAnonymousDetails($participant): string
    {
        // First, try direct name field
        if (! empty($participant->name)) {
            return $participant->name;
        }

        // Then try anonymous_details JSON
        if (! empty($participant->anonymous_details)) {
            $anonymousData = $this->parseAnonymousDetails($participant->anonymous_details);

            return $anonymousData['name'] ?? '';
        }

        // Then try user relationship
        if ($participant->relationLoaded('user') && $participant->user) {
            return $participant->user->name ?? '';
        }

        return '';
    }

    private function extractEmailFromAnonymousDetails($participant): string
    {
        // First, try direct email field
        if (! empty($participant->email)) {
            return $participant->email;
        }

        // Then try anonymous_details JSON
        if (! empty($participant->anonymous_details)) {
            $anonymousData = $this->parseAnonymousDetails($participant->anonymous_details);

            return $anonymousData['email'] ?? '';
        }

        // Then try user relationship
        if ($participant->relationLoaded('user') && $participant->user) {
            return $participant->user->email ?? '';
        }

        return '';
    }

    private function parseAnonymousDetails($anonymousDetails)
    {
        if (is_array($anonymousDetails)) {
            return $anonymousDetails;
        }

        if (is_string($anonymousDetails)) {
            $decoded = json_decode($anonymousDetails, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        return [];
    }

    private function formatCompletionData($completion, $task): string
    {
        if (! $completion) {
            return 'No response';
        }

        $completionData = $this->parseCompletionData($completion->completion_data);

        switch ($task->question_type) {
            case 'single_choice':
                return $this->formatSingleChoice($completionData, $task);

            case 'multiple_choice':
                return $this->formatMultipleChoice($completionData, $task);

            case 'truefalse':
                return $this->formatTrueFalse($completionData, $task);

            case 'wordcloud':
                return $this->formatWordCloud($completionData);

            case 'scales':
                return $this->formatScales($completionData, $task);

            case 'ranking':
                return $this->formatRanking($completionData, $task);

            case 'shortanswer':
            case 'longanswer':
                return $this->formatTextAnswer($completionData);

            case 'shorting':
            case 'sorting':
                return $this->formatSorting($completionData, $task);

            case 'quick_form':
                return $this->formatQuickForm($completionData);

            default:
                return $this->formatDefault($completionData);
        }
    }

    private function parseCompletionData($completionData)
    {
        if (is_array($completionData)) {
            return $completionData;
        }

        if (is_string($completionData)) {
            $decoded = json_decode($completionData, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        return [];
    }

    private function formatSingleChoice($completionData, $task): string
    {
        $selectedOption = $completionData['selected_option'] ?? null;
        if ($selectedOption === null) {
            return 'No response';
        }

        $taskData = $this->parseTaskData($task->options);
        $questions = $taskData['questions'] ?? [];

        if (isset($questions[$selectedOption])) {
            return $questions[$selectedOption]['text'] ?? 'Option ' . ($selectedOption + 1);
        }

        return 'Selected: ' . $selectedOption;
    }

    private function formatMultipleChoice($completionData, $task): string
    {
        $selectedOptions = $completionData['selected_option'] ?? [];
        if (empty($selectedOptions)) {
            return 'No response';
        }

        $taskData = $this->parseTaskData($task->options);
        $questions = $taskData['questions'] ?? [];

        $selections = [];
        foreach ($selectedOptions as $index) {
            if (isset($questions[$index])) {
                $selections[] = $questions[$index]['text'] ?? 'Option ' . ($index + 1);
            }
        }

        return implode("\n", $selections);
    }

    private function formatTrueFalse($completionData, $task): string
    {
        $selectedOption = $completionData['selected_option'] ?? null;
        if ($selectedOption === null) {
            return 'No response';
        }

        $taskData = $this->parseTaskData($task->options);
        $questions = $taskData['questions'] ?? [];

        if (isset($questions[$selectedOption])) {
            return $questions[$selectedOption]['text'] ?? 'Option ' . ($selectedOption + 1);
        }

        return $selectedOption == 0 ? 'True' : 'False';
    }

    private function formatWordCloud($completionData): string
    {
        $selectedOptions = $completionData['selected_option'] ?? [];
        if (empty($selectedOptions)) {
            return 'No response';
        }

        return is_array($selectedOptions) ? implode("\n", $selectedOptions) : $selectedOptions;
    }

    private function formatScales($completionData, $task): string
    {
        $selectedOptions = $completionData['selected_option'] ?? [];
        if (empty($selectedOptions)) {
            return 'No response';
        }

        $taskData = $this->parseTaskData($task->options);
        $questions = $taskData['questions'] ?? [];

        $ratings = [];
        foreach ($selectedOptions as $index => $rating) {
            $questionText = $questions[$index]['text'] ?? 'Q' . ($index + 1);
            $ratings[] = $questionText . ': ' . $rating;
        }

        return implode("\n", $ratings);
    }

    private function formatRanking($completionData, $task): string
    {
        $selectedOptions = $completionData['selected_option'] ?? [];
        if (empty($selectedOptions)) {
            return 'No response';
        }

        $taskData = $this->parseTaskData($task->options);
        $questions = $taskData['questions'] ?? [];

        $rankings = [];
        foreach ($selectedOptions as $index => $rank) {
            if (isset($questions[$index])) {
                $rankings[] = ($rank + 1) . '. ' . ($questions[$index]['text'] ?? 'Option ' . ($index + 1));
            }
        }

        return implode("\n", $rankings);
    }

    private function formatTextAnswer($completionData): string
    {
        $selectedOptions = $completionData['selected_option'] ?? [];
        if (empty($selectedOptions)) {
            return 'No response';
        }

        return is_array($selectedOptions) ? implode("\n", $selectedOptions) : $selectedOptions;
    }

    private function formatSorting($completionData, $task): string
    {
        $selectedOptions = $completionData['selected_option'] ?? [];
        if (empty($selectedOptions)) {
            return 'No response';
        }

        $taskData = $this->parseTaskData($task->options);
        $questions = $taskData['questions'] ?? [];

        $sortedItems = [];
        foreach ($selectedOptions as $index => $position) {
            if (isset($questions[$index])) {
                $sortedItems[] = ($position + 1) . '. ' . ($questions[$index]['text'] ?? 'Item ' . ($index + 1));
            }
        }

        return implode("\n", $sortedItems);
    }

    private function formatQuickForm($completionData): string
    {
        if (empty($completionData)) {
            return 'No form data';
        }

        $responses = [];
        foreach ($completionData as $index => $field) {
            if (is_array($field)) {
                $label = $field['label'] ?? 'Field ' . ($index + 1);
                $value = $this->extractFormValue($field);
                if ($value) {
                    $responses[] = $label . ': ' . $value;
                }
            }
        }

        return implode("\n", $responses);
    }

    private function extractFormValue($field): string
    {
        if (isset($field['value'])) {
            return is_array($field['value']) ? implode(', ', $field['value']) : $field['value'];
        }

        if (isset($field['selected_options'])) {
            return implode(', ', $field['selected_options']);
        }

        return 'No response';
    }

    private function formatDefault($completionData): string
    {
        $selectedOption = $completionData['selected_option'] ?? null;

        if ($selectedOption === null) {
            return 'No response';
        }

        if (is_array($selectedOption)) {
            return implode("\n", $selectedOption);
        }

        return (string) $selectedOption;
    }

    private function extractQuestions(array $taskData, string $taskType): string
    {
        if (! isset($taskData['questions']) || ! is_array($taskData['questions'])) {
            return 'No questions defined';
        }

        $questionTexts = [];

        foreach ($taskData['questions'] as $index => $question) {
            if ($taskType === 'quick_form') {
                $questionTexts[] = ($index + 1) . '. ' . ($question['label'] ?? 'N/A');
            } else {
                $questionTexts[] = ($index + 1) . '. ' . ($question['text'] ?? 'N/A');
            }
        }

        return ! empty($questionTexts) ? implode("\n", $questionTexts) : 'No questions';
    }

    private function parseTaskData($taskData): array
    {
        if (is_array($taskData)) {
            return $taskData;
        }

        if (is_string($taskData)) {
            $decoded = json_decode($taskData, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        return [];
    }

    public function styles(Worksheet $sheet)
    {
        // Get the highest row and column to apply styles to the entire sheet
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        // Apply wrap text and middle-left alignment to the entire worksheet
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->getAlignment()->setWrapText(true);
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT);

        return [
            // Header row style - bold text with background color
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '6A5ACD'],
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => 'FFFFFF'],
                    ],
                ],
                'alignment' => [
                    'wrapText' => true,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
                ],
            ],

            // Participant info rows - different background color
            'A:A' => [
                'font' => [
                    'bold' => true,
                ],
            ],

            // Data rows style - apply to all rows from 2 to the end
            'A2:' . $highestColumn . $highestRow => [
                'alignment' => [
                    'wrapText' => true,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => 'DDDDDD'],
                    ],
                ],
            ],
        ];
    }
}
