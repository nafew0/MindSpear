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
        // Drop foreign keys and columns referencing sections from survey_questions
        Schema::table('survey_questions', function (Blueprint $table) {
            if (Schema::hasColumn('survey_questions', 'section_id')) {
                $table->dropForeign(['section_id']);
                $table->dropColumn('section_id');
            }
            if (Schema::hasColumn('survey_questions', 'conditional_section_id')) {
                $table->dropForeign(['conditional_section_id']);
                $table->dropColumn('conditional_section_id');
            }
            if (Schema::hasColumn('survey_questions', 'starts_new_section')) {
                $table->dropColumn('starts_new_section');
            }
        });

        // Drop conditional_section_id from survey_pages
        Schema::table('survey_pages', function (Blueprint $table) {
            if (Schema::hasColumn('survey_pages', 'conditional_section_id')) {
                $table->dropForeign(['conditional_section_id']);
                $table->dropColumn('conditional_section_id');
            }
        });

        // Drop current_section_id from survey_responses
        Schema::table('survey_responses', function (Blueprint $table) {
            if (Schema::hasColumn('survey_responses', 'current_section_id')) {
                $table->dropForeign(['current_section_id']);
                $table->dropColumn('current_section_id');
            }
        });

        // Finally, drop the survey_sections table if it exists
        if (Schema::hasTable('survey_sections')) {
            Schema::drop('survey_sections');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This down migration attempts to recreate the removed structures in a minimal form.
        // Note: Data cannot be restored.

        if (! Schema::hasTable('survey_sections')) {
            Schema::create('survey_sections', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('survey_id');
                $table->unsignedBigInteger('page_id');
                $table->integer('section_number');
                $table->string('serial_number')->nullable();
                $table->string('title', 100)->nullable();
                $table->text('description')->nullable();
                $table->boolean('has_conditional_logic')->default(false);
                $table->string('conditional_parent_type', 50)->nullable();
                $table->unsignedBigInteger('conditional_question_id')->nullable();
                $table->unsignedBigInteger('conditional_page_id')->nullable();
                $table->string('conditional_value', 100)->nullable();
                $table->string('conditional_operator', 20)->default('equals');
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('survey_id')->references('id')->on('surveys')->onDelete('set null');
                $table->foreign('page_id')->references('id')->on('survey_pages')->onDelete('set null');
                $table->foreign('conditional_question_id')->references('id')->on('survey_questions')->onDelete('set null');
                $table->foreign('conditional_page_id')->references('id')->on('survey_pages')->onDelete('set null');
            });
        }

        Schema::table('survey_questions', function (Blueprint $table) {
            if (! Schema::hasColumn('survey_questions', 'section_id')) {
                $table->unsignedBigInteger('section_id')->nullable()->after('page_id');
                $table->foreign('section_id')->references('id')->on('survey_sections')->onDelete('set null');
            }
            if (! Schema::hasColumn('survey_questions', 'conditional_section_id')) {
                $table->unsignedBigInteger('conditional_section_id')->nullable()->after('conditional_question_id');
                $table->foreign('conditional_section_id')->references('id')->on('survey_sections')->onDelete('set null');
            }
            if (! Schema::hasColumn('survey_questions', 'starts_new_section')) {
                $table->boolean('starts_new_section')->default(false)->after('is_required');
            }
        });

        Schema::table('survey_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('survey_pages', 'conditional_section_id')) {
                $table->unsignedBigInteger('conditional_section_id')->nullable()->after('conditional_question_id');
                $table->foreign('conditional_section_id')->references('id')->on('survey_sections')->onDelete('set null');
            }
        });

        Schema::table('survey_responses', function (Blueprint $table) {
            if (! Schema::hasColumn('survey_responses', 'current_section_id')) {
                $table->unsignedBigInteger('current_section_id')->nullable()->after('current_page_id');
                $table->foreign('current_section_id')->references('id')->on('survey_sections')->onDelete('set null');
            }
        });
    }
};

