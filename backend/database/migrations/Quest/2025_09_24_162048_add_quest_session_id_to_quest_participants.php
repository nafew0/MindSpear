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
        Schema::table('quest_participants', function (Blueprint $table) {
            $table->foreignId('quest_session_id')
                  ->nullable()
                  ->after('quest_id')
                  ->constrained('quest_sessions')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quest_participants', function (Blueprint $table) {
            $table->dropForeign(['quest_session_id']);
            $table->dropColumn('quest_session_id');
        });
    }
};
