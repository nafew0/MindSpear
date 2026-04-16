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
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->boolean('starts_new_section')->default(false)->after('is_required');
            $table->string('display_type', 50)->default('default')->after('starts_new_section'); // default, inline, matrix, etc.
            $table->jsonb('display_conditions')->nullable()->after('display_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->dropColumn(['starts_new_section', 'display_type', 'display_conditions']);
        });
    }
};
