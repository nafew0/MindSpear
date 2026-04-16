<?php

// app/Helpers/EnvHelper.php

namespace App\Helpers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class EnvHelper
{
    public static function getEnvValues(array $keys)
    {
        $values = [];
        foreach ($keys as $key) {
            $values[$key] = env($key);
        }

        return $values;
    }

    public static function setEnvValues(array $values)
    {
        $envPath = base_path('.env');

        if (! file_exists($envPath)) {
            Log::error('.env file not found at path: ' . $envPath);

            return false;
        }

        $envContent = File::get($envPath);
        $updated = false;

        foreach ($values as $key => $value) {
            $escapedKey = preg_quote($key, '/');

            // Safely convert value to string and escape
            $escapedValue = str_replace(
                ['"', "\n", "\r"],
                ['\"', '', ''],
                (string) $value
            );

            $pattern = "/^{$escapedKey}=.*/m";

            if (preg_match($pattern, $envContent)) {
                // Update existing key
                $envContent = preg_replace(
                    $pattern,
                    "{$key}=\"{$escapedValue}\"",
                    $envContent
                );
            } else {
                // Append new key
                $envContent = rtrim($envContent) . "\n{$key}=\"{$escapedValue}\"";
            }

            $updated = true;
        }

        if ($updated) {
            $written = File::put($envPath, $envContent);

            if ($written === false) {
                Log::error("Failed to write to .env file at {$envPath}");

                return false;
            }

            try {
                if (function_exists('app')) {
                    app()->forgetInstance('config');
                }

                if (method_exists(Artisan::class, 'call')) {
                    Artisan::call('config:clear');
                }
            } catch (\Throwable $e) {
                Log::error('Failed to clear config cache: ' . $e->getMessage());
            }

            return true;
        }

        return false;
    }

    public static function keyExists(string $key): bool
    {
        $envPath = base_path('.env');

        if (! file_exists($envPath)) {
            return false;
        }

        $envContent = File::get($envPath);

        return strpos($envContent, "{$key}=") !== false;
    }
}
