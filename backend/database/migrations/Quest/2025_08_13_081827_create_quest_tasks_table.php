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
        Schema::create('quest_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quest_id')->constrained('quests')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('task_type'); // information, question, action, etc.
            $table->integer('serial_number')->default(0);
            $table->jsonb('task_data')->nullable(); // Custom data based on task type
            $table->boolean('is_required')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quest_tasks');
    }
};
