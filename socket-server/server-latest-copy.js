// server.js
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { getCurrentUser, joinUser, joinUserQuest, clearSocketMapping } from "./dummy_user.js";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: { origin: "*" },
});

// Helper to attach current ISO datetime to every response payload
const withTimestamp = (payload) => ({ ...payload, timestamp: new Date().toISOString() });
// Helper to test if a socket is currently connected
const isSocketConnected = (socketId) => !!io.sockets.sockets.get(socketId);

// Track unique quiz participants joined via `joinQuiz` only (exclude `createQuiz`)
// Map<quizId, Set<userId>>
const quizParticipants = new Map();
// Track unique quest participants joined via `joinQuest` only (exclude `createQuest`)
// Map<questId, Set<userId>>
const questParticipants = new Map();
// Track detailed participant info per quiz (only from joinQuiz)
// Map<quizId, Map<userId, { socketId, userId, quizId, userName, quizTitle }>>
const quizParticipantDetails = new Map();
// Track detailed participant info per quest (only from joinQuest)
// Map<questId, Map<userId, { socketId, userId, questId, userName, questTitle }>>
const questParticipantDetails = new Map();
// Track active participants per quiz (joinQuiz adds; leave/abandon/complete remove)
// Map<quizId, Set<userId>>
const quizActiveParticipants = new Map();
// Track active participants per quest (joinQuest adds; leave/abandon/complete remove)
// Map<questId, Set<userId>>
const questActiveParticipants = new Map();
// Track quiz running status per quiz
// Map<quizId, { status: "pending" | "started" | "ended" }>
const quizRunningStatus = new Map();
// Track quest running status per quest
// Map<questId, { status: "pending" | "started" | "ended" }>
const questRunningStatus = new Map();
// Track quiz creator per quiz so we can target notifications
// Map<quizId, { socketId, userId, userName }>
const quizCreators = new Map();
// Track quest creator per quest so we can target notifications
// Map<questId, { socketId, userId, userName }>
const questCreators = new Map();

// Track all answers per quiz and question for creator view
// Map<quizId, Map<questionId, Map<userId, { userId, userName, answerData, questionId, quizId, timestamp }>>>
const quizQuestionAnswers = new Map();
// Track all answers per quest and question for creator view
// Map<questId, Map<questionId, Map<userId, { userId, userName, answerData, questionId, questId, timestamp }>>>
const questQuestionAnswers = new Map();

// Main connection handler
io.on("connection", (socket) => {
    // Notify creator privately right before disconnect completes
    socket.on("disconnecting", () => {
        const user = getCurrentUser(socket.id);
        if (!user) return;
        if (user.quizId) {
            const creator = quizCreators.get(user.quizId);
            if (creator && creator.userId === user.userId) {
                socket.emit("creatorConnectionStatus", withTimestamp({
                    type: "quiz",
                    quizId: user.quizId,
                    userId: user.userId,
                    status: "disconnected",
                    quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
                }));
            }
        }
        if (user.questId) {
            const creatorQ = questCreators.get(user.questId);
            if (creatorQ && creatorQ.userId === user.userId) {
                socket.emit("creatorConnectionStatus", withTimestamp({
                    type: "quest",
                    questId: user.questId,
                    userId: user.userId,
                    status: "disconnected",
                    questRunningStatus: questRunningStatus.get(user.questId) || "pending",
                }));
            }
        }
    });
    console.log(`New connection: ${socket.id}`);

    // 1. Quiz Created Listener
    socket.on("createQuiz", (quizId, userId, quizTitle, userName, scoringParams) => {
        console.log(`Quiz created: ${quizId}`);
        // createQuiz(quizId, scoringParams);

        // Use provided title/name, else fallback to IDs
        const displayQuiz = quizTitle || quizId;
        const displayUser = userName || userId;
        const user = joinUser(socket.id, userId, quizId);
        const status = "pending";
        quizRunningStatus.set(quizId, status);
        // Save quiz creator for targeted notifications
        quizCreators.set(quizId, { socketId: socket.id, userId, userName: displayUser });
        socket.join(quizId);
        console.log(user);

        socket.emit("quizCreated", withTimestamp({
            socketId: user.id,
            userId: user.userId,
            quizId: user.quizId,  
            displayQuiz,
            displayUser,
            message: `Quiz ${displayQuiz} created by ${displayUser}`,
            participantCount: 0,
            participantUserIds: [],
            participantUsers: [],
            activeCount: 0,
            activeUserIds: [],
            activeUsers: [],
            quizRunningStatus: status,
        }));

        // Connection status for room
        socket.broadcast.to(user.quizId).emit("connectionStatus", withTimestamp({
            type: "quiz",
            quizId: user.quizId,
            userId: user.userId,
            status: "connected",
            quizRunningStatus: status,
        }));

        // Private status for creator self
        const creator = quizCreators.get(user.quizId);
        if (creator && creator.userId === user.userId) {
            socket.emit("creatorConnectionStatus", withTimestamp({
                type: "quiz",
                quizId: user.quizId,
                userId: user.userId,
                status: "connected",
                quizRunningStatus: status,
            }));
        }
    });

    // 2. Quiz Join Listener
    socket.on("joinQuiz", (quizId, userId, quizTitle, userName) => {
        console.log(`Join attempt: User ${userId} to Quiz ${quizId}`);

        // Use provided title/name, else fallback to IDs
        const displayQuiz = quizTitle || quizId;
        const displayUser = userName || userId;
        const user = joinUser(socket.id, userId, quizId);
        const status = quizRunningStatus.get(quizId) || "pending";
        socket.join(quizId);
        console.log(user);

        // Update unique participant count for this quiz (count only on joinQuiz)
        let participants = quizParticipants.get(quizId);

        if (!participants) {
            participants = new Set();
            quizParticipants.set(quizId, participants);
        }

        participants.add(userId);
        const participantCount = participants.size;
        const participantUserIds = Array.from(participants);

        // Update participant details map
        let detailsMap = quizParticipantDetails.get(quizId);

        if (!detailsMap) {
            detailsMap = new Map();
            quizParticipantDetails.set(quizId, detailsMap);
        }

        detailsMap.set(userId, {
            socketId: user.id,
            userId: user.userId,
            quizId: user.quizId,
            userName: displayUser,
            quizTitle: displayQuiz,
        });
        const participantUsers = Array.from(detailsMap.values());

        // Update active set for this quiz
        let activeSet = quizActiveParticipants.get(quizId);
        if (!activeSet) {
            activeSet = new Set();
            quizActiveParticipants.set(quizId, activeSet);
        }
        activeSet.add(userId);
        const activeCount = activeSet.size;
        const activeUserIds = Array.from(activeSet);
        const activeUsers = participantUsers.filter((p) => activeSet.has(p.userId));

        // Emit to joiner
        socket.emit("quizJoined", withTimestamp({ 
            socketId: user.id,
            userId: user.userId,
            quizId: user.quizId,  
            displayQuiz,
            displayUser,
            welcome: `Welcome ${displayUser} to quiz ${displayQuiz}`,
            participantCount: participantCount,
            participantUserIds: participantUserIds,
            participantUsers: participantUsers,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: status,
        }));

        // Broadcast to others
        // Displays a joined room message to all other room users except that particular user
        socket.broadcast.to(user.quizId).emit("participantJoined", withTimestamp({
            socketId: user.id,
            quizId: user.quizId,
            userId: user.userId,
            displayQuiz,
            displayUser,
            join: `User ${displayUser} joined to quiz ${displayQuiz}`,
            participantCount: participantCount,
            participantUserIds: participantUserIds,
            participantUsers: participantUsers,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: status,
        }));

        // Connection status for room
        socket.broadcast.to(user.quizId).emit("connectionStatus", withTimestamp({
            type: "quiz",
            quizId: user.quizId,
            userId: user.userId,
            status: "connected",
            quizRunningStatus: status,
        }));

        // If this joiner is the creator, privately confirm connected
        const creator = quizCreators.get(user.quizId);
        if (creator && creator.userId === user.userId) {
            socket.emit("creatorConnectionStatus", withTimestamp({
                type: "quiz",
                quizId: user.quizId,
                userId: user.userId,
                status: "connected",
                quizRunningStatus: status,
            }));
        }

        console.log(`User ${displayUser} joined Quiz ${displayQuiz}`);
    });

    // 3. Start Quiz Listener
    socket.on("startQuiz", (quizId, quizTitle) => {
        console.log(`Starting quiz: ${quizId}`);

        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        // Update status to started
        const status = "started";
        quizRunningStatus.set(quizId, status);
        console.log(user);

        // Emit to starter
        socket.emit("quizStarted", withTimestamp({
            quizId: quizId,
            displayQuiz: displayQuiz,
            quizRunningStatus: status,
            message: `You started quiz ${displayQuiz}`
        }));
        
        // Emit to ALL participants in the quiz room (including the starter)
        socket.broadcast.to(user.quizId).emit("quizStartedAll", withTimestamp({
            quizId: quizId,
            displayQuiz: displayQuiz,
            quizRunningStatus: status,
            message: `Quiz ${displayQuiz} has started!`
        }));
    });

    // 4. Answer Submission Listener (Quiz)
    socket.on("submitAnswer", (userId, questionId, userName, questionTitle, questionType, selectedOption, optionType) => {
        console.log(`Answer from User ${userId} for Question ${questionId}`);
        
        const user = getCurrentUser(socket.id);
        const displayUser = userName || userId;
        const displayQuestion = questionTitle || questionId;
        console.log(user);

        // Store/aggregate answers per quiz and question
        const quizId = user.quizId;
        let quizAnswersMap = quizQuestionAnswers.get(quizId);
        if (!quizAnswersMap) {
            quizAnswersMap = new Map();
            quizQuestionAnswers.set(quizId, quizAnswersMap);
        }
        let questionAnswersMap = quizAnswersMap.get(questionId);
        if (!questionAnswersMap) {
            questionAnswersMap = new Map();
            quizAnswersMap.set(questionId, questionAnswersMap);
        }
        // Upsert the user's latest answer for this question
        const isTextType = String(optionType || "").toLowerCase() === "text";
        const storedAnswer = {
            userId: user.userId,
            userName: displayUser,
            quizId: quizId,
            questionId: questionId,
            question_type: questionType,
        };
        if (isTextType) {
            storedAnswer.text_answer = selectedOption;
        } else {
            storedAnswer.selected_option = selectedOption;
        }
        questionAnswersMap.set(user.userId, storedAnswer);

        // Emit answer processed event
        const processedPayload = {
            socketId: user.id,
            userId: user.userId,
            questionId: questionId,
            displayUser: displayUser,
            displayQuestion: displayQuestion,
            question_type: questionType,
            message: `Answer processed for ${displayUser} on ${displayQuestion}`
        };
        if (isTextType) {
            processedPayload.text_answer = selectedOption;
        } else {
            processedPayload.selected_option = selectedOption;
        }
        processedPayload.quizRunningStatus = quizRunningStatus.get(user.quizId) || "pending";
        socket.emit("answerProcessed", withTimestamp(processedPayload));

        // Notify only the quiz creator with aggregated/typed details
        const creator = quizCreators.get(user.quizId);
        if (creator && creator.socketId) {
            if (isTextType) {
                // For text-based answers, send this user's answer with details
                const answersMap = (quizQuestionAnswers.get(user.quizId)?.get(questionId)) || new Map();
                const textAnswers = Array.from(answersMap.values())
                    .filter((ans) => ans.text_answer !== undefined && ans.text_answer !== null && ans.text_answer !== "")
                    .map((ans) => ({ userId: ans.userId, userName: ans.userName, value: ans.text_answer }));

                io.to(creator.socketId).emit("answerSubmittedToCreator", withTimestamp({
                    quizId: user.quizId,
                    creatorUserId: creator.userId,
                    socketId: user.id,
                    userId: user.userId,
                    displayUser: displayUser,
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    question_type: questionType,
                    textAnswer: {
                        userId: user.userId,
                        userName: displayUser,
                        value: selectedOption,
                    },
                    textAnswers: textAnswers,
                    quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
                    message: `User ${displayUser} submitted answer for ${displayQuestion}`
                }));
            } else {
                // For option-based answers, aggregate counts and user lists per option index
                const answersMap = (quizQuestionAnswers.get(user.quizId)?.get(questionId)) || new Map();
                const optionSelections = {};

                Array.from(answersMap.values()).forEach((ans) => {
                    const options = Array.isArray(ans.selected_option) ? ans.selected_option : [ans.selected_option];
                    options
                        .filter((o) => o !== undefined && o !== null && o !== "")
                        .forEach((opt) => {
                            const key = String(opt);
                            if (!optionSelections[key]) {
                                optionSelections[key] = { count: 0, users: [] };
                            }
                            optionSelections[key].count += 1;
                            optionSelections[key].users.push({ userId: ans.userId, userName: ans.userName });
                        });
                });

                io.to(creator.socketId).emit("answerSubmittedToCreator", withTimestamp({
                    quizId: user.quizId,
                    creatorUserId: creator.userId,
                    socketId: user.id,
                    userId: user.userId,
                    displayUser: displayUser,
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    question_type: questionType,
                    selected_option: selectedOption,
                    optionSelections: optionSelections,
                    quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
                    message: `User ${displayUser} submitted answer for ${displayQuestion}`
                }));
            }
        }
    });

    // 5. Quiz Completion Listener
    socket.on("completeQuiz", (quizId, userId, quizTitle, userName) => {
        console.log(`Quiz completion by User ${userId} for Quiz ${quizId}`);

        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        const displayUser = userName || userId;
        console.log(user);

        // Remove from active set but keep total participants unchanged
        let activeSet = quizActiveParticipants.get(user.quizId);
        if (activeSet) {
            activeSet.delete(user.userId);
        }
        const detailsMap = quizParticipantDetails.get(user.quizId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeCount = activeSet ? activeSet.size : 0;
        const activeUserIds = activeSet ? Array.from(activeSet) : [];
        const activeUsers = participantUsers.filter((p) => activeSet && activeSet.has(p.userId));

        // Emit to completer
        socket.emit("quizCompleted", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            message: `${displayUser} completed the quiz ${displayQuiz}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        }));

        // Broadcast to all participants
        socket.broadcast.to(user.quizId).emit("quizCompletedAll", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            message: `User ${displayUser} has completed the quiz ${displayQuiz}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        }));
    });

    // 6. Quiz Leave Listener
    socket.on("leaveQuiz", (quizId, userId, quizTitle, userName) => {
        console.log(`Leave attempt: User ${userId} from Quiz ${quizId}`);

        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        const displayUser = userName || userId;
        console.log(user);

        // Remove from active set but keep total participants unchanged
        let activeSet = quizActiveParticipants.get(user.quizId);
        if (activeSet) {
            activeSet.delete(user.userId);
        }
        const detailsMap = quizParticipantDetails.get(user.quizId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeCount = activeSet ? activeSet.size : 0;
        const activeUserIds = activeSet ? Array.from(activeSet) : [];
        const activeUsers = participantUsers.filter((p) => activeSet && activeSet.has(p.userId));

        // Emit to leaver
        socket.emit("participantLeft", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            action: "left",
            message: `You have left the quiz ${displayQuiz}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        }));

        // Broadcast to others
        socket.broadcast.to(user.quizId).emit("participantLeftAll", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            action: "left",
            message: `User ${displayUser} has left the quiz ${displayQuiz}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        }));

        console.log(`User ${displayUser} left Quiz ${displayQuiz}`);
    });

    // 7. Quiz Abandon Listener
    socket.on("abandonQuiz", (quizId, userId, quizTitle, userName) => {
        console.log(`Abandon attempt: User ${userId} from Quiz ${quizId}`);
        
        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        const displayUser = userName || userId;
        console.log(user);

        // Remove from active set but keep total participants unchanged
        let activeSet = quizActiveParticipants.get(user.quizId);
        if (activeSet) {
            activeSet.delete(user.userId);
        }
        const detailsMap = quizParticipantDetails.get(user.quizId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeCount = activeSet ? activeSet.size : 0;
        const activeUserIds = activeSet ? Array.from(activeSet) : [];
        const activeUsers = participantUsers.filter((p) => activeSet && activeSet.has(p.userId));

        // Emit to abandoner
        socket.emit("participantAbandoned", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            action: "abandoned",
            message: `You have abandoned the quiz ${displayQuiz}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        }));

        // Broadcast to others 
        socket.broadcast.to(user.quizId).emit("participantAbandonedAll", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            action: "abandoned",
            message: `User ${displayUser} has abandoned the quiz ${displayQuiz}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        }));
        console.log(`User ${displayUser} abandoned Quiz ${displayQuiz}`);
    });

    // 8. Quiz Leaderboard Update Listener
    socket.on("quizLeaderboard", (quizId, userId, quizTitle, userName, leaderboardData) => {
        console.log(`Leaderboard update for Quiz ${quizId} by User ${userId}`);

        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        const displayUser = userName || userId;
        console.log(user);

        // Emit to updater
        socket.emit("leaderboardUpdated", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            leaderboardData: leaderboardData,
            message: `You updated the leaderboard for quiz ${displayQuiz}`
        }));

        // Broadcast to all participants
        socket.broadcast.to(user.quizId).emit("leaderboardUpdatedAll", withTimestamp({
            quizId: quizId,
            userId: user.userId,
            displayQuiz: displayQuiz,
            displayUser: displayUser,
            leaderboardData: leaderboardData,
            message: `Leaderboard updated for quiz ${displayQuiz} by ${displayUser}`
        }));
    });

    // 9. Question Change Listener
    socket.on("changeQuestion", (quizId, questionId, quizTitle, questionTitle) => {
        console.log(`Changing question in Quiz ${quizId} to Question ${questionId}`);

        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        const displayQuestion = questionTitle || questionId;
        console.log(user);

        // Emit to changer
        socket.emit("questionChanged", withTimestamp({
            quizId: quizId,
            displayQuiz: displayQuiz,
            questionId: questionId,
            displayQuestion: displayQuestion,
            message: `You changed to question ${displayQuestion} in quiz ${displayQuiz}`
        }));
        
        // Emit to ALL participants in the quiz room (including the changer)
        socket.broadcast.to(user.quizId).emit("questionChangedAll", withTimestamp({
            quizId: quizId,
            displayQuiz: displayQuiz,
            questionId: questionId,
            displayQuestion: displayQuestion,
            message: `Question changed to ${displayQuestion} in quiz ${displayQuiz}`
        }));
    });

    // 10. Quiz End Listener
    socket.on("endQuiz", (quizId, quizTitle) => {
        console.log(`Ending quiz: ${quizId}`);
        const user = getCurrentUser(socket.id);
        const displayQuiz = quizTitle || quizId;
        // Update status to ended
        const status = "ended";
        quizRunningStatus.set(quizId, status);
        console.log(user);

        // Emit to ender
        socket.emit("quizEnded", withTimestamp({
            quizId: quizId,
            displayQuiz: displayQuiz,
            quizRunningStatus: status,
            message: `You ended the quiz ${displayQuiz}`
        }));

        // Emit to ALL participants in the quiz room (including the ender)
        socket.broadcast.to(user.quizId).emit("quizEndedAll", withTimestamp({
            quizId: quizId,
            displayQuiz: displayQuiz,
            quizRunningStatus: status,
            message: `Quiz ${displayQuiz} has ended`
        }));
    });

    // 11. Error Handling Listener
    socket.on("errorEvent", (errorMessage) => {
        console.error(`Error from ${socket.id}: ${errorMessage}`);
        socket.emit("errorResponse", withTimestamp({ message: `Error received: ${errorMessage}` }));
    });

    // 12. Create Quest Listener
    socket.on("createQuest", (questId, userId, questTitle, userName, scoringParams) => {
        console.log(`Quest created: ${questId}`);
        // createQuest(questId, scoringParams);

        // Use provided title/name, else fallback to IDs
        const displayQuest = questTitle || questId;
        const displayUser = userName || userId;
        const user = joinUserQuest(socket.id, userId, questId);
        const status = "pending";
        questRunningStatus.set(questId, status);
        // Save quest creator for targeted notifications
        questCreators.set(questId, { socketId: socket.id, userId, userName: displayUser });
        socket.join(questId);
        console.log(user);

        socket.emit("questCreated", withTimestamp({
            socketId: user.id,
            userId: user.userId,
            questId: user.questId,  
            displayQuest,
            displayUser,
            message: `Quest ${displayQuest} created by ${displayUser}`,
            participantCount: 0,
            participantUserIds: [],
            participantUsers: [],
            activeCount: 0,
            activeUserIds: [],
            activeUsers: [],
            questRunningStatus: status,
        }));

        // Connection status for room
        socket.broadcast.to(user.questId).emit("connectionStatus", withTimestamp({
            type: "quest",
            questId: user.questId,
            userId: user.userId,
            status: "connected",
            questRunningStatus: status,
        }));

        // Private status for creator self
        const creator = questCreators.get(user.questId);
        if (creator && creator.userId === user.userId) {
            socket.emit("creatorConnectionStatus", withTimestamp({
                type: "quest",
                questId: user.questId,
                userId: user.userId,
                status: "connected",
                questRunningStatus: status,
            }));
        }
    });

    // 13. Join Quest Listener
    socket.on("joinQuest", (questId, userId, questTitle, userName) => {
        console.log(`Join attempt: User ${userId} to Quest ${questId}`);

        // Use provided title/name, else fallback to IDs
        const displayQuest = questTitle || questId;
        const displayUser = userName || userId;
        const user = joinUserQuest(socket.id, userId, questId);
        const status = questRunningStatus.get(questId) || "pending";
        socket.join(questId);
        console.log(user);

        // Update unique participant count for this quest (count only on joinQuest)
        let participants = questParticipants.get(questId);

        if (!participants) {
            participants = new Set();
            questParticipants.set(questId, participants);
        }

        participants.add(userId);
        const participantCount = participants.size;
        const participantUserIds = Array.from(participants);

        // Update participant details map
        let detailsMap = questParticipantDetails.get(questId);

        if (!detailsMap) {
            detailsMap = new Map();
            questParticipantDetails.set(questId, detailsMap);
        }

        detailsMap.set(userId, {
            socketId: user.id,
            userId: user.userId,
            questId: user.questId,
            userName: displayUser,
            questTitle: displayQuest,
        });
        const participantUsers = Array.from(detailsMap.values());

        // Update active set for this quest
        let activeSet = questActiveParticipants.get(questId);
        if (!activeSet) {
            activeSet = new Set();
            questActiveParticipants.set(questId, activeSet);
        }
        activeSet.add(userId);
        const activeCount = activeSet.size;
        const activeUserIds = Array.from(activeSet);
        const activeUsers = participantUsers.filter((p) => activeSet.has(p.userId));

        // Emit to joiner
        socket.emit("questJoined", withTimestamp({ 
            socketId: user.id,
            userId: user.userId,
            questId: user.questId,  
            displayQuest,
            displayUser,
            welcome: `Welcome ${displayUser} to quest ${displayQuest}`,
            participantCount: participantCount,
            participantUserIds: participantUserIds,
            participantUsers: participantUsers,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: status,
        }));

        // Broadcast to others
        // Displays a joined room message to all other room users except that particular user
        socket.broadcast.to(user.questId).emit("participantJoinedQuest", withTimestamp({
            socketId: user.id,
            questId: user.questId,
            userId: user.userId,
            displayQuest,
            displayUser,
            join: `User ${displayUser} joined to quest ${displayQuest}`,
            participantCount: participantCount,
            participantUserIds: participantUserIds,
            participantUsers: participantUsers,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: status,
        }));

        // Connection status for room
        socket.broadcast.to(user.questId).emit("connectionStatus", withTimestamp({
            type: "quest",
            questId: user.questId,
            userId: user.userId,
            status: "connected",
            questRunningStatus: status,
        }));

        // If this joiner is the creator, privately confirm connected
        const creator = questCreators.get(user.questId);
        if (creator && creator.userId === user.userId) {
            socket.emit("creatorConnectionStatus", withTimestamp({
                type: "quest",
                questId: user.questId,
                userId: user.userId,
                status: "connected",
                questRunningStatus: status,
            }));
        }

        console.log(`User ${displayUser} joined Quest ${displayQuest}`);
    });

    // 14. Start Quest Listener
    socket.on("startQuest", (questId, questTitle) => {
        console.log(`Starting quest: ${questId}`);

        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        // Update status to started
        const status = "started";
        questRunningStatus.set(questId, status);
        console.log(user);

        // Emit to starter
        socket.emit("questStarted", withTimestamp({
            questId: questId,
            displayQuest: displayQuest,
            questRunningStatus: status,
            message: `You started quest ${displayQuest}`
        }));
        
        // Emit to ALL participants in the quest room (including the starter)
        socket.broadcast.to(user.questId).emit("questStartedAll", withTimestamp({
            questId: questId,
            displayQuest: displayQuest,
            questRunningStatus: status,
            message: `Quest ${displayQuest} has started!`
        }));
    });

    // 15. Task Submission Listener (Quest)
    socket.on("submitTask", (userId, questionId, userName, questionTitle, questionType, selectedOption, optionType) => {
        console.log(`Answer from User ${userId} for Question ${questionId}`);
        
        const user = getCurrentUser(socket.id);
        const displayUser = userName || userId;
        const displayQuestion = questionTitle || questionId;
        console.log(user);

        // Store/aggregate answers per quest and question
        const questId = user.questId;
        let questAnswersMap = questQuestionAnswers.get(questId);
        if (!questAnswersMap) {
            questAnswersMap = new Map();
            questQuestionAnswers.set(questId, questAnswersMap);
        }
        let questionAnswersMap = questAnswersMap.get(questionId);
        if (!questionAnswersMap) {
            questionAnswersMap = new Map();
            questAnswersMap.set(questionId, questionAnswersMap);
        }
        // Upsert the user's latest answer for this question
        const isTextType = String(optionType || "").toLowerCase() === "text";
        const storedAnswer = {
            userId: user.userId,
            userName: displayUser,
            questId: questId,
            questionId: questionId,
            question_type: questionType,
        };
        if (isTextType) {
            storedAnswer.text_answer = selectedOption;
        } else {
            storedAnswer.selected_option = selectedOption;
        }
        questionAnswersMap.set(user.userId, storedAnswer);

        // Emit answer processed event
        const processedPayload = {
            socketId: user.id,
            userId: user.userId,
            questionId: questionId,
            displayUser: displayUser,
            displayQuestion: displayQuestion,
            question_type: questionType,
            message: `Answer processed for ${displayUser} on ${displayQuestion}`
        };
        if (isTextType) {
            processedPayload.text_answer = selectedOption;
        } else {
            processedPayload.selected_option = selectedOption;
        }
        processedPayload.questRunningStatus = questRunningStatus.get(user.questId) || "pending";
        socket.emit("answerProcessedQuest", withTimestamp(processedPayload));

        // Notify only the quest creator with aggregated/typed details
        const creator = questCreators.get(user.questId);
        if (creator && creator.socketId) {
            if (isTextType) {
                // For text-based answers, send this user's answer with details
                const answersMap = (questQuestionAnswers.get(user.questId)?.get(questionId)) || new Map();
                const textAnswers = Array.from(answersMap.values())
                    .filter((ans) => ans.text_answer !== undefined && ans.text_answer !== null && ans.text_answer !== "")
                    .map((ans) => ({ userId: ans.userId, userName: ans.userName, value: ans.text_answer }));

                io.to(creator.socketId).emit("answerSubmittedToQuestCreator", withTimestamp({
                    questId: user.questId,
                    creatorUserId: creator.userId,
                    socketId: user.id,
                    userId: user.userId,
                    displayUser: displayUser,
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    question_type: questionType,
                    textAnswer: {
                        userId: user.userId,
                        userName: displayUser,
                        value: selectedOption,
                    },
                    textAnswers: textAnswers,
                    questRunningStatus: questRunningStatus.get(user.questId) || "pending",
                    message: `User ${displayUser} submitted answer for ${displayQuestion}`
                }));
            } else {
                // For option-based answers, aggregate counts and user lists per option index
                const answersMap = (questQuestionAnswers.get(user.questId)?.get(questionId)) || new Map();
                const optionSelections = {};

                Array.from(answersMap.values()).forEach((ans) => {
                    const options = Array.isArray(ans.selected_option) ? ans.selected_option : [ans.selected_option];
                    options
                        .filter((o) => o !== undefined && o !== null && o !== "")
                        .forEach((opt) => {
                            const key = String(opt);
                            if (!optionSelections[key]) {
                                optionSelections[key] = { count: 0, users: [] };
                            }
                            optionSelections[key].count += 1;
                            optionSelections[key].users.push({ userId: ans.userId, userName: ans.userName });
                        });
                });

                io.to(creator.socketId).emit("answerSubmittedToQuestCreator", withTimestamp({
                    questId: user.questId,
                    creatorUserId: creator.userId,
                    socketId: user.id,
                    userId: user.userId,
                    displayUser: displayUser,
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    question_type: questionType,
                    selected_option: selectedOption,
                    optionSelections: optionSelections,
                    questRunningStatus: questRunningStatus.get(user.questId) || "pending",
                    message: `User ${displayUser} submitted answer for ${displayQuestion}`
                }));
            }
        }
    });

    // 16. Quest Completion Listener
    socket.on("completeQuest", (questId, userId, questTitle, userName) => {
        console.log(`Quest completion by User ${userId} for Quest ${questId}`);

        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        const displayUser = userName || userId;
        console.log(user);

        // Remove from active set but keep total participants unchanged
        let activeSet = questActiveParticipants.get(user.questId);
        if (activeSet) {
            activeSet.delete(user.userId);
        }
        const detailsMap = questParticipantDetails.get(user.questId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeCount = activeSet ? activeSet.size : 0;
        const activeUserIds = activeSet ? Array.from(activeSet) : [];
        const activeUsers = participantUsers.filter((p) => activeSet && activeSet.has(p.userId));

        // Emit to completer
        socket.emit("questCompleted", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            message: `${displayUser} completed the quest ${displayQuest}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        }));

        // Broadcast to all participants
        socket.broadcast.to(user.questId).emit("questCompletedAll", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            message: `User ${displayUser} has completed the quest ${displayQuest}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        }));
    });

    // 17. Quest Leave Listener
    socket.on("leaveQuest", (questId, userId, questTitle, userName) => {
        console.log(`Leave attempt: User ${userId} from Quest ${questId}`);

        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        const displayUser = userName || userId;
        console.log(user);

        // Remove from active set but keep total participants unchanged
        let activeSet = questActiveParticipants.get(user.questId);
        if (activeSet) {
            activeSet.delete(user.userId);
        }
        const detailsMap = questParticipantDetails.get(user.questId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeCount = activeSet ? activeSet.size : 0;
        const activeUserIds = activeSet ? Array.from(activeSet) : [];
        const activeUsers = participantUsers.filter((p) => activeSet && activeSet.has(p.userId));

        // Emit to leaver
        socket.emit("participantLeftQuest", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            action: "left",
            message: `You have left the quest ${displayQuest}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        }));

        // Broadcast to others
        socket.broadcast.to(user.questId).emit("participantLeftQuestAll", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            action: "left",
            message: `User ${displayUser} has left the quest ${displayQuest}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        }));

        console.log(`User ${displayUser} left Quest ${displayQuest}`);
    });

    // 18. Quest Abandon Listener
    socket.on("abandonQuest", (questId, userId, questTitle, userName) => {
        console.log(`Abandon attempt: User ${userId} from Quest ${questId}`);
        
        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        const displayUser = userName || userId;
        console.log(user);

        // Remove from active set but keep total participants unchanged
        let activeSet = questActiveParticipants.get(user.questId);
        if (activeSet) {
            activeSet.delete(user.userId);
        }
        const detailsMap = questParticipantDetails.get(user.questId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeCount = activeSet ? activeSet.size : 0;
        const activeUserIds = activeSet ? Array.from(activeSet) : [];
        const activeUsers = participantUsers.filter((p) => activeSet && activeSet.has(p.userId));

        // Emit to abandoner
        socket.emit("participantAbandonedQuest", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            action: "abandoned",
            message: `You have abandoned the quest ${displayQuest}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        }));

        // Broadcast to others 
        socket.broadcast.to(user.questId).emit("participantAbandonedQuestAll", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            action: "abandoned",
            message: `User ${displayUser} has abandoned the quest ${displayQuest}`,
            activeCount: activeCount,
            activeUserIds: activeUserIds,
            activeUsers: activeUsers,
            questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        }));
        console.log(`User ${displayUser} abandoned Quest ${displayQuest}`);
    });

    // 19. Quest Leaderboard Update Listener
    socket.on("questLeaderboard", (questId, userId, questTitle, userName, leaderboardData) => {
        console.log(`Leaderboard update for Quest ${questId} by User ${userId}`);

        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        const displayUser = userName || userId;
        console.log(user);

        // Emit to updater
        socket.emit("leaderboardUpdatedQuest", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            leaderboardData: leaderboardData,
            message: `You updated the leaderboard for quest ${displayQuest}`
        }));

        // Broadcast to all participants
        socket.broadcast.to(user.questId).emit("leaderboardUpdatedQuestAll", withTimestamp({
            questId: questId,
            userId: user.userId,
            displayQuest: displayQuest,
            displayUser: displayUser,
            leaderboardData: leaderboardData,
            message: `Leaderboard updated for quest ${displayQuest} by ${displayUser}`
        }));
    });

    // 20. Question Change Listener
    socket.on("changeQuestion", (questId, questionId, questTitle, questionTitle) => {
        console.log(`Changing question in Quest ${questId} to Question ${questionId}`);

        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        const displayQuestion = questionTitle || questionId;
        console.log(user);

        // Emit to changer
        socket.emit("questionChangedQuest", withTimestamp({
            questId: questId,
            displayQuest: displayQuest,
            questionId: questionId,
            displayQuestion: displayQuestion,
            message: `You changed to question ${displayQuestion} in quest ${displayQuest}`
        }));
        
        // Emit to ALL participants in the quest room (including the changer)
        socket.broadcast.to(user.questId).emit("questionChangedQuestAll", withTimestamp({
            questId: questId,
            displayQuest: displayQuest,
            questionId: questionId,
            displayQuestion: displayQuestion,
            message: `Question changed to ${displayQuestion} in quest ${displayQuest}`
        }));
    });

    // 21. Quest End Listener
    socket.on("endQuest", (questId, questTitle) => {
        console.log(`Ending quest: ${questId}`);
        const user = getCurrentUser(socket.id);
        const displayQuest = questTitle || questId;
        // Update status to ended
        const status = "ended";
        questRunningStatus.set(questId, status);
        console.log(user);

        // Emit to ender
        socket.emit("questEnded", withTimestamp({
            questId: questId,
            displayQuest: displayQuest,
            questRunningStatus: status,
            message: `You ended the quest ${displayQuest}`
        }));

        // Emit to ALL participants in the quest room (including the ender)
        socket.broadcast.to(user.questId).emit("questEndedAll", withTimestamp({
            questId: questId,
            displayQuest: displayQuest,
            questRunningStatus: status,
            message: `Quest ${displayQuest} has ended`
        }));
    });

    // 22. Check Quiz Status Listener
    socket.on("checkQuizStatus", (quizId) => {
        console.log(`Checking status for Quiz ${quizId}`);
        
        const user = getCurrentUser(socket.id);
        const status = quizRunningStatus.get(quizId) || "pending";
        const participants = quizParticipants.get(quizId) || new Set();
        const activeParticipants = quizActiveParticipants.get(quizId) || new Set();
        const detailsMap = quizParticipantDetails.get(quizId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeUsers = participantUsers.filter((p) => activeParticipants.has(p.userId));
        
        socket.emit("quizStatusResponse", withTimestamp({
            quizId: quizId,
            status: status,
            participantCount: participants.size,
            participantUserIds: Array.from(participants),
            participantUsers: participantUsers,
            activeCount: activeParticipants.size,
            activeUserIds: Array.from(activeParticipants),
            activeUsers: activeUsers,
            message: `Quiz ${quizId} status: ${status}`
        }));
    });

    // 23. Check Quest Status Listener
    socket.on("checkQuestStatus", (questId) => {
        console.log(`Checking status for Quest ${questId}`);
        
        const user = getCurrentUser(socket.id);
        const status = questRunningStatus.get(questId) || "pending";
        const participants = questParticipants.get(questId) || new Set();
        const activeParticipants = questActiveParticipants.get(questId) || new Set();
        const detailsMap = questParticipantDetails.get(questId) || new Map();
        const participantUsers = Array.from(detailsMap.values());
        const activeUsers = participantUsers.filter((p) => activeParticipants.has(p.userId));
        
        socket.emit("questStatusResponse", withTimestamp({
            questId: questId,
            status: status,
            participantCount: participants.size,
            participantUserIds: Array.from(participants),
            participantUsers: participantUsers,
            activeCount: activeParticipants.size,
            activeUserIds: Array.from(activeParticipants),
            activeUsers: activeUsers,
            message: `Quest ${questId} status: ${status}`
        }));
    });

    // 24. Task Submission Listener With options ranking/sorting (Quest)
    socket.on("submitTaskWithRanking", (userId, questionId, userName, questionTitle, questionType, optionRankings) => {
        console.log(`${questionType} submission from User ${userId} for Question ${questionId}`);

        const user = getCurrentUser(socket.id);
        const displayUser = userName || userId;
        const displayQuestion = questionTitle || questionId;
        console.log(user);

        // Check if this is ranking, sorting, or scaling
        const isRanking = String(questionType || "").toLowerCase() === "option_ranking";
        const isSorting = String(questionType || "").toLowerCase() === "option_sorting";
        const isScaling = String(questionType || "").toLowerCase() === "option_scaling" || String(questionType || "").toLowerCase() === "scaling";

        // Store/aggregate answers per quest and question
        const questId = user.questId;
        let questAnswersMap = questQuestionAnswers.get(questId);
        if (!questAnswersMap) {
            questAnswersMap = new Map();
            questQuestionAnswers.set(questId, questAnswersMap);
        }

        let questionAnswersMap = questAnswersMap.get(questionId);
        if (!questionAnswersMap) {
            questionAnswersMap = new Map();
            questAnswersMap.set(questionId, questionAnswersMap);
        }

        // Upsert the user's latest ranking/sorting for this question
        const storedAnswer = {
            userId: user.userId,
            userName: displayUser,
            questId: questId,
            questionId: questionId,
            question_type: questionType,
            option_rankings: optionRankings,
            timestamp: new Date().toISOString()
        };
        questionAnswersMap.set(user.userId, storedAnswer);

        // Emit answer processed event to the user who submitted
        const processedPayload = {
            socketId: user.id,
            userId: user.userId,
            questionId: questionId,
            displayUser: displayUser,
            displayQuestion: displayQuestion,
            question_type: questionType,
            option_rankings: optionRankings,
            message: `${questionType} processed for ${displayUser} on ${displayQuestion}`
        };

        processedPayload.questRunningStatus = questRunningStatus.get(user.questId) || "pending";
        socket.emit("answerProcessedQuest", withTimestamp(processedPayload));

        // Calculate scores based on question type
        let calculateScores;
        let scoreType;

        if (isRanking) {
            // Dynamic ranking: first gets N points, last gets 1, where N = number of ranked items
            calculateScores = (rankings) => {
                const scores = {};
                const numItems = Array.isArray(rankings) ? rankings.length : 0;
                rankings.forEach((optionId, position) => {
                    const points = Math.max(0, numItems - position); // position 0 => N, last => 1
                    scores[optionId] = points;
                });
                return scores;
            };
            scoreType = "ranking";
        } else if (isSorting) {
            // Sorting calculation: direct value scoring (array values represent scores/weights)
            calculateScores = (sortings) => {
                const scores = {};
                sortings.forEach((value, index) => {
                    scores[index] = value; // Use array index as option ID, value as score
                });
                return scores;
            };
            scoreType = "sorting";
        } else if (isScaling) {
            // Scaling calculation: direct value scoring (array values represent scale values)
            calculateScores = (scalings) => {
                const scores = {};
                scalings.forEach((value, index) => {
                    scores[index] = value; // Use array index as option ID, value as scale score
                });
                return scores;
            };
            scoreType = "scaling";
        } else {
            // Default fallback (treat as ranking with dynamic N)
            calculateScores = (rankings) => {
                const scores = {};
                const numItems = Array.isArray(rankings) ? rankings.length : 0;
                rankings.forEach((optionId, position) => {
                    const points = Math.max(0, numItems - position);
                    scores[optionId] = points;
                });
                return scores;
            };
            scoreType = "default";
        }

        // Calculate individual user's scores
        const userScores = calculateScores(optionRankings);

        // Notify the user with their individual scores
        socket.emit("userRankingScores", {
            questionId: questionId,
            questionTitle: displayQuestion,
            questionType: questionType,
            scoreType: scoreType,
            userScores: userScores,
            formattedScores: Object.entries(userScores).map(([optionId, score]) => `${optionId}:${score}`),
            message: `Your ${scoreType} scores calculated`
        });

        // Notify only the quest creator/admin with aggregated data
        const creator = questCreators.get(user.questId);
        if (creator && creator.socketId) {
            const answersMap = (questQuestionAnswers.get(user.questId)?.get(questionId)) || new Map();
            const allSubmissions = Array.from(answersMap.values());
            
            // Calculate overall option scores across all users
            const overallOptionScores = {};
            const userSubmissions = [];
            
            allSubmissions.forEach((answer) => {
                const userSubmission = {
                    userId: answer.userId,
                    userName: answer.userName,
                    rankings: answer.option_rankings,
                    scores: calculateScores(answer.option_rankings)
                };
                userSubmissions.push(userSubmission);
                
                // Aggregate scores for each option
                Object.entries(userSubmission.scores).forEach(([optionId, score]) => {
                    if (!overallOptionScores[optionId]) {
                        overallOptionScores[optionId] = 0;
                    }
                    overallOptionScores[optionId] += score;
                });
            });

            // Calculate average scores for each option
            const averageOptionScores = {};
            Object.entries(overallOptionScores).forEach(([optionId, totalScore]) => {
                averageOptionScores[optionId] = totalScore / allSubmissions.length;
            });

            // Calculate percentage-based scores based on question type
            let percentageScores = {};
            
            if (isScaling) {
                // Scaling calculation: (Sum/(Number of Users × Max Rating)) × 100
                const maxRating = 5; // Assuming a 1-5 scale, adjust as needed based on your scale
                Object.entries(overallOptionScores).forEach(([optionId, totalScore]) => {
                    const maxPossibleTotal = allSubmissions.length * maxRating;
                    percentageScores[optionId] = maxPossibleTotal > 0 ? (totalScore / maxPossibleTotal) * 100 : 0;
                });
            } else {
                // Ranking/Sorting calculation: (Sum ÷ Max(Sum)) × 100
                const maxSum = Math.max(...Object.values(overallOptionScores));
                Object.entries(overallOptionScores).forEach(([optionId, totalScore]) => {
                    percentageScores[optionId] = maxSum > 0 ? (totalScore / maxSum) * 100 : 0;
                });
            }

            // Format overall scores for display
            const formattedOverallScores = Object.entries(overallOptionScores)
                .map(([optionId, score]) => `${optionId}:${score}`)
                .sort((a, b) => {
                    const scoreA = parseFloat(a.split(':')[1]);
                    const scoreB = parseFloat(b.split(':')[1]);
                    return scoreB - scoreA; // Sort descending by score
                });

            // Format percentage scores for display (formattedAverageScores)
            const formattedAverageScores = Object.entries(percentageScores)
                .map(([optionId, score]) => `${optionId}:${score.toFixed(2)}%`)
                .sort((a, b) => {
                    const scoreA = parseFloat(a.split(':')[1]);
                    const scoreB = parseFloat(b.split(':')[1]);
                    return scoreB - scoreA; // Sort descending by score
                });

            // Send detailed data to admin/creator
            io.to(creator.socketId).emit("rankingSubmittedToQuestCreator", withTimestamp({
                questId: user.questId,
                creatorUserId: creator.userId,
                questionId: questionId,
                displayQuestion: displayQuestion,
                question_type: questionType,
                scoreType: scoreType,
                
                // New user's submission
                newSubmission: {
                    userId: user.userId,
                    userName: displayUser,
                    option_rankings: optionRankings,
                    scores: userScores,
                    formattedScores: Object.entries(userScores).map(([optionId, score]) => `${optionId}:${score}`)
                },
                
                // All user submissions
                allUserSubmissions: userSubmissions,
                
                // Overall aggregated scores
                overallOptionScores: overallOptionScores,
                formattedOverallScores: formattedOverallScores,
                
                // Average scores
                averageOptionScores: averageOptionScores,
                formattedAverageScores: formattedAverageScores,
                
                // Percentage-based scores
                percentageScores: percentageScores,
                
                // Total participants
                totalParticipants: allSubmissions.length,
                
                message: `User ${displayUser} submitted ${scoreType} for ${displayQuestion}`
            }));

            // Also broadcast to all admin users in the quest (if you have multiple admins)
            const adminUsers = [creator]; // Just send to the main creator for now
            
            adminUsers.forEach(admin => {
                if (admin.socketId && admin.socketId !== creator.socketId) {
                    io.to(admin.socketId).emit("rankingSubmittedToAdmin", withTimestamp({
                        questId: user.questId,
                        questionId: questionId,
                        displayQuestion: displayQuestion,
                        questionType: questionType,
                        scoreType: scoreType,
                        userId: user.userId,
                        userName: displayUser,
                        option_rankings: optionRankings,
                        message: `New ${scoreType} submission from ${displayUser}`
                    }));
                }
            });
        }

        // Broadcast to all users in the same quest that a new ranking was submitted
        // Replace this with your actual method of getting quest users
        // For now, we'll skip this part since we don't have the user storage variable
        /*
        const questUsers = []; // Empty array for now
        
        questUsers.forEach(questUser => {
            if (questUser.socketId) {
                io.to(questUser.socketId).emit("newRankingSubmission", {
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    userId: user.userId,
                    userName: displayUser,
                    message: `${displayUser} submitted their rankings for ${displayQuestion}`
                });
            }
        });
        */
    });

    // 25. Task Submission Listener for QuickForm (Quest)
    socket.on("submitTaskForQuickForm", (userId, questionId, userName, questionTitle, questionType, quickFormData) => {
        console.log(`QuickForm submission from User ${userId} for Question ${questionId}`);
        
        const user = getCurrentUser(socket.id);
        const displayUser = userName || userId;
        const displayQuestion = questionTitle || questionId;
        console.log(user);

        // Extract answer data from quickFormData
        const selectedOption = quickFormData?.selectedOption || quickFormData?.answer || quickFormData;
        const optionType = quickFormData?.optionType || questionType;

        // Store/aggregate answers per quest and question
        const questId = user.questId;
        let questAnswersMap = questQuestionAnswers.get(questId);
        if (!questAnswersMap) {
            questAnswersMap = new Map();
            questQuestionAnswers.set(questId, questAnswersMap);
        }
        let questionAnswersMap = questAnswersMap.get(questionId);
        if (!questionAnswersMap) {
            questionAnswersMap = new Map();
            questAnswersMap.set(questionId, questionAnswersMap);
        }
        // Upsert the user's latest answer for this question
        const isTextType = String(optionType || "").toLowerCase() === "text";
        const storedAnswer = {
            userId: user.userId,
            userName: displayUser,
            questId: questId,
            questionId: questionId,
            question_type: questionType,
        };
        if (isTextType) {
            storedAnswer.text_answer = selectedOption;
        } else {
            storedAnswer.selected_option = selectedOption;
        }
        questionAnswersMap.set(user.userId, storedAnswer);

        // Emit answer processed event
        const processedPayload = {
            socketId: user.id,
            userId: user.userId,
            questionId: questionId,
            displayUser: displayUser,
            displayQuestion: displayQuestion,
            question_type: questionType,
            message: `Answer processed for ${displayUser} on ${displayQuestion}`
        };
        if (isTextType) {
            processedPayload.text_answer = selectedOption;
        } else {
            processedPayload.selected_option = selectedOption;
        }
        processedPayload.questRunningStatus = questRunningStatus.get(user.questId) || "pending";
        socket.emit("answerProcessedQuest", withTimestamp(processedPayload));

        // Notify only the quest creator with aggregated/typed details
        const creator = questCreators.get(user.questId);
        if (creator && creator.socketId) {
            if (isTextType) {
                // For text-based answers, send this user's answer with details
                const answersMap = (questQuestionAnswers.get(user.questId)?.get(questionId)) || new Map();
                const textAnswers = Array.from(answersMap.values())
                    .filter((ans) => ans.text_answer !== undefined && ans.text_answer !== null && ans.text_answer !== "")
                    .map((ans) => ({ userId: ans.userId, userName: ans.userName, value: ans.text_answer }));
                const participants = questParticipants.get(user.questId) || new Set();
                const totalRequestedUsers = participants.size;
                const totalResponses = textAnswers.length;

                io.to(creator.socketId).emit("answerSubmittedToQuestCreatorQuickForm", withTimestamp({
                    questId: user.questId,
                    creatorUserId: creator.userId,
                    socketId: user.id,
                    userId: user.userId,
                    displayUser: displayUser,
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    question_type: questionType,
                    textAnswer: {
                        userId: user.userId,
                        userName: displayUser,
                        value: selectedOption,
                    },
                    textAnswers: textAnswers,
                    participantCount: totalRequestedUsers,
                    totalResponses: totalResponses,
                    responses: textAnswers,
                    questRunningStatus: questRunningStatus.get(user.questId) || "pending",
                    message: `User ${displayUser} submitted answer for ${displayQuestion}`
                }));
            } else {
                // For option-based answers, aggregate counts and user lists per option index
                const answersMap = (questQuestionAnswers.get(user.questId)?.get(questionId)) || new Map();
                const optionSelections = {};

                const allSubmissions = Array.from(answersMap.values());
                Array.from(allSubmissions).forEach((ans) => {
                    const options = Array.isArray(ans.selected_option) ? ans.selected_option : [ans.selected_option];
                    options
                        .filter((o) => o !== undefined && o !== null && o !== "")
                        .forEach((opt) => {
                            const key = String(opt);
                            if (!optionSelections[key]) {
                                optionSelections[key] = { count: 0, users: [] };
                            }
                            optionSelections[key].count += 1;
                            optionSelections[key].users.push({ userId: ans.userId, userName: ans.userName });
                        });
                });
                const participants = questParticipants.get(user.questId) || new Set();
                const totalRequestedUsers = participants.size;
                const perUserResponses = allSubmissions
                    .map((ans) => ({ userId: ans.userId, userName: ans.userName, value: ans.selected_option }))
                    .filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
                const totalResponses = perUserResponses.length;

                io.to(creator.socketId).emit("answerSubmittedToQuestCreatorQuickForm", withTimestamp({
                    questId: user.questId,
                    creatorUserId: creator.userId,
                    socketId: user.id,
                    userId: user.userId,
                    displayUser: displayUser,
                    questionId: questionId,
                    displayQuestion: displayQuestion,
                    question_type: questionType,
                    selected_option: selectedOption,
                    optionSelections: optionSelections,
                    participantCount: totalRequestedUsers,
                    totalResponses: totalResponses,
                    responses: perUserResponses,
                    questRunningStatus: questRunningStatus.get(user.questId) || "pending",
                    message: `User ${displayUser} submitted answer for ${displayQuestion}`
                }));
            }
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => { 
        const user = getCurrentUser(socket.id);
        console.log(`Connection closed: ${socket.id}`);
        // Broadcast connection status before clearing mapping
        if (user && user.quizId) {
            socket.broadcast.to(user.quizId).emit("connectionStatus", withTimestamp({
                type: "quiz",
                quizId: user.quizId,
                userId: user.userId,
                status: "disconnected",
                quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
            }));
            // If creator, also privately notify them (in case client handles queued messages)
            const creator = quizCreators.get(user.quizId);
            if (creator && creator.userId === user.userId) {
                socket.emit("creatorConnectionStatus", withTimestamp({
                    type: "quiz",
                    quizId: user.quizId,
                    userId: user.userId,
                    status: "disconnected",
                    quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
                }));
            }
        }
        if (user && user.questId) {
            socket.broadcast.to(user.questId).emit("connectionStatus", withTimestamp({
                type: "quest",
                questId: user.questId,
                userId: user.userId,
                status: "disconnected",
                questRunningStatus: questRunningStatus.get(user.questId) || "pending",
            }));
            const creatorQ = questCreators.get(user.questId);
            if (creatorQ && creatorQ.userId === user.userId) {
                socket.emit("creatorConnectionStatus", withTimestamp({
                    type: "quest",
                    questId: user.questId,
                    userId: user.userId,
                    status: "disconnected",
                    questRunningStatus: questRunningStatus.get(user.questId) || "pending",
                }));
            }
        }
        // Clear only the physical-to-stable mapping; keep logical identity for reuse
        clearSocketMapping(socket.id);
    });
});

// Start the server
httpServer.listen(4001, () => {
    console.log("Server running on port 4001");
});