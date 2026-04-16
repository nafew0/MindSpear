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
        Schema::create('quizes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            // $table->integer('user_id')->nullable(); // ID of the user who created the quiz
            $table->integer('category_id')->nullable(); // ID of the category the quiz belongs to
            $table->boolean('is_published')->default(false); // Indicates if the quiz is published or not
            $table->boolean('is_live')->default(false); // Indicates if the quiz is live
            $table->dateTime('open_datetime')->nullable(); // Date and time when the quiz was published
            $table->dateTime('close_datetime')->nullable(); // Date and time when the quiz was closed
            $table->boolean('quiztime_mode')->default(false); // Indicates if the quiz is in quiztime mode
            $table->integer('duration')->nullable(); // Duration of the quiz in minutes
            $table->boolean('logged_in_users_only')->default(false); // Indicates if only logged-in users can take the quiz
            $table->boolean('safe_browser_mode')->default(false); // Indicates if safe browser mode is enabled
            $table->string('visibility'); // Visibility of the quiz (public, private, etc.)
            $table->string('quiz_mode')->default('normal'); // Mode of the quiz (normal, practice, etc.)
            $table->string('timezone')->default('UTC'); // Timezone of the quiz

            // Join Link & PIN Support
            $table->string('join_link')->nullable(); // Holds either auto-generated or manually set join link
            $table->string('join_code')->nullable(); // Holds either auto-generated or manually set join code

            $table->softDeletes(); // Adds deleted_at column
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            // $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizes');
    }
};
