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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->integer('quiz_id')->nullable();
            $table->integer('serial_number')->nullable(); // Serial number for the question
            $table->string('question_text')->nullable(); // Text of the question
            $table->string('question_type')->nullable(); // Type of question (multiple_choice, true_false, short_answer, etc.)
            $table->integer('time_limit_seconds')->nullable(); // Time limit for the question in seconds
            $table->integer('points')->nullable(); // Points for the question
            $table->boolean('is_ai_generated')->default(false); // Indicates if the question is AI-generated
            $table->text('source_content_url')->nullable(); // URL of the source content for the question
            $table->jsonb('options')->nullable(); // JSONB column for storing options
            $table->string('visibility'); // Visibility of the quiz (public, private, etc.)
            $table->softDeletes(); // Adds deleted_at column
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
