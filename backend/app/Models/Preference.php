<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Preference extends Model
{
    protected $fillable = [
        'category',
        'field',
        'value',
    ];

    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Accessor: Returns the full URL if value is a file path.
     *
     * @return mixed
     */
    public function getValueAttribute($value)
    {
        // If value is JSON-decoded, return it as-is
        if (is_array($value) || is_object($value)) {
            return $value;
        }

        // If value is a file path (contains "storage/"), return full URL
        if (is_string($value) && str_contains($value, 'storage')) {
            // Remove all escaped quotes and slashes
            $cleanPath = str_replace(['\"', '\'', '\\/'], ['', '', '/'], $value);
            // Trim any remaining quotes from the start/end
            $cleanPath = trim($cleanPath, '"\'');

            return url($cleanPath);
        }

        // Default: return the raw value (string or JSON)
        return $value;
    }
}
