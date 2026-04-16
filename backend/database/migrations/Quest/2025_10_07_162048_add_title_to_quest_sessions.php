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
        // Step 1: Add nullable title column
        Schema::table('quest_sessions', function (Blueprint $table) {
            $table->string('title')->nullable()->after('quest_id');
        });

        // Step 2: Populate null titles with session_id
        DB::table('quest_sessions')->whereNull('title')->update([
            'title' => DB::raw('session_id')
        ]);

        // Step 3: Make the title column NOT NULL
        Schema::table('quest_sessions', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Simply drop the title column
        Schema::table('quest_sessions', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
