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
        Schema::create('quest_task_dependencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('quest_tasks')->onDelete('cascade');
            $table->foreignId('prerequisite_task_id')->constrained('quest_tasks')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['task_id', 'prerequisite_task_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quest_task_dependencies');
    }
};
