<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->string('public_channel_key', 48)->nullable()->after('session_id');
            $table->foreignId('current_question_id')->nullable()->after('running_status')->constrained('questions')->nullOnDelete();
            $table->jsonb('timer_state')->nullable()->after('current_question_id');
        });

        DB::table('quiz_sessions')
            ->whereNull('public_channel_key')
            ->orderBy('id')
            ->select('id')
            ->chunkById(100, function ($sessions) {
                foreach ($sessions as $session) {
                    DB::table('quiz_sessions')
                        ->where('id', $session->id)
                        ->update(['public_channel_key' => Str::lower(Str::random(32))]);
                }
            });

        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->unique('public_channel_key');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropUnique(['public_channel_key']);
            $table->dropForeign(['current_question_id']);
            $table->dropColumn(['public_channel_key', 'current_question_id', 'timer_state']);
        });
    }
};
