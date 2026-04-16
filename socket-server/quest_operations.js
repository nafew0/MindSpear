const activeUsers = new Map(); // socketId -> {userId, questIds[]}
const quests = new Map();    // questId -> questData

function createQuest(questId) {
    quests.set(questId, {
        participants: new Map(),
        questions: new Map(),
        leaderboard: []
    });
}

function joinQuest(socketId, userId, questId) {
    const user = { id: socketId, userId, questId };
    
    // Track user's quests
    if (!activeUsers.has(socketId)) {
        activeUsers.set(socketId, {
            userId,
            questIds: new Set()
        });
    }
    activeUsers.get(socketId).questIds.add(questId);
    
    // Initialize quest if needed
    if (!quests.has(questId)) {
        createQuest(questId);
    }
    
    // Add participant
    quests.get(questId).participants.set(userId, {
        socketId,
        startTime: Date.now(),
        completionTime: null,
        answers: new Map(),
        connected: true
    });
    
    return user;
}

function submitAnswer(questId, userId, questionId, answer, isCorrect, timeTaken) {
    const quest = quests.get(questId);
    if (!quest) return;

    quest.participants.get(userId).answers.set(questionId, {
        answer,
        isCorrect,
        timeTaken,
        timestamp: Date.now()
    });
}

function completeQuest(questId, userId) {
    const quest = quests.get(questId);
    if (!quest || !quest.participants.has(userId)) return;

    const participant = quest.participants.get(userId);
    participant.completionTime = Date.now() - participant.startTime;
    updateLeaderboard(questId);
}

function leaveQuest(questId, userId) {
    const quest = quests.get(questId);
    if (!quest || !quest.participants.has(userId)) return;

    // Remove from quest
    quest.participants.delete(userId);
    updateLeaderboard(questId);
    
    // Remove from user's active quests
    const socketId = [...quest.participants.values()]
        .find(p => p.userId === userId)?.socketId;
    
    if (socketId && activeUsers.has(socketId)) {
        activeUsers.get(socketId).questIds.delete(questId);
        if (activeUsers.get(socketId).questIds.size === 0) {
            activeUsers.delete(socketId);
        }
    }
}

function getLeaderboard(questId) {
    const quest = quests.get(questId);
    if (!quest) return [];

    return Array.from(quest.participants.entries())
        .filter(([_, data]) => data.completionTime !== null)
        .map(([userId, data]) => ({
            userId,
            completionTime: data.completionTime,
            answers: data.answers.size
        }))
        .sort((a, b) => a.completionTime - b.completionTime);
}

function updateLeaderboard(questId) {
    const quest = quests.get(questId);
    if (!quest) return;

    quest.leaderboard = getLeaderboard(questId);
}

function getCurrentUser(socketId) {
    if (!activeUsers.has(socketId)) return null;
    
    const userData = activeUsers.get(socketId);
    return {
        id: socketId,
        userId: userData.userId,
        questIds: Array.from(userData.questIds)
    };
}

function userDisconnect(socketId) {
    const user = getCurrentUser(socketId);
    if (!user) return [];

    const questIds = [...user.questIds];
    activeUsers.delete(socketId);
    
    return questIds; // Return list of quests to clean up
}

export {
    completeQuest,
    createQuest,
    getCurrentUser,
    getLeaderboard,
    joinQuest,
    leaveQuest,
    submitAnswer,
    userDisconnect
};

