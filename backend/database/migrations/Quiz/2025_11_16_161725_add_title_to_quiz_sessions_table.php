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
        $table->string('title')->nullable()->after('session_id');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Simply drop the title column
        Schema::table('quiz_sessions', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
};
