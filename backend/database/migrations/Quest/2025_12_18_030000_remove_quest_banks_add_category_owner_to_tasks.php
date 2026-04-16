<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add owner, visibility to quest tasks
        Schema::table('quest_tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('quest_tasks', 'owner_id')) {
                $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            }
            if (! Schema::hasColumn('quest_tasks', 'visibility')) {
                $table->enum('visibility', ['public', 'private', 'unlisted'])->default('private');
            }
        });

        // Drop quest bank structures
        if (Schema::hasTable('quest_task_bank_tasks')) {
            Schema::drop('quest_task_bank_tasks');
        }
        if (Schema::hasTable('quest_task_banks')) {
            Schema::drop('quest_task_banks');
        }
    }

    public function down(): void
    {
        // Recreate quest bank structures (structure only)
        if (! Schema::hasTable('quest_task_banks')) {
            Schema::create('quest_task_banks', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('quest_task_bank_category_id')->constrained('quest_task_bank_categories');
                $table->string('tags', 60)->nullable();
                $table->foreignId('created_by')->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('quest_task_bank_tasks')) {
            Schema::create('quest_task_bank_tasks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quest_task_bank_id')->constrained('quest_task_banks')->onDelete('cascade');
                $table->foreignId('quest_task_id')->constrained('quest_tasks')->onDelete('cascade');
                $table->unique(['quest_task_bank_id', 'quest_task_id']);
                $table->timestamps();
            });
        }

        Schema::table('quest_tasks', function (Blueprint $table) {
            if (Schema::hasColumn('quest_tasks', 'owner_id')) {
                $table->dropForeign(['owner_id']);
                $table->dropColumn('owner_id');
            }
            // keep visibility
        });
    }
};
