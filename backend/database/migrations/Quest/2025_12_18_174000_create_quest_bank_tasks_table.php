<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quest_bank_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('q_bank_category_id')->nullable()->constrained('quest_task_bank_categories')->onDelete('set null');
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('task_type');
            $table->json('task_data')->nullable();
            $table->boolean('is_required')->default(false);
            $table->enum('visibility', ['public', 'private', 'unlisted'])->default('private');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quest_bank_tasks');
    }
};

