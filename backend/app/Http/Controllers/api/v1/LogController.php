<?php

namespace App\Http\Controllers\api\v1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class LogController extends ApiBaseController
{
    /**
     * Get all log files with their complete contents
     */
    public function index(Request $request): JsonResponse
    {
        $logFiles = glob(storage_path('logs/*.log'));
        $logs = [];
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 20);

        foreach ($logFiles as $file) {
            $fileContent = file_get_contents($file);
            $lines = explode("\n", $fileContent);

            // Parse each log entry
            $parsedLogs = [];
            foreach ($lines as $line) {
                if (! empty(trim($line))) {
                    $parsedLogs[] = $this->parseLogLine($line);
                }
            }

            // Paginate the logs for this file
            $logsCollection = new Collection($parsedLogs);
            $paginatedLogs = new LengthAwarePaginator(
                $logsCollection->forPage($page, $perPage),
                $logsCollection->count(),
                $perPage,
                $page,
                ['path' => $request->url()]
            );

            $logs[] = [
                'name' => basename($file),
                'size' => filesize($file),
                'last_modified' => date('Y-m-d H:i:s', filemtime($file)),
                'path' => $file,
                'url' => url('storage/logs/' . basename($file)),
                'created_at' => date('Y-m-d H:i:s', filectime($file)),
                'updated_at' => date('Y-m-d H:i:s', filemtime($file)),
                'log_level' => $paginatedLogs->items() ? $paginatedLogs->items()[0]['level'] : 'info',
                'log_count' => $paginatedLogs->count(),
                'log_date' => $paginatedLogs->items() ? $paginatedLogs->items()[0]['timestamp'] : now()->toDateTimeString(),
                'log_time' => $paginatedLogs->items() ? $paginatedLogs->items()[0]['timestamp'] : now()->toTimeString(),
                'log_context' => $paginatedLogs->items() ? $paginatedLogs->items()[0]['context'] : [],
                'log_raw' => $paginatedLogs->items() ? $paginatedLogs->items()[0]['raw'] : '',
                'logs' => $paginatedLogs->items(),
                'pagination' => [
                    'total' => $paginatedLogs->total(),
                    'per_page' => $paginatedLogs->perPage(),
                    'current_page' => $paginatedLogs->currentPage(),
                    'last_page' => $paginatedLogs->lastPage(),
                ],
            ];
        }

        return $this->okResponse([
            'logs' => $logs,
            'count' => count($logs),
        ], __('Successfully retrieved log files with contents.'));
    }

    /**
     * Parse a single log line into structured data
     */
    private function parseLogLine($line)
    {
        // Standard Laravel log format parsing
        $pattern = '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)$/';

        if (preg_match($pattern, $line, $matches)) {
            return [
                'timestamp' => $matches[1],
                'env' => $matches[2],
                'level' => strtolower($matches[3]),
                'message' => $matches[4],
                'raw' => $line,
                'context' => $this->extractContext($matches[4]),
            ];
        }

        // Fallback for non-standard lines
        return [
            'timestamp' => now()->toDateTimeString(),
            'env' => 'unknown',
            'level' => 'info',
            'message' => $line,
            'raw' => $line,
            'context' => [],
        ];
    }

    /**
     * Extract JSON context from log message if present
     */
    private function extractContext($message)
    {
        // Try to find JSON at the end of the message
        $jsonStart = strrpos($message, '{');

        if ($jsonStart !== false) {
            $jsonString = substr($message, $jsonStart);
            $json = json_decode($jsonString, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                return $this->sanitizeContext($json);
            }
        }

        return [];
    }

    /**
     * Sanitize sensitive data from context
     */
    private function sanitizeContext($context)
    {
        $sensitiveFields = ['password', 'token', 'secret', 'api_key', 'credit_card'];

        foreach ($sensitiveFields as $field) {
            if (isset($context[$field])) {
                $context[$field] = '[REDACTED]';
            }
        }

        return $context;
    }

    /**
     * Get complete logs for a specific file
     */
    public function fileLogs(Request $request, $filename): JsonResponse
    {
        $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'level' => 'sometimes|in:debug,info,notice,warning,error,critical,alert,emergency',
        ]);

        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 20);
        $level = $request->input('level');
        $filePath = storage_path("logs/{$filename}");

        if (! file_exists($filePath)) {
            return $this->notFoundResponse([], __('Log file not found.'));
        }

        $fileContent = file_get_contents($filePath);
        $lines = explode("\n", $fileContent);

        // Parse and filter logs
        $parsedLogs = [];
        foreach ($lines as $line) {
            if (! empty(trim($line))) {
                $logEntry = $this->parseLogLine($line);

                // Filter by level if specified
                if (! $level || $logEntry['level'] === strtolower($level)) {
                    $parsedLogs[] = $logEntry;
                }
            }
        }

        // Reverse to show newest first
        $parsedLogs = array_reverse($parsedLogs);

        // Paginate results
        $logsCollection = new Collection($parsedLogs);
        $paginatedLogs = new LengthAwarePaginator(
            $logsCollection->forPage($page, $perPage),
            $logsCollection->count(),
            $perPage,
            $page,
            ['path' => $request->url()]
        );

        return $this->okResponse([
            'file' => $filename,
            'logs' => $paginatedLogs->items(),
            'pagination' => [
                'total' => $paginatedLogs->total(),
                'per_page' => $paginatedLogs->perPage(),
                'current_page' => $paginatedLogs->currentPage(),
                'last_page' => $paginatedLogs->lastPage(),
            ],
        ], __('Log file contents retrieved successfully.'));
    }

    /**
     * Get logs grouped by day
     */
    public function dailyLogs(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'sometimes|date_format:Y-m-d',
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $date = $request->input('date', date('Y-m-d'));
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 20);
        $filename = "laravel-{$date}.log";
        $filePath = storage_path("logs/{$filename}");

        if (! file_exists($filePath)) {
            return $this->notFoundResponse([], __('Log file not found for the specified date.'));
        }

        return $this->fileLogs($request, $filename);
    }

    /**
     * Get complete logs for a specific channel
     */
    public function channelLogs(Request $request, $channel): JsonResponse
    {
        $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        if (! array_key_exists($channel, config('logging.channels'))) {
            return $this->notFoundResponse([], __('Log channel not found.'));
        }

        $config = config("logging.channels.{$channel}");

        if (! isset($config['path'])) {
            return $this->notFoundResponse([], __('Log channel does not have a path configured.'));
        }

        $filePath = $config['path'];

        if (! file_exists($filePath)) {
            return $this->notFoundResponse([], __('Log file for the specified channel not found.'));
        }

        // Extract filename from path
        $filename = basename($filePath);

        // Temporarily modify request to include the filename
        $request->merge(['filename' => $filename]);

        return $this->fileLogs($request, $filename);
    }

    /**
     * Get list of all log files with metadata (without loading file contents)
     */
    public function listLogFiles(Request $request): JsonResponse
    {
        $logFiles = glob(storage_path('logs/*.log'));
        $files = [];

        foreach ($logFiles as $file) {
            try {
                $size = filesize($file);
                $files[] = [
                    'name' => basename($file),
                    'path' => $file,
                    'size' => $size,
                    'size_human' => $this->formatBytes($size),
                    'last_modified' => date('Y-m-d H:i:s', filemtime($file)),
                    'created_at' => date('Y-m-d H:i:s', filectime($file)),
                    'url' => url('storage/logs/' . basename($file)),
                    'download_url' => route('logs.download', ['filename' => basename($file)]),
                    'is_large' => $size > 50000000, // 50MB
                    'type' => pathinfo($file, PATHINFO_EXTENSION),
                    'entries_estimate' => $this->estimateLogEntries($file),
                    'earliest_entry' => $this->getFirstLogEntryDate($file),
                    'latest_entry' => $this->getLastLogEntryDate($file),
                ];
            } catch (\Exception $e) {
                $files[] = [
                    'name' => basename($file),
                    'error' => 'Could not read file metadata: ' . $e->getMessage(),
                    'path' => $file,
                    'last_modified' => null, // Add default value
                    'size' => 0,
                ];
            }
        }

        // Safe sorting by last_modified
        usort($files, function ($a, $b) {
            $timeA = isset($a['last_modified']) ? strtotime($a['last_modified']) : 0;
            $timeB = isset($b['last_modified']) ? strtotime($b['last_modified']) : 0;

            return $timeB <=> $timeA; // Newest first
        });

        return $this->okResponse([
            'files' => $files,
            'count' => count($files),
            'total_size' => $this->formatBytes(array_sum(array_column($files, 'size'))),
            'stats' => [
                'large_files' => count(array_filter($files, fn ($f) => ($f['is_large'] ?? false))),
                'recently_modified' => count(array_filter($files, function ($f) {
                    if (! isset($f['last_modified'])) {
                        return false;
                    }

                    return strtotime($f['last_modified']) > strtotime('-1 day');
                })),
            ],
        ], __('Log files listed successfully'));
    }

    // Helper to format bytes to human-readable
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    // Estimate number of log entries (without loading full file)
    private function estimateLogEntries($filePath)
    {
        try {
            $file = new \SplFileObject($filePath, 'r');
            $file->seek(PHP_INT_MAX);
            $totalLines = $file->key() + 1;

            return $totalLines > 1 ? $totalLines - 1 : 0; // Subtract header if exists
        } catch (\Exception $e) {
            return null;
        }
    }

    // Get first log entry date (efficient)
    private function getFirstLogEntryDate($filePath)
    {
        try {
            $file = new \SplFileObject($filePath, 'r');
            $firstLine = $file->current();
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $firstLine, $matches)) {
                return $matches[1];
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // Get last log entry date (efficient)
    private function getLastLogEntryDate($filePath)
    {
        try {
            $file = new \SplFileObject($filePath, 'r');
            $file->seek(PHP_INT_MAX);
            $file->seek($file->key() - 1); // Last line
            $lastLine = $file->current();
            if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $lastLine, $matches)) {
                return $matches[1];
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function download($filename): JsonResponse
    {
        $filePath = storage_path('logs/' . $filename);

        if (! file_exists($filePath)) {
            return $this->notFoundResponse([], __('Log file not found.'));
        }

        return $this->okResponse([
            'file' => $filename,
            'url' => url('storage/logs/' . $filename),
        ], __('Log file ready for download.'))
            ->header('Content-Disposition', 'attachment; filename="' . basename($filePath) . '"')
            ->header('Content-Type', 'application/octet-stream')
            ->setContent(file_get_contents($filePath));
    }

    /**
     * Get logs from the most recently modified log file
     */
    public function latestLogs(Request $request): JsonResponse
    {
        // Get all log files with their modification times
        $logFiles = array_filter(glob(storage_path('logs/*.log')), 'is_file');

        if (empty($logFiles)) {
            return $this->notFoundResponse([], __('No log files found.'));
        }

        // Sort files by modification time (newest first)
        usort($logFiles, function ($a, $b) {
            return filemtime($b) <=> filemtime($a);
        });

        $latestFile = $logFiles[0];
        $filename = basename($latestFile);
        $fileSize = filesize($latestFile);

        // Prepare response structure
        $response = [
            'file' => $filename,
            'path' => $latestFile,
            'size' => $fileSize,
            'size_human' => $this->formatBytes($fileSize),
            'last_modified' => date('Y-m-d H:i:s', filemtime($latestFile)),
            'is_large' => $fileSize > 50000000, // 50MB
            'warning' => null,
            'logs' => [],
            'log_count' => 0,
            'download_url' => url('api/v1/logs/download/' . $filename),
        ];

        // For large files, just return metadata
        if ($response['is_large']) {
            $response['warning'] = 'File too large to display contents - download recommended';

            return $this->okResponse($response, __('Latest log file info retrieved.'));
        }

        // Get pagination parameters
        $page = $request->input('page', 1);
        $perPage = min($request->input('per_page', 50), 200); // Max 200 per page

        // Read and parse the entire file (for small files)
        $file = new \SplFileObject($latestFile, 'r');
        $parsedLogs = [];

        while (! $file->eof()) {
            $line = $file->fgets();
            if (! empty(trim($line))) {
                $parsedLogs[] = $this->parseLogLine($line);
            }
        }

        // Reverse to get newest first
        $parsedLogs = array_reverse($parsedLogs);

        // Paginate results
        $logsCollection = new Collection($parsedLogs);
        $paginatedLogs = new LengthAwarePaginator(
            $logsCollection->forPage($page, $perPage),
            $logsCollection->count(),
            $perPage,
            $page,
            ['path' => $request->url()]
        );

        // Add logs to response
        $response['logs'] = $paginatedLogs->items();
        $response['log_count'] = $paginatedLogs->total();
        $response['pagination'] = [
            'total' => $paginatedLogs->total(),
            'per_page' => $paginatedLogs->perPage(),
            'current_page' => $paginatedLogs->currentPage(),
            'last_page' => $paginatedLogs->lastPage(),
        ];

        // Add time range if we have logs
        if (! empty($parsedLogs)) {
            $response['time_range'] = [
                'oldest' => end($parsedLogs)['timestamp'],
                'newest' => $parsedLogs[0]['timestamp'],
            ];
        }

        return $this->okResponse($response, __('Latest logs retrieved successfully.'));
    }

    /**
     * Efficiently read last N lines from a file
     */
    private function readLastLines($filePath, $lines = 100)
    {
        $file = new \SplFileObject($filePath, 'r');
        $file->seek(PHP_INT_MAX);
        $lastLine = $file->key();

        $start = max(0, $lastLine - $lines);
        $file->seek($start);

        $content = [];
        while ($file->key() < $lastLine && ! $file->eof()) {
            $line = $file->current();
            if (trim($line)) {
                $content[] = $line;
            }
            $file->next();
        }

        return array_reverse($content); // Newest first
    }
}
