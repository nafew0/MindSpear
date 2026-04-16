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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Name of the file');
            $table->string('path')->comment('Path to the file in storage');
            $table->string('type')->comment('Type of the file (e.g., image, document)');
            $table->string('size')->comment('Size of the file in bytes');
            $table->string('mime_type')->nullable()->comment('MIME type of the file');
            $table->string('extension')->nullable()->comment('File extension (e.g., jpg, pdf)');
            $table->string('original_name')->nullable()->comment('Original name of the file before upload');
            $table->unsignedBigInteger('user_id')->nullable()->comment('ID of the user who uploaded the file');
            $table->boolean('is_active')->default(true)->comment('Indicates if the file is active');
            $table->boolean('is_deleted')->default(false)->comment('Indicates if the file is deleted');
            $table->timestamp('deleted_at')->nullable()->comment('Timestamp when the file was deleted');
            $table->timestamp('restored_at')->nullable()->comment('Timestamp when the file was restored');
            $table->string('created_by')->nullable()->comment('User who created the file record');
            $table->string('updated_by')->nullable()->comment('User who last updated the file record');
            $table->string('deleted_by')->nullable()->comment('User who deleted the file record');
            $table->string('restored_by')->nullable()->comment('User who restored the file record');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null')->comment('Foreign key to users table');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
