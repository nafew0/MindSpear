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
        Schema::table('survey_questions', function (Blueprint $table) {
            // Add section_id column
            $table->unsignedBigInteger('section_id')->nullable()->after('page_id');

            // Add foreign key constraint
            $table->foreign('section_id')->references('id')->on('survey_sections')->onDelete('set null');

            // Modify the page_id to be nullable since questions now belong to sections
            $table->unsignedBigInteger('page_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
            $table->unsignedBigInteger('page_id')->nullable(false)->change();
        });
    }
};
