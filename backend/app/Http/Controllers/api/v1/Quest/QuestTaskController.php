<?php

namespace App\Http\Controllers\api\v1\Quest;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Quest\QuestTask\UpdateMultipleRequest;
use App\Http\Requests\Quest\QuestTask\StoreMultipleRequest;
use App\Http\Requests\Quest\QuestTask\StoreRequest;
use App\Http\Requests\Quest\QuestTask\UpdateRequest;
use App\Models\Quest\QuestTask;
use App\Models\Quest\BankTask as QuestBankTask;
use App\Models\Quest\QuestTaskDependency;
use App\Http\Requests\Quest\QuestTask\CloneToBankRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuestTaskController extends ApiBaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Logic to retrieve and return a list of quest tasks
        $questTasks = QuestTask::query();

        if ($request->has('quest_id')) {
            $questTasks->questId($request->quest_id);
        }

        if ($request->has('search')) {
            $questTasks->search($request->search);
        }

        if ($request->has('sort_by')) {
            $questTasks->sortBy($request->sort_by, $request->get('sort_order', 'asc'));
        } else {
            $questTasks->sortBy('created_at', 'desc');
        }

        $questTasks = $questTasks->paginate($request->get('per_page', 10));

        return $this->okResponse(['questTasks' => $questTasks], __('Quest tasks retrieved successfully'));
    }

    /**
     * List my bank tasks, optionally filtered by category.
     */
    public function my(Request $request): JsonResponse
    {
        $query = QuestBankTask::query()
            ->where('owner_id', auth()->id())
            ->with(['category']);

        if ($request->filled('q_bank_category_id')) {
            $query->where('q_bank_category_id', $request->integer('q_bank_category_id'));
        }
        if ($request->filled('visibility')) {
            $query->where('visibility', $request->input('visibility'));
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $items = $query->orderByDesc('id')->paginate($perPage);

        return $this->okResponse(['questTasks' => $items], __('My bank tasks retrieved successfully'));
    }

    /**
     * Public bank: list all public quest bank tasks across users.
     */
    public function publicBank(Request $request): JsonResponse
    {
        $query = QuestBankTask::query()
            ->where('visibility', 'public')
            ->with(['category', 'owner']);

        if ($request->filled('q_bank_category_id')) {
            $query->where('q_bank_category_id', $request->integer('q_bank_category_id'));
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $items = $query->orderByDesc('id')->paginate($perPage);

        return $this->okResponse(['questTasks' => $items], __('Public bank tasks retrieved successfully'));
    }

    /**
     * Get a specific quest task by ID.
     */
    public function show($id): JsonResponse
    {
        // Logic to retrieve a specific quest task by ID
        $questTask = QuestTask::find($id);

        if (! $questTask) {
            return $this->notFoundResponse([], __('Quest task not found'));
        }

        return $this->okResponse(['questTask' => $questTask], __('Quest task retrieved successfully'));
    }

    /**
     * Store a new quest task.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validated();

            // Assign owner
            $validated['owner_id'] = auth()->id();
            if (empty($validated['q_bank_category_id'])) {
                $rootCategory = \App\Models\Quest\QuestTaskBankCategory::firstOrCreate(
                    [
                        'name' => 'My Task Bank',
                        'created_by' => auth()->id(),
                        'parent_category_id' => null,
                    ],
                    [
                        'description' => null,
                        'is_parent' => true,
                    ]
                );
                $validated['q_bank_category_id'] = $rootCategory->id;
            }

            // Extract prerequisite_task_id if it exists
            $prerequisiteTaskId = $validated['prerequisite_task_id'] ?? null;
            unset($validated['prerequisite_task_id']);

            // Create the task
            $questTask = QuestTask::create($validated);

            // If there's a prerequisite, create the dependency
            if ($prerequisiteTaskId) {
                QuestTaskDependency::create([
                    'task_id' => $questTask->id,
                    'prerequisite_task_id' => $prerequisiteTaskId,
                ]);
            }

            DB::commit();

            return $this->createdResponse(
                ['questTask' => $questTask->load('prerequisites')],
                __('Quest task created successfully')
            );
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create quest task', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return $this->serverErrorResponse([], __('Failed to create quest task'));
        }
    }

    /**
     * Store multiple quest tasks.
     */
    public function storeMultiple(StoreMultipleRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $createdTasks = [];
            $taskDependencies = [];

            foreach ($request->input('tasks') as $taskData) {
                $taskData['owner_id'] = auth()->id();
                if (empty($taskData['q_bank_category_id'])) {
                    $rootCategory = \App\Models\Quest\QuestTaskBankCategory::firstOrCreate(
                        [
                            'name' => 'My Task Bank',
                            'created_by' => auth()->id(),
                            'parent_category_id' => null,
                        ],
                        [
                            'description' => null,
                            'is_parent' => true,
                        ]
                    );
                    $taskData['q_bank_category_id'] = $rootCategory->id;
                }
                // Extract prerequisite_task_id if it exists
                $prerequisiteTaskId = $taskData['prerequisite_task_id'] ?? null;
                unset($taskData['prerequisite_task_id']);

                // Create the task
                $task = QuestTask::create($taskData);
                $createdTasks[] = $task;

                // Store dependency if exists (we'll create these after all tasks are created)
                if ($prerequisiteTaskId) {
                    $taskDependencies[] = [
                        'task_id' => $task->id,
                        'prerequisite_task_id' => $prerequisiteTaskId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // Create all dependencies at once
            if (! empty($taskDependencies)) {
                QuestTaskDependency::insert($taskDependencies);
            }

            DB::commit();

            // Reload tasks with their prerequisites
            $taskIds = collect($createdTasks)->pluck('id')->toArray();
            $tasksWithDependencies = QuestTask::with('prerequisites')->whereIn('id', $taskIds)->get();

            return $this->createdResponse(
                ['tasks' => $tasksWithDependencies],
                __('Quest tasks created successfully')
            );
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quest task creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return $this->serverErrorResponse([], __('Failed to create quest tasks'));
        }
    }

    /**
     * Update an existing quest task.
     */
    public function update($id, UpdateRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $questTask = QuestTask::find($id);

            if (! $questTask) {
                return $this->notFoundResponse([], __('Quest task not found'));
            }

            $validated = $request->validated();

            // Extract prerequisite_task_id if it exists
            $prerequisiteTaskId = $validated['prerequisite_task_id'] ?? null;
            unset($validated['prerequisite_task_id']);

            // Quest-attached tasks are immutable
            if (! is_null($questTask->quest_id)) {
                return $this->forbiddenResponse([], __('Quest tasks are immutable. Edit a bank copy instead.'));
            }

            // Update the task
            $questTask->update($validated);

            // Handle prerequisite task
            if (! is_null($prerequisiteTaskId)) {
                // Check for circular dependency
                if ($this->wouldCreateCircularDependency($questTask->id, $prerequisiteTaskId)) {
                    return $this->badRequestResponse([], __('This dependency would create a circular reference'));
                }

                // Update or create the dependency
                QuestTaskDependency::updateOrCreate(
                    ['task_id' => $questTask->id],
                    ['prerequisite_task_id' => $prerequisiteTaskId]
                );
            } else {
                // Remove existing dependency if prerequisite_task_id is null
                QuestTaskDependency::where('task_id', $questTask->id)->delete();
            }

            DB::commit();

            return $this->okResponse(
                ['questTask' => $questTask->fresh()->load('prerequisites')],
                __('Quest task updated successfully')
            );
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update quest task', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return $this->serverErrorResponse([], __('Failed to update quest task'));
        }
    }

    /**
     * Update multiple quest tasks.
     */
    public function updateMultiple(UpdateMultipleRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $updatedTasks = [];
            $taskDependencies = [];
            $tasksToRemoveDependencies = [];
            $missingTaskIds = [];

            foreach ($request->input('tasks') as $taskData) {
                $task = QuestTask::find($taskData['id']);

                if (! $task) {
                    $missingTaskIds[] = $taskData['id'];

                    continue;
                }

                // Extract prerequisite_task_id if it exists
                $prerequisiteTaskId = $taskData['prerequisite_task_id'] ?? null;
                unset($taskData['prerequisite_task_id']);

                // Update the task
                $task->update($taskData);
                $updatedTasks[] = $task;

                // Handle dependencies
                if (! is_null($prerequisiteTaskId)) {
                    // Check for circular dependency
                    if ($this->wouldCreateCircularDependency($task->id, $prerequisiteTaskId)) {
                        throw new \Exception("Circular dependency detected for task {$task->id}");
                    }

                    $taskDependencies[] = [
                        'task_id' => $task->id,
                        'prerequisite_task_id' => $prerequisiteTaskId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                } else {
                    $tasksToRemoveDependencies[] = $task->id;
                }
            }

            // Return error if any tasks weren't found
            if (! empty($missingTaskIds)) {
                return $this->notFoundResponse(
                    ['missing_task_ids' => $missingTaskIds],
                    __('Some tasks were not found')
                );
            }

            // Remove dependencies for tasks that no longer have prerequisites
            if (! empty($tasksToRemoveDependencies)) {
                QuestTaskDependency::whereIn('task_id', $tasksToRemoveDependencies)->delete();
            }

            // Update or create all dependencies
            if (! empty($taskDependencies)) {
                foreach ($taskDependencies as $dependency) {
                    QuestTaskDependency::updateOrCreate(
                        ['task_id' => $dependency['task_id']],
                        [
                            'prerequisite_task_id' => $dependency['prerequisite_task_id'],
                            'updated_at' => $dependency['updated_at'],
                        ]
                    );
                }
            }

            DB::commit();

            // Reload tasks with their prerequisites
            $taskIds = collect($updatedTasks)->pluck('id')->toArray();
            $tasksWithDependencies = QuestTask::with('prerequisites')->whereIn('id', $taskIds)->get();

            return $this->okResponse(
                ['tasks' => $tasksWithDependencies],
                __('Quest tasks updated successfully')
            );
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update quest tasks', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->serverErrorResponse(
                ['error' => $e->getMessage()],
                __('Failed to update quest tasks')
            );
        }
    }

    /**
     * Remove a quest task.
     */
    public function destroy($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $questTask = QuestTask::find($id);

            if (! $questTask) {
                return $this->notFoundResponse([], __('Quest task not found'));
            }

            $questTask->delete();

            DB::commit();

            return $this->okResponse([], __('Quest task deleted successfully'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete quest task', [
                'error' => $e->getMessage(),
                'request' => request()->all(),
            ]);

            // Return an error response
            return $this->serverErrorResponse([], __('Failed to delete quest task'));
        }
    }

    /**
     * Remove multiple quest tasks.
     */
    public function destroyMultiple(Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return $this->badRequestResponse([], __('No quest task IDs provided'));
            }

            $tasks = QuestTask::whereIn('id', $ids)->get();

            QuestTask::whereIn('id', $ids)->delete();

            DB::commit();

            return $this->okResponse([], __('Quest tasks deleted successfully'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete quest tasks', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            // Return an error response
            return $this->serverErrorResponse([], __('Failed to delete quest tasks'));
        }
    }

    /**
     * Restore a deleted quest task.
     */
    public function restore($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $questTask = QuestTask::withTrashed()->find($id);

            if (! $questTask) {
                return $this->notFoundResponse([], __('Quest task not found'));
            }

            if (! is_null($questTask->quest_id)) {
                return $this->forbiddenResponse([], __('Quest tasks cannot be restored once deleted.'));
            }
            $questTask->restore();

            DB::commit();

            return $this->okResponse(['questTask' => $questTask], __('Quest task restored successfully'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to restore quest task', [
                'error' => $e->getMessage(),
                'request' => request()->all(),
            ]);

            // Return an error response
            return $this->serverErrorResponse([], __('Failed to restore quest task'));
        }
    }

    /**
     * Restore multiple deleted quest tasks.
     */
    public function restoreMultiple(Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return $this->badRequestResponse([], __('No quest task IDs provided'));
            }

            $questTasks = QuestTask::withTrashed()->whereIn('id', $ids)->get();

            if ($questTasks->isEmpty()) {
                return $this->notFoundResponse([], __('No quest tasks found for restoration'));
            }

            foreach ($questTasks as $questTask) {
                if (! is_null($questTask->quest_id)) {
                    DB::rollBack();

                    return $this->forbiddenResponse([], __('One or more quest tasks cannot be restored.'));
                }
                $questTask->restore();
            }

            DB::commit();

            return $this->okResponse(['questTasks' => $questTasks], __('Quest tasks restored successfully'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to restore quest tasks', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            // Return an error response
            return $this->serverErrorResponse([], __('Failed to restore quest tasks'));
        }
    }

    /**
     * Clone a public quest task into the authenticated user's bank/category.
     */
    public function cloneToMyBank(CloneToBankRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $source = QuestTask::find($data['task_id']);

            if (! $source || ($source->visibility ?? 'private') !== 'public') {
                return $this->forbiddenResponse([], __('Only public tasks can be cloned.'));
            }

            $categoryId = $data['q_bank_category_id'] ?? null;
            if (! $categoryId) {
                $rootCategory = \App\Models\Quest\QuestTaskBankCategory::firstOrCreate(
                    [
                        'name' => 'My Task Bank',
                        'created_by' => auth()->id(),
                        'parent_category_id' => null,
                    ],
                    [
                        'description' => null,
                        'is_parent' => true,
                    ]
                );
                $categoryId = $rootCategory->id;
            }

            $clone = \App\Models\Quest\BankTask::create([
                'q_bank_category_id' => $categoryId,
                'owner_id' => auth()->id(),
                'title' => $source->title,
                'description' => $source->description,
                'task_type' => $source->task_type,
                'task_data' => $source->task_data,
                'is_required' => $source->is_required,
                'visibility' => 'private',
            ]);

            DB::commit();

            return $this->createdResponse(['task' => $clone], __('Task cloned to your bank.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error cloning task: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to clone task.'));
        }
    }

    /**
     * Copy a quest task into the authenticated user's bank.
     */
    public function addToBank(\App\Http\Requests\Quest\QuestTask\CopyToBankRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $source = QuestTask::find($id);
            if (! $source) {
                return $this->notFoundResponse([], __('Quest task not found.'));
            }

            $data = $request->validated();
            $categoryId = $data['q_bank_category_id'] ?? null;
            if (! $categoryId) {
                $rootCategory = \App\Models\Quest\QuestTaskBankCategory::firstOrCreate(
                    [
                        'name' => 'My Task Bank',
                        'created_by' => auth()->id(),
                        'parent_category_id' => null,
                    ],
                    [
                        'description' => null,
                        'is_parent' => true,
                    ]
                );
                $categoryId = $rootCategory->id;
            }

            $bank = \App\Models\Quest\BankTask::create([
                'q_bank_category_id' => $categoryId,
                'owner_id' => auth()->id(),
                'title' => $source->title,
                'description' => $source->description,
                'task_type' => $source->task_type,
                'task_data' => $source->task_data,
                'is_required' => $source->is_required,
                'visibility' => 'private',
            ]);

            DB::commit();

            return $this->createdResponse(['task' => $bank], __('Task copied to your bank.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error copying quest task to bank: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to copy task to bank.'));
        }
    }

    /**
     * Force delete a quest task.
     */
    public function getPrerequisites($id): JsonResponse
    {
        try {
            $task = QuestTask::with('prerequisites')->find($id);

            if (! $task) {
                return $this->notFoundResponse([], __('Quest task not found'));
            }

            return $this->okResponse(
                ['prerequisites' => $task],
                __('Task prerequisites retrieved successfully')
            );
        } catch (\Exception $e) {
            Log::error('Error getting task prerequisites: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to retrieve task prerequisites'));
        }
    }

    /**
     * Check if adding this dependency would create a circular reference
     */
    protected function wouldCreateCircularDependency($taskId, $prerequisiteId): bool
    {
        // A task cannot depend on itself
        if ($prerequisiteId == $taskId) {
            return true;
        }

        // Get all tasks that the prerequisite depends on
        $prerequisiteDependencies = QuestTaskDependency::where('task_id', $prerequisiteId)
            ->pluck('prerequisite_task_id')
            ->toArray();

        // Check if any of those dependencies include our original task
        if (in_array($taskId, $prerequisiteDependencies)) {
            return true;
        }

        // Recursively check deeper dependencies
        foreach ($prerequisiteDependencies as $depId) {
            if ($this->wouldCreateCircularDependency($taskId, $depId)) {
                return true;
            }
        }

        return false;
    }
}
