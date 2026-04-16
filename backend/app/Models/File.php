<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'path',
        'type',
        'size',
        'mime_type',
        'extension',
        'original_name',
        'user_id',
        'is_active',
        'is_deleted',
        'deleted_at',
        'restored_at',
        'created_by',
        'updated_by',
        'deleted_by',
        'restored_by',
    ];

    protected $dates = ['deleted_at', 'restored_at'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_deleted' => 'boolean',
        'size' => 'integer',
        'user_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'deleted_by' => 'integer',
        'restored_by' => 'integer',
    ];

    /**
     * Accessor: Returns the full URL if path is a file path.
     */
    public function getPathAttribute(string $path): string
    {
        // If the path is a relative path, convert it to a full URL
        return $path ? url($path) : url('');
    }

    // Relationships
    /**
     * The user who uploaded the file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query): Builder
    {
        return $query->where('is_active', false);
    }

    public function scopeDeleted($query): Builder
    {
        return $query->where('is_deleted', true);
    }

    public function scopeNotDeleted($query): Builder
    {
        return $query->where('is_deleted', false);
    }

    public function scopeByType($query, $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeByUser($query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeSearch($query, $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'LIKE', "%{$term}%")
                ->orWhere('original_name', 'LIKE', "%{$term}%");
        });
    }

    public function scopeDateBetween($query, $from, $to): Builder
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}
