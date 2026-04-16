const activeUsers = new Map(); // socketId -> {userId, quizIds[]}
const quizzes = new Map();    // quizId -> quizData
const defaultScoringParams = {
    maxPoints: 100,
    maxTime: 30000,
    minPoints: 10
};

function createQuiz(quizId, scoringParams) {
    quizzes.set(quizId, {
        participants: new Map(),
        questions: new Map(),
        leaderboard: [],
        scoringParams: scoringParams || defaultScoringParams
    });
}

function joinQuiz(socketId, userId, quizId, scoringParams) {
    const user = { id: socketId, userId, quizId };
    
    // Track user's quizzes
    if (!activeUsers.has(socketId)) {
        activeUsers.set(socketId, {
            userId,
            quizIds: new Set()
        });
    }
    activeUsers.get(socketId).quizIds.add(quizId);
    
    // Initialize quiz if needed (should already exist from createQuiz)
    if (!quizzes.has(quizId)) {
        createQuiz(quizId, scoringParams);
    }
    
    // Add participant
    quizzes.get(quizId).participants.set(userId, {
        socketId,
        score: 0,
        answers: new Map(),
        connected: true
    });
    
    return user;
}

function submitAnswer(quizId, userId, questionId, answerData, isCorrect, timeTaken) {
    const quiz = quizzes.get(quizId);
    if (!quiz) return;

    quiz.participants.get(userId).answers.set(questionId, {
        answerData, // Store full answer data object
        isCorrect,
        timeTaken,
        timestamp: Date.now()
    });
    updateLeaderboard(quizId);
}

function leaveQuiz(quizId, userId) {
    const quiz = quizzes.get(quizId);
    if (!quiz || !quiz.participants.has(userId)) return;

    // Remove from quiz
    quiz.participants.delete(userId);
    updateLeaderboard(quizId);
    
    // Remove from user's active quizzes
    const socketId = [...quiz.participants.values()]
        .find(p => p.userId === userId)?.socketId;
    
    if (socketId && activeUsers.has(socketId)) {
        activeUsers.get(socketId).quizIds.delete(quizId);
        if (activeUsers.get(socketId).quizIds.size === 0) {
            activeUsers.delete(socketId);
        }
    }
}

function completeQuiz(quizId, userId) {
    const quiz = quizzes.get(quizId);
    if (!quiz) return;

    quiz.participants.get(userId).completed = true;
    updateLeaderboard(quizId);
}

function getLeaderboard(quizId) {
    const quiz = quizzes.get(quizId);
    if (!quiz) return [];

    return Array.from(quiz.participants.entries())
        .map(([userId, data]) => ({
            userId,
            score: data.score,
            completed: data.completed || false,
            answers: data.answers.size
        }))
        .sort((a, b) => b.score - a.score || a.answers - b.answers);
}

function updateLeaderboard(quizId) {
    const quiz = quizzes.get(quizId);
    if (!quiz) return;

    quiz.leaderboard = getLeaderboard(quizId);
}

function getCurrentUser(socketId) {
    if (!activeUsers.has(socketId)) return null;
    
    const userData = activeUsers.get(socketId);
    return {
        id: socketId,
        userId: userData.userId,
        quizIds: Array.from(userData.quizIds)
    };
}

function userDisconnect(socketId) {
    const user = getCurrentUser(socketId);
    if (!user) return [];

    const quizIds = [...user.quizIds];
    activeUsers.delete(socketId);
    
    return quizIds; // Return list of quizzes to clean up
}

export {
    completeQuiz, createQuiz, getCurrentUser,
    getLeaderboard,
    joinQuiz,
    leaveQuiz,
    submitAnswer,
    userDisconnect
};

