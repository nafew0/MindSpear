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
        Schema::create('survey_sections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('survey_id');
            $table->unsignedBigInteger('page_id');
            $table->integer('section_number');
            $table->string('serial_number')->nullable();
            $table->string('title', 100)->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('conditional_parent_id')->nullable();
            $table->string('conditional_value', 100)->nullable();
            $table->string('conditional_operator', 20)->default('equals');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('survey_id')->references('id')->on('surveys')->onDelete('set null');
            $table->foreign('page_id')->references('id')->on('survey_pages')->onDelete('set null');
            $table->foreign('conditional_parent_id')->references('id')->on('survey_questions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_sections');
    }
};
