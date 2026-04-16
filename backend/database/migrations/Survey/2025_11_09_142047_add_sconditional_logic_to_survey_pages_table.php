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
            $table->unsignedBigInteger('conditional_parent_id')->nullable()->after('description');
            $table->string('conditional_value', 100)->nullable()->after('conditional_parent_id');
            $table->string('conditional_operator', 20)->default('equals')->after('conditional_value');

            $table->foreign('conditional_parent_id')->references('id')->on('survey_questions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_pages', function (Blueprint $table) {
            $table->dropForeign(['conditional_parent_id']);
            $table->dropColumn(['conditional_parent_id', 'conditional_value', 'conditional_operator']);
        });
    }
};
