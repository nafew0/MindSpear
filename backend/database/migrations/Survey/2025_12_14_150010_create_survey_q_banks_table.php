<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // No longer creating survey_q_banks; managed directly via categories and survey_questions
    }

    public function down(): void
    {
        // No-op
    }
};
