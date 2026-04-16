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
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('survey_id');
            $table->unsignedBigInteger('page_id')->nullable();
            $table->integer('serial_number')->nullable();
            $table->text('question_text')->nullable();
            $table->string('question_type')->nullable(); // Type of question (multiple_choice, true_false, short_answer, etc.)
            $table->jsonb('options')->nullable(); // JSONB column for storing options
            $table->boolean('is_required')->default(false);
            $table->unsignedBigInteger('conditional_parent_id')->nullable();
            $table->string('conditional_value', 100)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('survey_id')->references('id')->on('surveys')->onDelete('set null');
            $table->foreign('page_id')->references('id')->on('survey_pages')->onDelete('set null');

            $table->foreign('conditional_parent_id')->references('id')->on('survey_questions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
    }
};
