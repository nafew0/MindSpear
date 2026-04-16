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
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->string('conditional_operator', 20)->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->string('conditional_operator', 20)->default('equals')->nullable(false)->change();
        });
    }
};
