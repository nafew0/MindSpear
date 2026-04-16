<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait FileUploadTrait
{
    /**
     * Handle the file upload.
     *
     * The file will be stored in a directory structure based on:
     * - Year: `Y`
     * - Month: `m`
     * - Day: `d`
     * - File type: the file's original extension
     *
     * The file will be renamed to a random unique name.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  UploadedFile  $file  The file to be uploaded.
     * @param  string  $baseDirectory  The base directory where the file should be stored.
     * @param  string|null  $oldFile  The old file path to delete, if any.
     * @return string The path to the stored file.
     */
    public function uploadFile(UploadedFile $file, string $baseDirectory, ?string $oldFile = null): string
    {
        // Get the current date using PHP's built-in functions
        $year = date('Y');
        $month = date('m');
        $day = date('d');
        $extension = $file->getClientOriginalExtension();

        // Build the directory structure: year/month/day/baseDirectory
        $directory = sprintf(
            '%s/%s/%s/%s',
            $year,
            $month,
            $day,
            $baseDirectory,
        );

        // Generate a random file name
        $fileName = Str::random(40) . '.' . $extension;

        // Full path to store the file
        $filePath = 'storage/' . $directory . '/' . $fileName;

        // Delete the old file if it exists
        if ($oldFile) {
            Storage::disk(getStorageDriver())->delete($oldFile);
        }

        // Store the new file using the helper to get the storage driver and return its path
        Storage::disk(getStorageDriver())->putFileAs('public/' . $directory, $file, $fileName);

        return $filePath;
    }

    /**
     * Remove a file from the storage.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  string  $filePath  The path of the file to be deleted.
     * @return bool True if the file was deleted, false otherwise.
     */
    public function removeFile(string $filePath): bool
    {
        // Skip if it's an external URL
        if (filter_var($filePath, FILTER_VALIDATE_URL)) {
            return false;
        }

        // Normalize the file path
        $relativePath = Str::startsWith($filePath, 'storage/')
            ? str_replace('storage/', 'public/', $filePath)
            : $filePath;

        // Check if the file exists and delete it
        if (! Storage::disk(getStorageDriver())->exists($relativePath)) {
            return false;
        }

        return Storage::disk(getStorageDriver())->delete($relativePath);
    }

    /**
     * Remove a file from the storage.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  string  $filePath  The path of the file to be deleted.
     * @return bool True if the file was deleted, false otherwise.
     */
    public function checkExistsFile(string $filePath): bool
    {
        // Check if the file exists in the storage
        return Storage::url($filePath);
    }
}
