<?php

namespace App\Http\Controllers\api\v1;

use App\Helpers\EnvHelper;
use App\Http\Requests\SocialConfig\UpdateRequest;
use Illuminate\Http\JsonResponse;

class SocialAuthConfigController extends ApiBaseController
{
    // Google related keys
    protected $googleKeys = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_REDIRECT_URI',
    ];

    // Facebook related keys
    protected $facebookKeys = [
        'FACEBOOK_CLIENT_ID',
        'FACEBOOK_CLIENT_SECRET',
        'FACEBOOK_REDIRECT_URI',
    ];

    // Microsoft related keys
    protected $microsoftKeys = [
        'MICROSOFT_CLIENT_ID',
        'MICROSOFT_CLIENT_SECRET',
        'MICROSOFT_REDIRECT_URI',
        'MICROSOFT_TENANT',
    ];

    // Show Google config
    public function showGoogleConfig(): JsonResponse
    {
        return $this->okResponse(['googleKeys' => EnvHelper::getEnvValues($this->googleKeys)], __('Google configuration retrieved successfully'));
    }

    // Show Facebook config
    public function showFacebookConfig(): JsonResponse
    {
        return $this->okResponse(['facebookKeys' => EnvHelper::getEnvValues($this->facebookKeys)], __('Facebook configuration retrieved successfully'));
    }

    // Show Microsoft config
    public function showMicrosoftConfig(): JsonResponse
    {
        return $this->okResponse(['microsoftKeys' => EnvHelper::getEnvValues($this->microsoftKeys)], __('Microsoft configuration retrieved successfully'));
    }

    // Update or create social auth config
    public function updateSocialConfig(UpdateRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
        $provider = $validatedData['provider'];
        $values = $validatedData['values'];

        // Determine which keys to validate based on provider
        $validKeys = $provider === 'google' ? $this->googleKeys : ($provider === 'facebook' ? $this->facebookKeys : ($provider === 'microsoft' ? $this->microsoftKeys : []));

        // Check for invalid keys
        $invalidKeys = array_diff(array_keys($values), $validKeys);

        if (! empty($invalidKeys)) {
            return $this->unprocessableResponse(
                ['invalid_keys' => $invalidKeys],
                __('Invalid configuration keys provided for :provider', ['provider' => $provider])
            );
        }

        // Check if we're adding any new keys
        $newKeys = [];
        foreach ($values as $key => $value) {
            if (! EnvHelper::keyExists($key)) {
                $newKeys[] = $key;
            }
        }

        // Update the ENV file
        $result = EnvHelper::setEnvValues($values);

        if ($result) {
            $responseData = [
                'updated_values' => $values,
                'new_keys_added' => $newKeys,
            ];

            return $this->okResponse(
                ['responseData' => $responseData],
                empty($newKeys)
                    ? __('Configuration updated successfully')
                    : __('New configuration keys added successfully')
            );
        }

        return $this->serverErrorResponse(
            ['error' => 'env_update_failed'],
            __('Failed to update configuration')
        );
    }
}
