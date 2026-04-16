<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_bank_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('q_bank_category_id')->nullable()->constrained('quiz_q_bank_categories')->onDelete('set null');
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('question_text')->nullable();
            $table->string('question_type')->nullable();
            $table->integer('time_limit_seconds')->nullable();
            $table->integer('points')->nullable();
            $table->boolean('is_ai_generated')->default(false);
            $table->text('source_content_url')->nullable();
            $table->enum('visibility', ['public', 'private', 'unlisted'])->default('private');
            $table->json('options')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_bank_questions');
    }
};

