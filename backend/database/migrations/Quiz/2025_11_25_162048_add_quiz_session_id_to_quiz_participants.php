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
        Schema::table('quiz_participants', function (Blueprint $table) {
            $table->foreignId('quiz_session_id')
                  ->nullable()
                  ->after('quiz_id')
                  ->constrained('quiz_sessions')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_participants', function (Blueprint $table) {
            $table->dropForeign(['quiz_session_id']);
            $table->dropColumn('quiz_session_id');
        });
    }
};
