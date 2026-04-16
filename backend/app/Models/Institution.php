<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Institution extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'website',
        'type',
        'logo',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
        'deleted_at',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function getLogoAttribute($logo)
    {
        return $logo ? url($logo) : url();
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeSoftDeleted($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    public function scopeNotSoftDeleted($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('name', 'like', "%$searchTerm%")
                ->orWhere('address', 'like', "%$searchTerm%")
                ->orWhere('city', 'like', "%$searchTerm%")
                ->orWhere('state', 'like', "%$searchTerm%")
                ->orWhere('country', 'like', "%$searchTerm%")
                ->orWhere('postal_code', 'like', "%$searchTerm%")
                ->orWhere('phone', 'like', "%$searchTerm%")
                ->orWhere('email', 'like', "%$searchTerm%");
        });
    }

    public function scopeFilterByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeFilterByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeFilterByCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeFilterByUpdatedBy($query, $userId)
    {
        return $query->where('updated_by', $userId);
    }

    public function scopeFilterByDeletedBy($query, $userId)
    {
        return $query->where('deleted_by', $userId);
    }

    public function scopeFilterByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeFilterByDeletedAt($query, $deletedAt)
    {
        return $query->where('deleted_at', $deletedAt);
    }

    public function scopeFilterByNotDeletedAt($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeFilterByInstitutionId($query, $institutionId)
    {
        return $query->where('id', $institutionId);
    }

    public function scopeFilterByInstitutionName($query, $institutionName)
    {
        return $query->where('name', 'like', "%$institutionName%");
    }

    public function scopeFilterByInstitutionType($query, $institutionType)
    {
        return $query->where('type', $institutionType);
    }

    public function scopeFilterByInstitutionStatus($query, $institutionStatus)
    {
        return $query->where('status', $institutionStatus);
    }

    public function scopeFilterByInstitutionCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeFilterByInstitutionUpdatedBy($query, $userId)
    {
        return $query->where('updated_by', $userId);
    }

    public function scopeFilterByInstitutionDeletedBy($query, $userId)
    {
        return $query->where('deleted_by', $userId);
    }

    public function scopeFilterByInstitutionDeletedAt($query, $deletedAt)
    {
        return $query->where('deleted_at', $deletedAt);
    }

    public function scopeFilterByInstitutionNotDeletedAt($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeFilterByInstitutionAddress($query, $address)
    {
        return $query->where('address', 'like', "%$address%");
    }

    public function scopeFilterByInstitutionCity($query, $city)
    {
        return $query->where('city', 'like', "%$city%");
    }

    public function scopeFilterByInstitutionState($query, $state)
    {
        return $query->where('state', 'like', "%$state%");
    }

    public function scopeFilterByInstitutionCountry($query, $country)
    {
        return $query->where('country', 'like', "%$country%");
    }

    public function scopeFilterByInstitutionPostalCode($query, $postalCode)
    {
        return $query->where('postal_code', 'like', "%$postalCode%");
    }

    public function scopeFilterByInstitutionPhone($query, $phone)
    {
        return $query->where('phone', 'like', "%$phone%");
    }

    public function scopeFilterByInstitutionEmail($query, $email)
    {
        return $query->where('email', 'like', "%$email%");
    }

    public function scopeFilterByInstitutionWebsite($query, $website)
    {
        return $query->where('website', 'like', "%$website%");
    }

    public function scopeFilterByInstitutionLogo($query, $logo)
    {
        return $query->where('logo', 'like', "%$logo%");
    }

    public function scopeFilterByInstitutionCreatedAt($query, $createdAt)
    {
        return $query->where('created_at', $createdAt);
    }

    public function scopeFilterByInstitutionUpdatedAt($query, $updatedAt)
    {
        return $query->where('updated_at', $updatedAt);
    }
}
