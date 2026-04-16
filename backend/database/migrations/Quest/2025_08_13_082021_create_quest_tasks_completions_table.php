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
        Schema::create('quest_task_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained('quest_participants')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('quest_tasks')->onDelete('cascade');
            $table->enum('status', ['Pending', 'Completed', 'Skipped'])->default('Pending');
            $table->dateTime('completed_at')->nullable();
            $table->jsonb('completion_data')->nullable(); // Any data related to the completion
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quest_task_completions');
    }
};
