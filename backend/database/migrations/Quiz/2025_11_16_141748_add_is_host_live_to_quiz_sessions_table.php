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
        Schema::table('quiz_sessions', function (Blueprint $table) {
        // Choose one of the options above
        $table->boolean('is_host_live')->default(true)->after('timezone');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Simply drop the running_status column
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropColumn('is_host_live');
        });
    }
};
