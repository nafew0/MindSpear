<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add owner and visibility references directly on questions
        Schema::table('questions', function (Blueprint $table) {
            if (! Schema::hasColumn('questions', 'owner_id')) {
                $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            }
            if (! Schema::hasColumn('questions', 'visibility')) {
                $table->enum('visibility', ['public', 'private', 'unlisted'])->default('private');
            }
        });

        // Drop pivot and bank tables if they exist
        if (Schema::hasTable('quiz_q_bank_questions')) {
            Schema::drop('quiz_q_bank_questions');
        }
        if (Schema::hasTable('quiz_q_banks')) {
            Schema::drop('quiz_q_banks');
        }
    }

    public function down(): void
    {
        // Recreate bank tables (structure only) if needed
        if (! Schema::hasTable('quiz_q_banks')) {
            Schema::create('quiz_q_banks', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->foreignId('quiz_q_bank_category_id')->constrained('quiz_q_bank_categories');
                $table->string('tags', 240)->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('quiz_q_bank_questions')) {
            Schema::create('quiz_q_bank_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('question_bank_id')->constrained('quiz_q_banks')->onDelete('cascade');
                $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
                $table->timestamps();
            });
        }

        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'owner_id')) {
                $table->dropForeign(['owner_id']);
                $table->dropColumn('owner_id');
            }
            // Keep visibility column since it may be in use
        });
    }
};
