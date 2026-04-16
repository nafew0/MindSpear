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
        Schema::table('survey_responses', function (Blueprint $table) {
            if (! Schema::hasColumn('survey_responses', 'submitted_at')) {
                $table->dateTime('submitted_at')->nullable()->after('end_time');
                $table->index(['survey_id', 'submitted_at']);
            }
        });

        DB::table('survey_responses')
            ->whereNull('submitted_at')
            ->whereNotNull('end_time')
            ->update([
                'submitted_at' => DB::raw('end_time'),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_responses', function (Blueprint $table) {
            if (Schema::hasColumn('survey_responses', 'submitted_at')) {
                $table->dropIndex(['survey_id', 'submitted_at']);
                $table->dropColumn('submitted_at');
            }
        });
    }
};
