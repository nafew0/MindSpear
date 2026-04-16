<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponseTrait
{
    /**
     * Prepare response.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The data to be returned in the response.
     * @param  int  $statusCode  The HTTP status code for the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The formatted JSON response.
     */
    public function response(array $data = [], int $statusCode = Response::HTTP_OK, string $message = '', bool $successStatus = false): JsonResponse
    {
        if (empty($message)) {
            $message = Response::$statusTexts[$statusCode];
        }

        // Check if data is empty and convert it to an object if so
        if (empty($data)) {
            $data = (object) $data; // Convert the empty array to an empty object
        }

        return response()->json([
            'status' => $successStatus,
            // 'code' => $statusCode,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Success Response
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The data to be returned in the response.
     * @param  int  $statusCode  The HTTP status code for the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The formatted JSON success response.
     */
    public function successResponse(array $data = [], int $statusCode = Response::HTTP_OK, string $message = ''): JsonResponse
    {
        return $this->response($data, $statusCode, $message, $successStatus = true);
    }

    /**
     * Error Response
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $errors  The error details to be returned in the response.
     * @param  int  $statusCode  The HTTP status code for the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The formatted JSON error response.
     */
    public function errorResponse(array $errors = [], int $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR, string $message = ''): JsonResponse
    {
        return $this->response($errors, $statusCode, $message, $successStatus = false);
    }

    /**
     * Response with status code 200.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The data to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 200 (OK).
     */
    public function okResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->successResponse($data, Response::HTTP_OK, $message);
    }

    /**
     * Response with status code 201.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The data to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 201 (Created).
     */
    public function createdResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->successResponse($data, Response::HTTP_CREATED, $message);
    }

    /**
     * Response with status code 400.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 400 (Bad Request).
     */
    public function badRequestResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_BAD_REQUEST, $message);
    }

    /**
     * Response with status code 401.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 401 (Unauthorized).
     */
    public function unauthorizedResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_UNAUTHORIZED, $message);
    }

    /**
     * Response with status code 403.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 403 (Forbidden).
     */
    public function forbiddenResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_FORBIDDEN, $message);
    }

    /**
     * Response with status code 404.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 404 (Not Found).
     */
    public function notFoundResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_NOT_FOUND, $message);
    }

    /**
     * Response with status code 409.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 409 (Conflict).
     */
    public function conflictResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_CONFLICT, $message);
    }

    /**
     * Response with status code 422.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 422 (Unprocessable Entity).
     */
    public function unprocessableResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_UNPROCESSABLE_ENTITY, $message);
    }

    /**
     * Response with status code 405.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 405 (Method Not Allowed).
     */
    public function methodNotAllowedResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_METHOD_NOT_ALLOWED, $message);
    }

    /**
     * Response with status code 500.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 500 (Internal Server Error).
     */
    public function serverErrorResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_INTERNAL_SERVER_ERROR, $message);
    }

    /**
     * Response with status code 503.
     *
     * Created by Md. Rakibur Rahman Rimon.
     *
     * @param  array  $data  The error details to be returned in the response.
     * @param  string  $message  The message to be included in the response.
     * @return JsonResponse The JSON response with status code 503 (Service Unavailable).
     */
    public function serviceUnavailableResponse(array $data = [], string $message = ''): JsonResponse
    {
        return $this->errorResponse($data, Response::HTTP_SERVICE_UNAVAILABLE, $message);
    }
}
