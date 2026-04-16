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
        Schema::create('survey_responses', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('survey_id');
            // $table->unsignedBigInteger('respondent_id')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->jsonb('anonymous_details')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->enum('status', ['In Progress', 'Completed', 'Abandoned'])->default('In Progress');

            $table->timestamps();
            $table->softDeletes();

            $table->foreignId('survey_id')->nullable()->constrained('surveys')->onDelete('set null');
            $table->foreignId('respondent_id')->nullable()->constrained('users')->onDelete('set null');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_responses');
    }
};
