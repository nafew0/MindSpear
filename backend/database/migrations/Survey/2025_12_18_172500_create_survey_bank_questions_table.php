<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('survey_bank_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('q_bank_category_id')->nullable()->constrained('survey_q_bank_categories')->onDelete('set null');
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('question_text');
            $table->string('question_type')->nullable();
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->enum('visibility', ['public', 'private', 'unlisted'])->default('private');
            $table->string('display_type')->nullable();
            $table->json('display_conditions')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_bank_questions');
    }
};

