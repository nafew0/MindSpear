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
        Schema::table('quiz_q_bank_categories', function (Blueprint $table) {
        // Choose one of the options above
        $table->string('color_code')->nullable()->after('is_parent');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Simply drop the color_code column
        Schema::table('quiz_q_bank_categories', function (Blueprint $table) {
            $table->dropColumn('color_code');
        });
    }
};

