<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // No longer creating pivot table; managed directly via category link on survey_questions
    }

    public function down(): void
    {
        // No-op
    }
};
