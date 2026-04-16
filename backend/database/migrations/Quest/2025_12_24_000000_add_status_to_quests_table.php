<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quests', function (Blueprint $table) {
            $table->string('status')->default('Not Started')->after('sequential_progression');
        });

        DB::table('quests')->chunkById(100, function ($quests) {
            foreach ($quests as $quest) {
                $status = 'Not Started';

                $hasRunningSession = DB::table('quest_sessions')
                    ->where('quest_id', $quest->id)
                    ->where('running_status', true)
                    ->exists();

                if ($hasRunningSession) {
                    $status = 'Running';
                } else {
                    $hasEndedSession = DB::table('quest_sessions')
                        ->where('quest_id', $quest->id)
                        ->whereNotNull('end_datetime')
                        ->where('end_datetime', '<=', now())
                        ->exists();

                    if ($hasEndedSession) {
                        $status = 'Ended';
                    } else {
                        $hasSession = DB::table('quest_sessions')
                            ->where('quest_id', $quest->id)
                            ->exists();

                        if ($hasSession) {
                            $status = 'Initiated';
                        }
                    }
                }

                DB::table('quests')
                    ->where('id', $quest->id)
                    ->update(['status' => $status]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quests', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
