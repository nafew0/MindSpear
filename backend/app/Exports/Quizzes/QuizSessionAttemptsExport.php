<?php

namespace App\Exports\Quizzes;

use App\Models\Quiz\QuizSession;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class QuizSessionAttemptsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $quizSession;

    protected $uniqueQuestions;

    protected $questionsWithOptions = [];

    public function __construct(QuizSession $quizSession, $uniqueQuestions)
    {
        $this->quizSession = $quizSession;
        $this->uniqueQuestions = $uniqueQuestions;

        // Pre-process questions to extract options
        foreach ($uniqueQuestions as $question) {
            $this->questionsWithOptions[$question->id] = $this->extractQuestionOptions($question);
        }
    }

    public function collection()
    {
        // Load participants with their answers
        return $this->quizSession->participants()->with('userQuizAnswers')->get();
    }

    public function headings(): array
    {
        $baseHeadings = [
            'Timestamp',
            'Name',
            'Email',
            'University',
            'Type of University',
            'Designation',
        ];

        $questionHeadings = [];

        foreach ($this->uniqueQuestions as $question) {
            $questionText = $question->question_text ?? 'Quiz Question';

            // Check if we have options to display
            if (isset($this->questionsWithOptions[$question->id]['has_options']) &&
                $this->questionsWithOptions[$question->id]['has_options']) {

                $options = $this->questionsWithOptions[$question->id]['options'];
                $formattedOptions = [];

                // Only show the actual number of available options
                $optionCount = count($options);
                for ($i = 0; $i < $optionCount; $i++) {
                    if (! empty($options[$i])) { // Skip empty options
                        $formattedOptions[] = ($i + 1) . ' - ' . $options[$i];
                    }
                }

                if (! empty($formattedOptions)) {
                    // Add line break after question text
                    $questionText .= "\n" . implode("\n", $formattedOptions);
                }
            }

            $questionHeadings[] = $questionText;
        }

        return array_merge($baseHeadings, $questionHeadings);
    }

    public function map($participant): array
    {
        $name = $this->extractNameFromAnonymousDetails($participant);
        $email = $this->extractEmailFromAnonymousDetails($participant);

        $rowData = [
            $participant->created_at ?? '',
            $name,
            $email,
            $participant->university ?? $participant->institution ?? $participant->university_name ?? '',
            $participant->type_of_university ?? $participant->university_type ?? $participant->institution_type ?? '',
            $participant->designation ?? $participant->role ?? $participant->title ?? $participant->position ?? '',
        ];

        // Add answer data for each question
        foreach ($this->uniqueQuestions as $question) {
            $answer = $this->findAnswerForQuestion($participant, $question->id);
            $rowData[] = $this->formatAnswerData($answer, $question);
        }

        return $rowData;
    }

    private function extractQuestionOptions($question)
    {
        $result = [
            'has_options' => false,
            'options' => [],
        ];

        if (empty($question->options)) {
            return $result;
        }

        $optionsData = $this->parseJsonData($question->options);

        // Try different possible structures
        if (isset($optionsData['choices']) && is_array($optionsData['choices'])) {
            // Filter out empty choices
            $filteredChoices = array_filter($optionsData['choices'], function ($choice) {
                return ! empty($choice) && trim($choice) !== '';
            });

            if (! empty($filteredChoices)) {
                $result['has_options'] = true;
                $result['options'] = array_values($filteredChoices); // Re-index array
            }
        } elseif (isset($optionsData['options']) && is_array($optionsData['options'])) {
            // Filter out empty options
            $filteredOptions = array_filter($optionsData['options'], function ($option) {
                return ! empty($option) && trim($option) !== '';
            });

            if (! empty($filteredOptions)) {
                $result['has_options'] = true;
                $result['options'] = array_values($filteredOptions); // Re-index array
            }
        } elseif (is_array($optionsData) && ! empty($optionsData)) {
            // Check if it's a simple array of options
            // Filter out empty values
            $filteredData = array_filter($optionsData, function ($item) {
                return ! empty($item) && trim($item) !== '';
            });

            if (! empty($filteredData)) {
                $firstElement = reset($filteredData);
                if (is_string($firstElement) || is_numeric($firstElement)) {
                    $result['has_options'] = true;
                    $result['options'] = array_values($filteredData); // Re-index array
                }
            }
        }

        return $result;
    }

    private function findAnswerForQuestion($participant, $questionId)
    {
        if (! $participant->relationLoaded('userQuizAnswers')) {
            return null;
        }

        return $participant->userQuizAnswers->firstWhere('question_id', $questionId);
    }

    private function extractNameFromAnonymousDetails($participant): string
    {
        // First, try direct name field
        if (! empty($participant->name)) {
            return $participant->name;
        }

        // Then try anonymous_details JSON
        if (! empty($participant->anonymous_details)) {
            $anonymousData = $this->parseJsonData($participant->anonymous_details);

            if (isset($anonymousData['name'])) {
                return $anonymousData['name'];
            }

            if (isset($anonymousData['full_name'])) {
                return $anonymousData['full_name'];
            }

            if (isset($anonymousData['user_name'])) {
                return $anonymousData['user_name'];
            }
        }

        // Then try user relationship
        if ($participant->relationLoaded('user') && $participant->user) {
            return $participant->user->name ?? $participant->user->full_name ?? '';
        }

        return 'Unknown';
    }

    private function extractEmailFromAnonymousDetails($participant): string
    {
        // First, try direct email field
        if (! empty($participant->email)) {
            return $participant->email;
        }

        // Then try anonymous_details JSON
        if (! empty($participant->anonymous_details)) {
            $anonymousData = $this->parseJsonData($participant->anonymous_details);

            if (isset($anonymousData['email'])) {
                return $anonymousData['email'];
            }

            if (isset($anonymousData['email_address'])) {
                return $anonymousData['email_address'];
            }
        }

        // Then try user relationship
        if ($participant->relationLoaded('user') && $participant->user) {
            return $participant->user->email ?? '';
        }

        return '';
    }

    private function formatAnswerData($answer, $question): string
    {
        if (! $answer) {
            return 'Not answered';
        }

        // Get answer data
        $answerData = $this->extractAnswerData($answer);

        if (empty($answerData)) {
            return 'No answer data';
        }

        $selectedOption = $answerData['selected_option'] ?? null;

        if ($selectedOption === null) {
            return 'Not answered';
        }

        // Handle different data types
        if (is_array($selectedOption)) {
            // For array answers (multiple choice or word cloud)
            return $this->formatArrayAnswer($selectedOption, $question);
        }

        if (is_numeric($selectedOption)) {
            // For numeric answers (single choice index)
            return $this->formatNumericAnswer($selectedOption, $question);
        }

        if (is_string($selectedOption) && ! empty($selectedOption)) {
            // For string answers
            return $selectedOption;
        }

        return 'Answered';
    }

    private function extractAnswerData($answer)
    {
        // Try different possible answer data fields
        $fieldsToCheck = ['answer_data', 'completion_data', 'data', 'answer'];

        foreach ($fieldsToCheck as $field) {
            if (! empty($answer->{$field})) {
                $data = $this->parseJsonData($answer->{$field});
                if (! empty($data)) {
                    return $data;
                }
            }
        }

        return [];
    }

    private function parseJsonData($data)
    {
        if (empty($data)) {
            return [];
        }

        if (is_array($data)) {
            return $data;
        }

        if (is_string($data)) {
            $decoded = json_decode($data, true);

            return json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        if (is_object($data)) {
            return (array) $data;
        }

        return [];
    }

    private function formatArrayAnswer($selectedOption, $question): string
    {
        if (empty($selectedOption)) {
            return 'Not answered';
        }

        // Check if it's an array of strings (like word cloud or text answers)
        if (isset($selectedOption[0]) && is_string($selectedOption[0])) {
            return implode(', ', $selectedOption);
        }

        // Check if it's an array of indices (multiple choice)
        if (is_array($selectedOption)) {
            // Get options for this question
            $options = $this->questionsWithOptions[$question->id]['options'] ?? [];

            if (empty($options)) {
                // If no options available, return the indices
                $indices = array_map(function ($index) {
                    return 'Option ' . ($index + 1);
                }, $selectedOption);

                return implode(', ', $indices);
            }

            // Map indices to option texts
            $selectedTexts = [];
            foreach ($selectedOption as $index) {
                if (isset($options[$index])) {
                    $selectedTexts[] = $options[$index];
                } else {
                    $selectedTexts[] = 'Option ' . ($index + 1);
                }
            }

            return implode(', ', $selectedTexts);
        }

        return 'Unknown array format';
    }

    private function formatNumericAnswer($selectedOption, $question): string
    {
        // Get options for this question
        $options = $this->questionsWithOptions[$question->id]['options'] ?? [];

        if (empty($options)) {
            return 'Option ' . ($selectedOption + 1);
        }

        if (isset($options[$selectedOption])) {
            return $options[$selectedOption];
        }

        return 'Option ' . ($selectedOption + 1);
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        // Apply wrap text and alignment to entire sheet
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)
            ->getAlignment()
            ->setWrapText(true)
            ->setVertical(Alignment::VERTICAL_TOP)
            ->setHorizontal(Alignment::HORIZONTAL_LEFT);

        // Set row height for header row to accommodate multi-line content
        $sheet->getRowDimension(1)->setRowHeight(80); // Increased height for header

        // Auto size columns
        foreach (range('A', $highestColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

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
