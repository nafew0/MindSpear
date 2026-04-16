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
        // Step 1: Add nullable status column
        Schema::table('quest_sessions', function (Blueprint $table) {
            $table->boolean('running_status')->after('title')->default(false);
        });

        // Step 2: Populate running_status based on end_datetime (skip if no data)
        if (DB::table('quest_sessions')->count() > 0) {
            DB::table('quest_sessions')
                ->where('end_datetime', '>', now())
                ->update(['running_status' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Simply drop the running_status column
        Schema::table('quest_sessions', function (Blueprint $table) {
            $table->dropColumn('running_status');
        });
    }
};
