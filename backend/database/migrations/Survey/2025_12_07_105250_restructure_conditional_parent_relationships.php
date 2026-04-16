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
        // Update survey_pages table
        Schema::table('survey_pages', function (Blueprint $table) {
            // Drop existing foreign key and column
            $table->dropForeign(['conditional_parent_id']);
            $table->dropColumn('conditional_parent_id');

            // Add separate columns for each parent type
            $table->unsignedBigInteger('conditional_question_id')->nullable()->after('conditional_parent_type');
            $table->unsignedBigInteger('conditional_section_id')->nullable()->after('conditional_question_id');
            $table->unsignedBigInteger('conditional_page_id')->nullable()->after('conditional_section_id');

            // Add foreign keys
            $table->foreign('conditional_question_id')->references('id')->on('survey_questions')->onDelete('set null');
            $table->foreign('conditional_section_id')->references('id')->on('survey_sections')->onDelete('set null');
            $table->foreign('conditional_page_id')->references('id')->on('survey_pages')->onDelete('set null');
        });

        // Update survey_sections table
        Schema::table('survey_sections', function (Blueprint $table) {
            // Drop existing foreign key and column
            $table->dropForeign(['conditional_parent_id']);
            $table->dropColumn('conditional_parent_id');

            // Add separate columns for each parent type
            $table->unsignedBigInteger('conditional_question_id')->nullable()->after('conditional_parent_type');
            $table->unsignedBigInteger('conditional_section_id')->nullable()->after('conditional_question_id');
            $table->unsignedBigInteger('conditional_page_id')->nullable()->after('conditional_section_id');

            // Add foreign keys
            $table->foreign('conditional_question_id')->references('id')->on('survey_questions')->onDelete('set null');
            $table->foreign('conditional_section_id')->references('id')->on('survey_sections')->onDelete('set null');
            $table->foreign('conditional_page_id')->references('id')->on('survey_pages')->onDelete('set null');
        });

        // Update survey_questions table
        Schema::table('survey_questions', function (Blueprint $table) {
            // Drop existing foreign key and column
            $table->dropForeign(['conditional_parent_id']);
            $table->dropColumn('conditional_parent_id');

            // Add separate columns for each parent type
            $table->unsignedBigInteger('conditional_question_id')->nullable()->after('conditional_parent_type');
            $table->unsignedBigInteger('conditional_section_id')->nullable()->after('conditional_question_id');
            $table->unsignedBigInteger('conditional_page_id')->nullable()->after('conditional_section_id');

            // Add foreign keys
            $table->foreign('conditional_question_id')->references('id')->on('survey_questions')->onDelete('set null');
            $table->foreign('conditional_section_id')->references('id')->on('survey_sections')->onDelete('set null');
            $table->foreign('conditional_page_id')->references('id')->on('survey_pages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse survey_questions changes
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->dropForeign(['conditional_question_id', 'conditional_section_id', 'conditional_page_id']);
            $table->dropColumn(['conditional_question_id', 'conditional_section_id', 'conditional_page_id']);

            // Restore original column
            $table->unsignedBigInteger('conditional_parent_id')->nullable();
            $table->foreign('conditional_parent_id')->references('id')->on('survey_questions')->onDelete('set null');
        });

        // Reverse survey_sections changes
        Schema::table('survey_sections', function (Blueprint $table) {
            $table->dropForeign(['conditional_question_id', 'conditional_section_id', 'conditional_page_id']);
            $table->dropColumn(['conditional_question_id', 'conditional_section_id', 'conditional_page_id']);

            // Restore original column
            $table->unsignedBigInteger('conditional_parent_id')->nullable();
            $table->foreign('conditional_parent_id')->references('id')->on('survey_questions')->onDelete('set null');
        });

        // Reverse survey_pages changes
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->dropForeign(['conditional_question_id', 'conditional_section_id', 'conditional_page_id']);
            $table->dropColumn(['conditional_question_id', 'conditional_section_id', 'conditional_page_id']);

            // Restore original column
            $table->unsignedBigInteger('conditional_parent_id')->nullable();
            $table->foreign('conditional_parent_id')->references('id')->on('survey_questions')->onDelete('set null');
        });
    }
};
