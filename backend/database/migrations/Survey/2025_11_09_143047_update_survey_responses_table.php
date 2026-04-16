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
        Schema::table('survey_responses', function (Blueprint $table) {
            $table->unsignedBigInteger('current_page_id')->nullable()->after('status');
            $table->unsignedBigInteger('current_section_id')->nullable()->after('current_page_id');
            $table->jsonb('progress_data')->nullable()->after('current_section_id');

            $table->foreign('current_page_id')->references('id')->on('survey_pages')->onDelete('set null');
            $table->foreign('current_section_id')->references('id')->on('survey_sections')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_responses', function (Blueprint $table) {
            $table->dropForeign(['current_page_id']);
            $table->dropForeign(['current_section_id']);
            $table->dropColumn(['current_page_id', 'current_section_id', 'progress_data']);
        });
    }
};
