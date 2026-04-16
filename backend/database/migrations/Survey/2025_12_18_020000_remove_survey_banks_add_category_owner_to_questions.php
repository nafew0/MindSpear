<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add owner, visibility to survey questions
        Schema::table('survey_questions', function (Blueprint $table) {
            if (! Schema::hasColumn('survey_questions', 'owner_id')) {
                $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            }
            if (! Schema::hasColumn('survey_questions', 'visibility')) {
                $table->enum('visibility', ['public', 'private', 'unlisted'])->default('private');
            }
        });

        // Drop survey bank structures
        if (Schema::hasTable('survey_q_bank_questions')) {
            Schema::drop('survey_q_bank_questions');
        }
        if (Schema::hasTable('survey_q_banks')) {
            Schema::drop('survey_q_banks');
        }
    }

    public function down(): void
    {
        // Recreate survey bank structures (structure only)
        if (! Schema::hasTable('survey_q_banks')) {
            Schema::create('survey_q_banks', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('survey_q_bank_category_id')->constrained('survey_q_bank_categories');
                $table->string('tags', 60)->nullable();
                $table->foreignId('created_by')->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('survey_q_bank_questions')) {
            Schema::create('survey_q_bank_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('survey_q_bank_id')->constrained('survey_q_banks')->onDelete('cascade');
                $table->foreignId('survey_question_id')->constrained('survey_questions')->onDelete('cascade');
                $table->timestamps();
            });
        }

        Schema::table('survey_questions', function (Blueprint $table) {
            if (Schema::hasColumn('survey_questions', 'owner_id')) {
                $table->dropForeign(['owner_id']);
                $table->dropColumn('owner_id');
            }
            // Keep visibility column
        });
    }
};
