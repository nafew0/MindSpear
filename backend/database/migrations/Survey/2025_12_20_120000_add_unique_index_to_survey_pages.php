<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('survey_pages', function (Blueprint $table) {
            // Ensure unique page number per survey
            $table->unique(['survey_id', 'page_number'], 'survey_pages_survey_id_page_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->dropUnique('survey_pages_survey_id_page_number_unique');
        });
    }
};

