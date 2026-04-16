# Quest Socket Documentation

## Overview

The `quest-socket.ts` file provides a comprehensive WebSocket client implementation for the Quest application using Socket.IO. It handles real-time communication between clients and the server for interactive quest gameplay, including joining, creating, starting, and completing quests, as well as submitting answers and managing leaderboards.

## Environment Configuration

The socket connection is configured using environment variables:

- `NEXT_PUBLIC_SOCKET_URL`: The base URL for the socket server (defaults to "https://quest.bdren.net.bd")
- `NEXT_PUBLIC_SOCKET_PATH`: The socket path (defaults to "/socket.io")

## Core Connection Management

### `connectSocket()`

Establishes a connection to the Socket.IO server with the following features:
- Automatic reconnection with exponential backoff
- Session persistence using localStorage
- Authentication with user credentials
- Event listeners for focus/online events to maintain connection

### `disconnectSocket()`

Disconnects the socket and cleans up resources.

### `getSocket()`

Returns the current socket instance.

## Quest Session Management

The module maintains quest session state using the `QuestSession` type:

```typescript
type QuestSession = {
  questId: any;
  userId: string;
  questTitle?: string;
  userName?: string;
  isCreator?: boolean; // true => will emit startQuest; false => joinQuest
};
```

### `setCurrentQuest(session)`

Sets the current quest session and persists it to localStorage.

## Socket Events

### Quest Creation and Management

#### `emitCreateQuest(params)`
- **Purpose**: Creates a new quest (host only)
- **Parameters**:
  - `questId`: Unique identifier for the quest
  - `userId`: ID of the user creating the quest
  - `questTitle`: Title of the quest
  - `userName`: Name of the user creating the quest
  - `scoringParams`: Optional scoring parameters

#### `waitForQuestCreatedOnce()`
- **Purpose**: Waits for a single "questCreated" confirmation event

### Quest Joining

#### `emitJoinQuest(params)`
- **Purpose**: Joins an existing quest (participant only)
- **Parameters**:
  - `questId`: ID of the quest to join
  - `userId`: ID of the user joining
  - `userName`: Name of the user joining
  - `questTitle`: Title of the quest (optional)

#### `waitForQuestJoinedOnce()`
- **Purpose**: Waits for a single "questJoined" confirmation event

#### `waitForQuestJoinedOnce22(questId, timeoutMs)`
- **Purpose**: Enhanced version with caching and timeout
- **Parameters**:
  - `questId`: Specific quest ID to wait for
  - `timeoutMs`: Timeout in milliseconds (default: 15000)

### Quest Starting

#### `emitStartQuest(params)`
- **Purpose**: Starts a quest (host only)
- **Parameters**:
  - `questId`: ID of the quest to start
  - `userId`: ID of the user starting the quest
  - `userName`: Name of the user starting the quest
  - `questTitle`: Title of the quest (optional)

#### `waitForQuestStartedOnce()`
- **Purpose**: Waits for a single "questStarted" confirmation event

#### `waitForQuestStartedAll(callback)`
- **Purpose**: Listens for "questStartedAll" broadcast to all participants

### Answer Submission

#### `emitSubmitTask(params)`
- **Purpose**: Submits an answer to a question
- **Parameters**:
  - `userId`: ID of the user submitting
  - `questionId`: ID of the question
  - `userName`: Name of the user
  - `questionTitle`: Title of the question
  - `questionType`: Type of the question
  - `selectedOption`: The selected answer option
  - `optionType`: Type of the option

#### `emitsubmitTaskWithRanking(params)`
- **Purpose**: Submits a task with ranking data
- **Parameters**: Same as `emitSubmitTask`

#### `emitRankShortAndScaleSubmitTask(params)`
- **Purpose**: Submits ranking, short answer, and scale type tasks
- **Parameters**: Same as `emitSubmitTask`

### Answer Processing

#### `waitForAnswerProcessedQuestOnce()`
- **Purpose**: Waits for answer processing confirmation

#### `waitForRankingScoresAnswerProcessedQuestOnce()`
- **Purpose**: Waits for ranking scores processing confirmation

#### `answerSubmittedToQuestCreator(callback)`
- **Purpose**: Listens for aggregated answers submitted to the quest creator

### Quest Completion

#### `emitCompleteQuest(params)`
- **Purpose**: Completes a quest (participant only)
- **Parameters**:
  - `questId`: ID of the quest to complete
  - `userId`: ID of the user completing
  - `questTitle`: Title of the quest (optional)
  - `userName`: Name of the user (optional)

#### `waitForQuestCompletedOnce()`
- **Purpose**: Waits for a single "questCompleted" confirmation event

#### `waitForQuestCompletedAll(callback)`
- **Purpose**: Listens for "questCompletedAll" broadcast to all participants

### Quest Leaving and Abandoning

#### `emitLeaveQuest(params)`
- **Purpose**: Leaves a quest (participant only)
- **Parameters**:
  - `questId`: ID of the quest to leave
  - `userId`: ID of the user leaving
  - `questTitle`: Title of the quest (optional)
  - `userName`: Name of the user (optional)

#### `emitAbandonQuest(params)`
- **Purpose**: Abandons a quest (participant only)
- **Parameters**: Same as `emitLeaveQuest`

#### `waitForParticipantLeftQuestOnce()`
- **Purpose**: Waits for a single "participantLeftQuest" confirmation event

#### `waitForParticipantLeftQuestAll(callback)`
- **Purpose**: Listens for "participantLeftQuestAll" broadcast

#### `waitForParticipantAbandonedQuestOnce()`
- **Purpose**: Waits for a single "participantAbandonedQuest" confirmation event

#### `waitForParticipantAbandonedQuestAll(callback)`
- **Purpose**: Listens for "participantAbandonedQuestAll" broadcast

### Leaderboard Management

#### `emitQuestLeaderboard(params)`
- **Purpose**: Updates the quest leaderboard (host only)
- **Parameters**:
  - `questId`: ID of the quest
  - `userId`: ID of the user
  - `questTitle`: Title of the quest (optional)
  - `userName`: Name of the user (optional)
  - `leaderboardData`: Leaderboard data to update

#### `waitForLeaderboardUpdatedQuestAll(callback)`
- **Purpose**: Listens for "leaderboardUpdatedQuestAll" broadcast

### Question Management

#### `emitChangeQuestionQuest(params)`
- **Purpose**: Changes the current question (host only)
- **Parameters**:
  - `questId`: ID of the quest
  - `questionId`: ID of the new question
  - `questTitle`: Title of the quest
  - `questionTitle`: Title of the new question
  - `questiQsenStartTime`: Start time for the question
  - `questiQsenTime`: Duration of the question
  - `questiQsenLateStartTime`: Late start time (optional)

#### `waitForQuestionChangedQuestAll(callback)`
- **Purpose**: Listens for "questionChangedQuestAll" broadcast to all participants

#### `waitForQuestionChangedQuestAllDataGet()`
- **Purpose**: Waits for a single "questionChangedQuestAll" event with data

#### `waitForQuestionChangedQuestSingle()`
- **Purpose**: Waits for a single "questionChangedQuest" event for a specific participant

### Quest Ending

#### `emitEndQuest(params)`
- **Purpose**: Ends a quest (host only)
- **Parameters**:
  - `questId`: ID of the quest to end
  - `questTitle`: Title of the quest (optional)

#### `waitForQuestEndedAll(callback)`
- **Purpose**: Listens for "questEndedAll" broadcast to all participants

### Additional Features

#### `submitAnswer(params)`
- **Purpose**: Submits an answer to a question
- **Parameters**:
  - `userid`: User ID
  - `questionId`: Question ID
  - `userName`: User name
  - `questionTitle`: Question title
  - `questionType`: Question type
  - `selectedOption`: Selected answer option
  - `option`: Option details

#### `emitLeaveQuiz(data)`
- **Purpose**: Leaves a quiz session
- **Parameters**:
  - `quizId`: ID of the quiz
  - `userId`: ID of the user leaving
  - `quizTitle`: Title of the quiz
  - `userName`: Name of the user

#### `waitForParticipantLeft(callback)`
- **Purpose**: Listens for "participantLeft" events

#### `emitsubmitTaskForQuickForm(params)`
- **Purpose**: Submits a task for quick form questions
- **Parameters**:
  - `userId`: User ID
  - `questionId`: Question ID
  - `userName`: User name
  - `questionTitle`: Question title
  - `questionType`: Question type
  - `quickFormData`: Form data
  - `optionType`: Type of the option

#### `waitAnswerSubmittedToQuestCreatorQuickForm(callback)`
- **Purpose**: Listens for quick form answers submitted to the quest creator

## Local Storage Caching

The module implements caching for quest join events using localStorage:

- `cacheJoin(questId, payload)`: Caches join data for a specific quest
- `getCachedJoin(questId)`: Retrieves cached join data for a specific quest
- `clearCachedJoin(questId)`: Clears cached join data for a specific quest

## Connection Resilience

The socket implementation includes several features to maintain connection stability:

- Automatic reconnection with exponential backoff (500ms to 15,000ms)
- Reconnection attempts set to infinity
- Connection timeout of 10 seconds
- Event listeners for online and visibility change events to reconnect when the tab becomes visible or network returns
- Auto-rejoin functionality on reconnects to maintain quest session state

## Error Handling

The module includes error handling for:
- Connection errors with cleanup of pending connections
- Disconnection and reconnection scenarios
- Timeout handling for waiting functions
- LocalStorage access errors (graceful degradation)

## Usage Examples

### Creating a Quest
```typescript
await emitCreateQuest({
  questId: "123",
  userId: "user123",
  questTitle: "Sample Quest",
  userName: "John Doe",
  scoringParams: { /* optional scoring params */ }
});

const result = await waitForQuestCreatedOnce();
```

### Joining a Quest
```typescript
await emitJoinQuest({
  questId: "123",
  userId: "user456",
  userName: "Jane Doe"
});

const result = await waitForQuestJoinedOnce();
```

### Submitting an Answer
```typescript
await emitSubmitTask({
  userId: "user456",
  questionId: "q1",
  userName: "Jane Doe",
  questionTitle: "Sample Question",
  questionType: "multiple-choice",
  selectedOption: "option1",
  optionType: "text"
});

const result = await waitForAnswerProcessedQuestOnce();
```