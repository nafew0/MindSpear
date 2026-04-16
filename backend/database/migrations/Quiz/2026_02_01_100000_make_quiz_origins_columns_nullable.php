<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * NOTE: On SQLite (local dev), columns are already nullable from the create migration.
     * This migration only applies its raw ALTER statements on MySQL/PostgreSQL (production).
     */
    public function up(): void
    {
        Schema::table('quiz_origins', function (Blueprint $table) {
            $table->dropForeign(['quiz_id']);
            $table->dropForeign(['origin_id']);
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE quiz_origins ALTER COLUMN quiz_id DROP NOT NULL');
            DB::statement('ALTER TABLE quiz_origins ALTER COLUMN origin_id DROP NOT NULL');
        }

        Schema::table('quiz_origins', function (Blueprint $table) {
            $table->foreign('quiz_id')->references('id')->on('quizes')->onDelete('set null');
            $table->foreign('origin_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_origins', function (Blueprint $table) {
            $table->dropForeign(['quiz_id']);
            $table->dropForeign(['origin_id']);
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE quiz_origins ALTER COLUMN quiz_id SET NOT NULL');
            DB::statement('ALTER TABLE quiz_origins ALTER COLUMN origin_id SET NOT NULL');
        }

        Schema::table('quiz_origins', function (Blueprint $table) {
            $table->foreign('quiz_id')->references('id')->on('quizes')->onDelete('set null');
            $table->foreign('origin_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
