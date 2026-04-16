<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // No longer creating quest_task_banks; managed directly via categories and quest_tasks
    }

    public function down(): void
    {
        // No-op
    }
};
