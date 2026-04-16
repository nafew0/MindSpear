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
        // Add conditional logic columns to survey_pages
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->boolean('has_conditional_logic')->default(false)->after('description');
            $table->string('conditional_parent_type', 50)->nullable()->after('has_conditional_logic');
        });

        // Add conditional logic columns to survey_sections
        Schema::table('survey_sections', function (Blueprint $table) {
            $table->boolean('has_conditional_logic')->default(false)->after('description');
            $table->string('conditional_parent_type', 50)->nullable()->after('has_conditional_logic');
        });

        // Add conditional logic columns to survey_questions
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->boolean('has_conditional_logic')->default(false)->after('is_required');
            $table->string('conditional_parent_type', 50)->nullable()->after('has_conditional_logic');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->dropColumn(['has_conditional_logic', 'conditional_parent_type']);
        });

        Schema::table('survey_sections', function (Blueprint $table) {
            $table->dropColumn(['has_conditional_logic', 'conditional_parent_type']);
        });

        Schema::table('survey_questions', function (Blueprint $table) {
            $table->dropColumn(['has_conditional_logic', 'conditional_parent_type']);
        });
    }
};
