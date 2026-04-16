<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Requests\Institution\StoreRequest;
use App\Http\Requests\Institution\UpdateRequest;
use App\Models\Institution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstitutionController extends ApiBaseController
{
    /**
     * Display a listing of the institutions.
     */
    public function index(Request $request): JsonResponse
    {
        $institutions = Institution::query();

        // Apply filters if any
        if ($request->has('status')) {
            $institutions->filterByStatus($request->status);
        }

        if ($request->has('type')) {
            $institutions->filterByType($request->type);
        }

        if ($request->has('search')) {
            $institutions->search($request->search);
        }

        if ($request->has('name')) {
            $institutions->filterByInstitutionName($request->name);
        }

        if ($request->has('address')) {
            $institutions->filterByInstitutionAddress($request->address);
        }

        if ($request->has('city')) {
            $institutions->filterByInstitutionCity($request->city);
        }

        if ($request->has('state')) {
            $institutions->filterByInstitutionState($request->state);
        }

        if ($request->has('country')) {
            $institutions->filterByInstitutionCountry($request->country);
        }

        if ($request->has('postal_code')) {
            $institutions->filterByInstitutionPostalCode($request->postal_code);
        }

        if ($request->has('phone')) {
            $institutions->filterByInstitutionPhone($request->phone);
        }

        if ($request->has('email')) {
            $institutions->filterByInstitutionEmail($request->email);
        }

        if ($request->has('website')) {
            $institutions->filterByInstitutionWebsite($request->website);
        }

        if ($request->has('created_by')) {
            $institutions->filterByCreatedBy($request->created_by);
        }

        if ($request->has('updated_by')) {
            $institutions->filterByUpdatedBy($request->updated_by);
        }

        if ($request->has('deleted')) {
            if ($request->deleted === 'true') {
                $institutions->softDeleted();
            } else {
                $institutions->notSoftDeleted();
            }
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $institutions->filterByDateRange($request->start_date, $request->end_date);
        }

        // Pagination
        $perPage = $request->has('per_page') ? (int) $request->per_page : 15;
        $institutions = $institutions->paginate($perPage);

        return $this->okResponse(['institutions' => $institutions], __('Institutions fetched successfully.'));
    }

    /**
     * Store a newly created institution in storage.
     *
     * @param  Request  $request
     */
    public function store(StoreRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $uploadedFile = $request->file('logo');

        // Use the trait method to upload file
        if ($uploadedFile) {
            $filePath = $this->uploadFile($uploadedFile, 'institutions');
            $validated['logo'] = $filePath;
        }

        // Create a new institution
        $institution = Institution::create($validated);

        // Return the created institution
        return $this->createdResponse(['institution' => $institution], __('Institution created successfully.'));
    }

    /**
     * Display the specified institution.
     */
    public function show($id): JsonResponse
    {
        // Find the institution by ID
        $institution = Institution::find($id);

        // Check if the institution exists
        if (! $institution) {
            return $this->notFoundResponse([], __('Institution not found.'));
        }

        // Return the institution
        return $this->okResponse(['institution' => $institution], __('Institution fetched successfully.'));
    }

    /**
     * Update the specified institution in storage.
     */
    public function update(UpdateRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        // Find the institution by ID
        $institution = Institution::find($id);

        // Check if the institution exists
        if (! $institution) {
            return $this->notFoundResponse([], __('Institution not found.'));
        }

        // Handle file upload if a new logo is provided
        $uploadedFile = $request->file('logo');

        if ($uploadedFile) {
            // Use the trait method to upload file
            $filePath = $this->uploadFile($uploadedFile, 'institutions');
            $validated['logo'] = $filePath;
        }

        // Update the institution
        $institution->update($validated);

        // Return the updated institution
        return $this->okResponse(['institution' => $institution], __('Institution updated successfully.'));
    }

    /**
     * Remove the specified institution from storage.
     */
    public function destroy($id): JsonResponse
    {
        // Find the institution by ID
        $institution = Institution::find($id);

        // Check if the institution exists
        if (! $institution) {
            return $this->notFoundResponse([], __('Institution not found.'));
        }

        $filePath = $institution->getRawOriginal('logo');

        // Check if the file exists and remove
        if ($filePath && $this->checkExistsFile($filePath)) {
            $this->removeFile($filePath);
        }

        // Soft delete the institution
        $institution->delete();

        // Return a success response
        return $this->okResponse([], __('Institution deleted successfully.'));
    }
}
