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
        Schema::table('survey_question_answers', function (Blueprint $table) {
            $table->boolean('is_validated')->default(false)->after('answer_data');
            $table->text('validation_notes')->nullable()->after('is_validated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_question_answers', function (Blueprint $table) {
            $table->dropColumn(['is_validated', 'validation_notes']);
        });
    }
};
