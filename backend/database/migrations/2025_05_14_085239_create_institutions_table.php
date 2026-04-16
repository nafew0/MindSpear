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
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('type')->nullable(); // e.g., university, college, school
            $table->string('logo')->nullable(); // URL or path to the logo
            $table->string('status')->default('active'); // e.g., active, inactive
            $table->string('created_by')->nullable(); // User ID of the creator
            $table->string('updated_by')->nullable(); // User ID of the last updater
            $table->string('deleted_by')->nullable(); // User ID of the deleter
            $table->timestamp('deleted_at')->nullable(); // Soft delete timestamp
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
