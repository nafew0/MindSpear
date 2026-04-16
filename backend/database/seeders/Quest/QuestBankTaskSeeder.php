<?php

namespace Database\Seeders\Quest;

use Illuminate\Database\Seeder;
use App\Models\Quest\BankTask;

class QuestBankTaskSeeder extends Seeder
{
    public function run(): void
    {
        if (BankTask::count() > 0) {
            return;
        }

        $samples = [
            [
                'title' => 'Introduce Yourself',
                'description' => 'Write a short introduction.',
                'task_type' => 'text',
                'task_data' => null,
                'is_required' => true,
                'visibility' => 'public',
            ],
            [
                'title' => 'Upload Assignment',
                'description' => 'Attach your PDF assignment.',
                'task_type' => 'file',
                'task_data' => ['allowedTypes' => ['pdf']],
                'is_required' => false,
                'visibility' => 'private',
            ],
        ];

        foreach ($samples as $row) {
            BankTask::create(array_merge($row, [
                'owner_id' => 1,
            ]));
        }
    }
}

