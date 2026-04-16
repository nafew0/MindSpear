// server.js
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  clearSocketMapping,
  getCurrentUser,
  joinUserQuiz,
  joinUserQuest,
} from "./dummy_user.js";
import { registerQuizHandlers } from "./quizHandlers.js";

const userSockets = new Map();
const userRooms = new Map();

// Quest tracking
// QUEST stores
const questParticipants = new Map();
const questActiveParticipants = new Map();
const questParticipantDetails = new Map();
const questRunningStatus = new Map();
const questCreators = new Map();
const questCurrentQuestion = new Map();
const questQuestionAnswers = new Map();

// QUIZ
const quizParticipants = new Map();
const quizActiveParticipants = new Map();
const quizParticipantDetails = new Map();
const quizRunningStatus = new Map();
const quizCreators = new Map();
const quizCurrentQuestion = new Map();
const quizQuestionAnswers = new Map();

/* ================= Helpers ================= */
/* ===================== Helpers ===================== */
const withTimestamp = (payload) => ({ ts: Date.now(), ...payload });

function addUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
}

function removeUserSocket(userId, socketId) {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
}

function rememberUserRoom(userId, questId) {
  if (!userRooms.has(userId)) userRooms.set(userId, new Set());
  userRooms.get(userId).add(String(questId));
}

function rememberQuizRoom(userId, quizId) {
  if (!userRooms.has(userId)) userRooms.set(userId, new Set());
  userRooms.get(userId).add(String(quizId));
}

function questRememberUserRoom(userId, quizId) {
  if (!userRooms.has(userId)) userRooms.set(userId, new Set());
  userRooms.get(userId).add(String(quizId));
}

function restoreRoomsAndMappings(io, socket, userId) {
  const rooms = userRooms.get(userId);
  if (!rooms) return;

  rooms.forEach((roomId) => {
    socket.join(roomId);

    // Try to restore both quiz and quest connections
    try {
      // Check if this is a quiz room
      if (quizRunningStatus.has(roomId)) {
        joinUserQuiz(socket.id, userId, roomId);
        if (!quizActiveParticipants.has(roomId))
          quizActiveParticipants.set(roomId, new Set());
        quizActiveParticipants.get(roomId).add(userId);

        io.to(roomId).emit(
          "connectionStatus",
          withTimestamp({
            type: "quiz",
            quizId: roomId,
            userId,
            status: "reconnected",
            quizRunningStatus: quizRunningStatus.get(roomId) || "pending",
            currentQuestion: quizCurrentQuestion.get(roomId) || {
              questionId: null,
            },
          })
        );
      }
      // Check if this is a quest room
      else if (questRunningStatus.has(roomId)) {
        joinUserQuest(socket.id, userId, roomId);
        if (!questActiveParticipants.has(roomId))
          questActiveParticipants.set(roomId, new Set());
        questActiveParticipants.get(roomId).add(userId);

        io.to(roomId).emit(
          "connectionStatus",
          withTimestamp({
            type: "quest",
            questId: roomId,
            userId,
            status: "reconnected",
            questRunningStatus: questRunningStatus.get(roomId) || "pending",
            currentQuestion: questCurrentQuestion.get(roomId) || {
              questionId: null,
            },
          })
        );
      }
    } catch (e) {
      console.error("Error restoring room:", e);
    }
  });
}

// function restoreRoomsAndMappings(io, socket, userId) {
//   const rooms = userRooms.get(userId);
//   if (!rooms) return;

//   rooms.forEach((questId) => {
//     socket.join(questId);
//     try {
//       joinUserQuest(socket.id, userId, questId);
//     } catch (e) {}

//     if (!questActiveParticipants.has(questId))
//       questActiveParticipants.set(questId, new Set());
//     questActiveParticipants.get(questId).add(userId);

//     io.to(questId).emit(
//       "connectionStatus",
//       withTimestamp({
//         type: "quest",
//         questId,
//         userId,
//         status: "reconnected",
//         questRunningStatus: questRunningStatus.get(questId) || "pending",
//         currentQuestion: questCurrentQuestion.get(questId) || {
//           questionId: null,
//         },
//       })
//     );
//   });
// }
// function quizrestoreRoomsAndMappings(io, socket, userId) {
//   const rooms = userRooms.get(userId);
//   if (!rooms) return;

//   rooms.forEach((questId) => {
//     socket.join(questId);
//     try {
//       joinUserQuest(socket.id, userId, questId);
//     } catch (e) {}

//     if (!questActiveParticipants.has(questId))
//       questActiveParticipants.set(questId, new Set());
//     questActiveParticipants.get(questId).add(userId);

//     io.to(questId).emit(
//       "connectionStatus",
//       withTimestamp({
//         type: "quest",
//         questId,
//         userId,
//         status: "reconnected",
//         questRunningStatus: questRunningStatus.get(questId) || "pending",
//         currentQuestion: questCurrentQuestion.get(questId) || {
//           questionId: null,
//         },
//       })
//     );
//   });
// }

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
  path: "/socket.io",
  transports: ["websocket", "polling"],
  pingInterval: 25_000,
  pingTimeout: 30_000,
  connectTimeout: 10_000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60_000,
    skipMiddlewares: true,
  },
});

// Helper to test if a socket is currently connected
const isSocketConnected = (socketId) => !!io.sockets.sockets.get(socketId);

const toQuestKey = (id) => String(id);
const makeCurrent = (questionId, timeObj) => {
  const qid = Number.parseInt(String(questionId), 10);
  return {
    questionId: qid,
    status: `updated - ${qid}`,
    questiQsenStartTime: `${timeObj?.questiQsenStartTime}`,
    questiQsenTime: `${timeObj?.questiQsenTime}`,
    questiQsenLateStartTime: `${timeObj?.questiQsenLateStartTime}`,
  };
};
const toQuizKey = (id) => String(id);
const makeQuizCurrent = (questionId, timeObj) => {
  const qid = Number.parseInt(String(questionId), 10);
  return {
    questionId: qid,
    status: `updated - ${qid}`,
    quizQsenStartTime: `${timeObj?.quizQsenStartTime}`,
    quizQsenTime: `${timeObj?.quizQsenTime}`,
    quizQsenLateStartTime: `${timeObj?.quizQsenLateStartTime}`,
  };
};

io.on("connection", (socket) => {
  const auth = socket.handshake.auth || {};
  const userId = auth.userId ? String(auth.userId) : `temp-${socket.id}`;
  const userName = auth.userName || userId;
  socket.data.userId = userId;
  socket.data.userName = userName;
  addUserSocket(userId, socket.id);
  restoreRoomsAndMappings(io, socket, userId);

  // Notify creator privately right before disconnect completes
  socket.on("disconnecting", () => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    if (user.quizId) {
      const creator = quizCreators.get(user.quizId);
      if (creator && creator.userId === user.userId) {
        socket.emit(
          "creatorConnectionStatus",
          withTimestamp({
            type: "quiz",
            quizId: user.quizId,
            userId: user.userId,
            status: "disconnected",
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
          })
        );
      }
    }
    if (user.questId) {
      const creatorQ = questCreators.get(user.questId);
      if (creatorQ && creatorQ.userId === user.userId) {
        socket.emit(
          "creatorConnectionStatus",
          withTimestamp({
            type: "quest",
            questId: user.questId,
            userId: user.userId,
            status: "disconnected",
            questRunningStatus:
              questRunningStatus.get(user.questId) || "pending",
          })
        );
      }
    }
  });
  console.log(`New connection: ${socket.id}`);

  // 1. Quiz Created Listener
  socket.on(
    "createQuiz",
    (quizId, userId, quizTitle, userName, scoringParams) => {
      console.log(`Quiz created: ${quizId}`);
      // createQuiz(quizId, scoringParams);

      // Use provided title/name, else fallback to IDs
      const displayQuiz = quizTitle || quizId;
      const displayUser = userName || userId;
      const user = joinUserQuiz(socket.id, userId, quizId);

      const status = "pending";
      quizRunningStatus.set(quizId, status);

      // Save quiz creator for targeted notifications
      quizCreators.set(quizId, {
        socketId: socket.id,
        userId,
        userName: displayUser,
      });

      rememberQuizRoom(userId, quizId);
      socket.join(quizId);
      console.log(user);

      socket.emit(
        "quizCreated",
        withTimestamp({
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
        })
      );

      // Connection status for room
      socket.broadcast.to(user.quizId).emit(
        "connectionStatus",
        withTimestamp({
          type: "quiz",
          quizId: user.quizId,
          userId: user.userId,
          status: "connected",
          quizRunningStatus: status,
        })
      );

      // Private status for creator self
      const creator = quizCreators.get(user.quizId);
      if (creator && creator.userId === user.userId) {
        socket.emit(
          "creatorConnectionStatus",
          withTimestamp({
            type: "quiz",
            quizId: user.quizId,
            userId: user.userId,
            status: "connected",
            quizRunningStatus: status,
          })
        );
      }
    }
  );

  // 2. Quiz Join Listener
  socket.on("joinQuiz", (quizId, userId, quizTitle, userName) => {
    const displayUser = userName || userId;
    const displayQuiz = quizTitle || quizId;
    const user = joinUserQuiz(socket.id, userId, quizId);

    rememberQuizRoom(userId, quizId);
    socket.join(quizId);

    const status = questRunningStatus.get(quizId) || "pending";

    if (!quizParticipants.has(quizId)) quizParticipants.set(quizId, new Set());
    quizParticipants.get(quizId).add(userId);

    const participantCount = quizParticipants.get(quizId).size;
    const participantUserIds = Array.from(quizParticipants.get(quizId));

    if (!quizParticipantDetails.has(quizId))
      quizParticipantDetails.set(quizId, new Map());

    quizParticipantDetails.get(quizId).set(userId, {
      socketId: user.id,
      userId: user.userId,
      quizId: user.quizId,
      userName: displayUser,
      quizTitle: displayQuiz,
    });
    const participantUsers = Array.from(
      quizParticipantDetails.get(quizId).values()
    );

    if (!quizActiveParticipants.has(quizId))
      quizActiveParticipants.set(quizId, new Set());

    quizActiveParticipants.get(quizId).add(userId);

    const activeSet = quizActiveParticipants.get(quizId);
    const activeCount = activeSet.size;
    const activeUserIds = Array.from(activeSet);
    const activeUsers = participantUsers.filter((p) => activeSet.has(p.userId));

    const currentQuestion = quizCurrentQuestion.get(quizId) || {
      questionId: null,
    };

    socket.emit(
      "quizJoined",
      withTimestamp({
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
        currentQuestion,
      })
    );

    socket.broadcast.to(user.quizId).emit(
      "participantJoined",
      withTimestamp({
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
        currentQuestion,
      })
    );

    socket.broadcast.to(user.quizId).emit(
      "connectionStatus",
      withTimestamp({
        type: "quiz",
        quizId: user.quizId,
        userId: user.userId,
        status: "connected",
        quizRunningStatus: status,
        currentQuestion,
      })
    );

    const creator = questCreators.get(user.quizId);
    if (creator && creator.userId === user.userId) {
      socket.emit(
        "creatorConnectionStatus",
        withTimestamp({
          type: "quiz",
          quizId: user.quizId,
          userId: user.userId,
          status: "connected",
          quizRunningStatus: status,
          currentQuestion,
        })
      );
    }
  });

  // 3. Start Quiz Listener
  socket.on("startQuiz", (quizId, uId, quizTitle, uName) => {
    // console.log(`Starting quiz: ${quizId}`);

    const displayQuiz = quizTitle || quizId;
    const displayUser = uName || uId;
    const user = joinUserQuiz(socket.id, uId, quizId);

    const status = "started";
    quizRunningStatus.set(quizId, status);

    rememberQuizRoom(uId, quizId);
    socket.join(quizId);

    const currentQuestion = quizCurrentQuestion.get(quizId) || {
      questionId: null,
    };

    // const creator = questCreators.get(user.quizId);
    // if (creator && creator.userId === user.userId) {
    //   socket.emit(
    //     "quizStartedAll",
    //     withTimestamp({
    // type: "quest",
    // quizId: user.quizId,
    // userId: user.userId,
    // status: "connected",
    // displayQuiz,
    // displayUser,
    // questRunningStatus: status,
    // quizRunningStatus: status,
    // currentQuestion,
    //     })
    //   );
    // }

    socket.emit(
      "quizStartedAll",
      withTimestamp({
        type: "quest",
        quizId: user.quizId,
        userId: user.userId,
        status: "connected",
        displayQuiz,
        displayUser,
        questRunningStatus: status,
        quizRunningStatus: status,
        currentQuestion,
      })
    );
    socket.emit(
      "quizStarted",
      withTimestamp({
        quizId,
        displayQuiz,
        questRunningStatus: status,
        currentQuestion,
        message: `You started quest ${displayQuiz}`,
      })
    );

    // socket.broadcast.to(user.questId).emit(
    //   "quizStartedAll",
    //   withTimestamp({
    //     quizId,
    //     displayQuest,
    //     questRunningStatus: status,
    //     currentQuestion,
    //     message: `Quest ${displayQuest} has started!`,
    //   })
    // );

    // Emit to ALL participants in the quiz room (including the starter)
    // socket.broadcast.to(user.quizId).emit(
    //   "quizStartedAll",
    //   withTimestamp({
    //     quizId: quizId,
    //     displayQuiz: displayQuiz,
    //     quizRunningStatus: status,
    //     message: `Quiz ${displayQuiz} has started!`,
    //   })
    // );
  });

  // 4. Answer Submission Listener (Quiz)
  socket.on(
    "submitAnswer",
    (
      userId,
      questionId,
      userName,
      questionTitle,
      questionType,
      selectedOption,
      optionType
    ) => {
      // console.log(`Answer from User ${userId} for Question ${questionId}`);

      const user = getCurrentUser(socket.id);
      const displayUser = userName || userId;
      const displayQuestion = questionTitle || questionId;
      // console.log(user);

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
        message: `Answer processed for ${displayUser} on ${displayQuestion}`,
      };
      if (isTextType) {
        processedPayload.text_answer = selectedOption;
      } else {
        processedPayload.selected_option = selectedOption;
      }
      processedPayload.quizRunningStatus =
        quizRunningStatus.get(user.quizId) || "pending";
      socket.emit("answerProcessed", withTimestamp(processedPayload));

      // Notify only the quiz creator with aggregated/typed details
      const creator = quizCreators.get(user.quizId);
      if (creator && creator.socketId) {
        if (isTextType) {
          // For text-based answers, send this user's answer with details
          const answersMap =
            quizQuestionAnswers.get(user.quizId)?.get(questionId) || new Map();
          const textAnswers = Array.from(answersMap.values())
            .filter(
              (ans) =>
                ans.text_answer !== undefined &&
                ans.text_answer !== null &&
                ans.text_answer !== ""
            )
            .map((ans) => ({
              userId: ans.userId,
              userName: ans.userName,
              value: ans.text_answer,
            }));

          io.to(creator.socketId).emit(
            "answerSubmittedToCreator",
            withTimestamp({
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
              quizRunningStatus:
                quizRunningStatus.get(user.quizId) || "pending",
              message: `User ${displayUser} submitted answer for ${displayQuestion}`,
            })
          );
        } else {
          // For option-based answers, aggregate counts and user lists per option index
          const answersMap =
            quizQuestionAnswers.get(user.quizId)?.get(questionId) || new Map();
          const optionSelections = {};

          Array.from(answersMap.values()).forEach((ans) => {
            const options = Array.isArray(ans.selected_option)
              ? ans.selected_option
              : [ans.selected_option];
            options
              .filter((o) => o !== undefined && o !== null && o !== "")
              .forEach((opt) => {
                const key = String(opt);
                if (!optionSelections[key]) {
                  optionSelections[key] = { count: 0, users: [] };
                }
                optionSelections[key].count += 1;
                optionSelections[key].users.push({
                  userId: ans.userId,
                  userName: ans.userName,
                });
              });
          });

          io.to(creator.socketId).emit(
            "answerSubmittedToCreator",
            withTimestamp({
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
              quizRunningStatus:
                quizRunningStatus.get(user.quizId) || "pending",
              message: `User ${displayUser} submitted answer for ${displayQuestion}`,
            })
          );
        }
      }
    }
  );

  // 5. Quiz Completion Listener
  socket.on("completeQuiz", (quizId, userId, quizTitle, userName) => {
    // console.log(`Quiz completion by User ${userId} for Quiz ${quizId}`);

    const user = getCurrentUser(socket.id);
    const displayQuiz = quizTitle || quizId;
    const displayUser = userName || userId;
    // console.log(user);

    // Remove from active set but keep total participants unchanged
    let activeSet = quizActiveParticipants.get(user.quizId);
    if (activeSet) {
      activeSet.delete(user.userId);
    }
    const detailsMap = quizParticipantDetails.get(user.quizId) || new Map();
    const participantUsers = Array.from(detailsMap.values());
    const activeCount = activeSet ? activeSet.size : 0;
    const activeUserIds = activeSet ? Array.from(activeSet) : [];
    const activeUsers = participantUsers.filter(
      (p) => activeSet && activeSet.has(p.userId)
    );

    // Emit to completer
    socket.emit(
      "quizCompleted",
      withTimestamp({
        quizId: quizId,
        userId: user.userId,
        displayQuiz: displayQuiz,
        displayUser: displayUser,
        message: `${displayUser} completed the quiz ${displayQuiz}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
      })
    );

    // Broadcast to all participants
    socket.broadcast.to(user.quizId).emit(
      "quizCompletedAll",
      withTimestamp({
        quizId: quizId,
        userId: user.userId,
        displayQuiz: displayQuiz,
        displayUser: displayUser,
        message: `User ${displayUser} has completed the quiz ${displayQuiz}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
      })
    );
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
    const activeUsers = participantUsers.filter(
      (p) => activeSet && activeSet.has(p.userId)
    );

    // Emit to leaver
    socket.emit(
      "participantLeft",
      withTimestamp({
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
      })
    );

    // Broadcast to others
    socket.broadcast.to(user.quizId).emit(
      "participantLeftAll",
      withTimestamp({
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
      })
    );

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
    const activeUsers = participantUsers.filter(
      (p) => activeSet && activeSet.has(p.userId)
    );

    // Emit to abandoner
    socket.emit(
      "participantAbandoned",
      withTimestamp({
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
      })
    );

    // Broadcast to others
    socket.broadcast.to(user.quizId).emit(
      "participantAbandonedAll",
      withTimestamp({
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
      })
    );
    console.log(`User ${displayUser} abandoned Quiz ${displayQuiz}`);
  });

  // 8. Quiz Leaderboard Update Listener
  socket.on(
    "quizLeaderboard",
    (quizId, userId, quizTitle, userName, leaderboardData) => {
      console.log(`Leaderboard update for Quiz ${quizId} by User ${userId}`);

      const user = getCurrentUser(socket.id);
      const displayQuiz = quizTitle || quizId;
      const displayUser = userName || userId;
      console.log(user);

      // Emit to updater
      socket.emit(
        "leaderboardUpdated",
        withTimestamp({
          quizId: quizId,
          userId: user.userId,
          displayQuiz: displayQuiz,
          displayUser: displayUser,
          leaderboardData: leaderboardData,
          message: `You updated the leaderboard for quiz ${displayQuiz}`,
        })
      );

      // Broadcast to all participants
      socket.broadcast.to(user.quizId).emit(
        "leaderboardUpdatedAll",
        withTimestamp({
          quizId: quizId,
          userId: user.userId,
          displayQuiz: displayQuiz,
          displayUser: displayUser,
          leaderboardData: leaderboardData,
          message: `Leaderboard updated for quiz ${displayQuiz} by ${displayUser}`,
        })
      );
    }
  );

  // 9. Question Change Listener
  //   socket.on(
  //   "changeQuestionQuiz",
  //   (
  //     quizId,
  //     questionId,
  //     quizTitle,
  //     questionTitle,
  //     quizQsenStartTime,
  //     quizQsenTime,
  //     quizQsenLateStartTime
  //   ) => {
  //     let user = getCurrentUser(socket.id);
  //     const displayQuiz = quizTitle || quizId;
  //     const displayQuizion = questionTitle || questionId;

  //     // Handle case where user is not found
  //     if (!user) {
  //       const tempUserId = `temp-${socket.id}`;
  //       user = joinUserQuiz(socket.id, tempUserId, quizId);
  //     }

  //     // Now we can safely use user.userId
  //     const userId = user.userId;
  //     if (!quizCreators.get(quizId)) {
  //       quizCreators.set(quizId, {
  //         socketId: socket.id,
  //         userId: userId,
  //         userName: userId, 
  //       });
  //     }
  //     const timeObj = {
  //       quizQsenStartTime,
  //       quizQsenTime,
  //       quizQsenLateStartTime,
  //     };
  //     // const questKey = toQuizKey(quizId);
  //     // const current = makeQuizCurrent(questionId, timeObj);
  //     // quizCurrentQuestion.set(questKey, current);

  //     const current = makeQuizCurrent(questionId, timeObj);
  //   quizCurrentQuestion.set(quizId, current); 

  //     const displayUser = userId;

  //     const status = "started";
  //     quizRunningStatus.set(quizId, status);
  //     // Save quest creator for targeted notifications
  //     quizCreators.set(quizId, {
  //       socketId: socket.id,
  //       userId,
  //       userName: displayUser,
  //     });

  //     rememberUserRoom(userId, quizId);
  //     socket.join(quizId);

  //     // Get current question for this quest
  //     const currentQuestion = quizCurrentQuestion.get(quizId) || {
  //       questionId: null,
  //     };

  //     // Private status for creator self
  //     const creator = quizCreators.get(user.quizId);
  //     if (creator && creator.userId === user.userId) {
  //       socket.emit(
  //         "quizStartedAll",
  //         withTimestamp({
  //           type: "quiz",
  //           quizId: user.quizId,
  //           userId: user.userId,
  //           status: "connected",
  //           quizRunningStatus: status,
  //           currentQuestion: currentQuestion,

  //           quizQsenStartTime: quizQsenStartTime,
  //           quizQsenTime: quizQsenTime,
  //           quizQsenLateStartTime: quizQsenLateStartTime,
  //         })
  //       );
  //     }

  //     // Emit to changer
  //     socket.emit(
  //       "questionChangedQuiz",
  //       withTimestamp({
  //         quizId: quizId,
  //         displayQuiz: displayQuiz,
  //         questionId: questionId,
  //         displayQuizion: displayQuizion,
  //         message: `You changed to question ${displayQuizion} in quest ${displayQuiz}`,

  //         quizQsenStartTime: quizQsenStartTime,
  //         quizQsenTime: quizQsenTime,
  //         quizQsenLateStartTime: quizQsenLateStartTime,
  //       })
  //     );

  //     // Emit to ALL users in the quest room (including creator and participants)
  //     io.to(user.quizId).emit(
  //       "questionChangedQuizAll",
  //       withTimestamp({
  //         quizId: quizId,
  //         displayQuiz: displayQuiz,
  //         questionId: questionId,
  //         displayQuizion: displayQuizion,
  //         message: `Question changed to ${displayQuizion} in quest ${displayQuiz}`,

  //         quizQsenStartTime: quizQsenStartTime,
  //         quizQsenTime: quizQsenTime,
  //         quizQsenLateStartTime: quizQsenLateStartTime,
  //       })
  //     );
  //   }
  // );

socket.on(
  "changeQuestionQuiz",
  (
    quizId,
    questionId,
    quizTitle,
    questionTitle,
    quizQsenStartTime,
    quizQsenTime,
    quizQsenLateStartTime
  ) => {

    let user = getCurrentUser(socket.id);

    const displayQuiz = quizTitle || quizId;
    const displayQuestion = questionTitle || questionId;

    // If user not found → create temporary join like Quest
    if (!user) {
      const tempUserId = `temp-${socket.id}`;
      user = joinUserQuiz(socket.id, tempUserId, quizId);
    }

    const userId = user.userId;

    console.log("User changing quiz question:", user);

    // Set quiz creator if not set
    if (!quizCreators.get(quizId)) {
      quizCreators.set(quizId, {
        socketId: socket.id,
        userId: userId,
        userName: userId,
      });
    }

    // Prepare timer object
    const timeObj = {
      quizQsenStartTime,
      quizQsenTime,
      quizQsenLateStartTime,
    };

    // Set current question for this quiz
    const current = makeQuizCurrent(questionId, timeObj);
    quizCurrentQuestion.set(quizId, current);

    const status = "started";
    quizRunningStatus.set(quizId, status);

    // Save creator
    quizCreators.set(quizId, {
      socketId: socket.id,
      userId,
      userName: userId,
    });

    rememberUserRoom(userId, quizId);
    socket.join(quizId);

    // Get current question
    const currentQuestion =
      quizCurrentQuestion.get(quizId) || { questionId: null };

    // Private message to creator only
    const creator = quizCreators.get(quizId);
    if (creator && creator.userId === user.userId) {
      socket.emit(
        "quizStartedAll",
        withTimestamp({
          type: "quiz",
          quizId,
          userId: user.userId,
          status: "connected",
          quizRunningStatus: status,
          currentQuestion,

          quizQsenStartTime,
          quizQsenTime,
          quizQsenLateStartTime,
        })
      );
    }

    // Send message ONLY to changer
    socket.emit(
      "questionChangedQuiz",
      withTimestamp({
        quizId,
        displayQuiz,
        questionId,
        displayQuestion,
        message: `You changed to question ${displayQuestion} in quiz ${displayQuiz}`,

        quizQsenStartTime,
        quizQsenTime,
        quizQsenLateStartTime,
      })
    );

    // Broadcast to ALL users in the quiz room
    io.to(user.quizId).emit(
      "questionChangedQuizAll",
      withTimestamp({
        quizId,
        displayQuiz,
        questionId,
        displayQuestion,
        message: `Question changed to ${displayQuestion} in quiz ${displayQuiz}`,

        quizQsenStartTime,
        quizQsenTime,
        quizQsenLateStartTime,
      })
    );
  }
);



 

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
    socket.emit(
      "quizEnded",
      withTimestamp({
        quizId: quizId,
        displayQuiz: displayQuiz,
        quizRunningStatus: status,
        message: `You ended the quiz ${displayQuiz}`,
      })
    );

    // Emit to ALL participants in the quiz room (including the ender)
    socket.broadcast.to(user.quizId).emit(
      "quizEndedAll",
      withTimestamp({
        quizId: quizId,
        displayQuiz: displayQuiz,
        quizRunningStatus: status,
        message: `Quiz ${displayQuiz} has ended`,
      })
    );
  });

  // 11. Error Handling Listener
  socket.on("errorEvent", (errorMessage) => {
    console.error(`Error from ${socket.id}: ${errorMessage}`);
    socket.emit(
      "errorResponse",
      withTimestamp({ message: `Error received: ${errorMessage}` })
    );
  });

  // ##############  QUEST AREA #############

  // 12. Create Quest Listener
  socket.on(
    "createQuest",
    (questId, userId, questTitle, userName, scoringParams) => {
      console.log(`Quest created: ${questId}`);
      // createQuest(questId, scoringParams);

      // Use provided title/name, else fallback to IDs
      const displayQuest = questTitle || questId;
      const displayUser = userName || userId;
      const user = joinUserQuest(socket.id, userId, questId);

      const status = "pending";
      questRunningStatus.set(questId, status);

      // Save quest creator for targeted notifications
      questCreators.set(questId, {
        socketId: socket.id,
        userId,
        userName: displayUser,
      });

      rememberUserRoom(userId, questId);
      socket.join(questId);
      console.log(user);

      socket.emit(
        "questCreated",
        withTimestamp({
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
        })
      );

      // Connection status for room
      socket.broadcast.to(user.questId).emit(
        "connectionStatus",
        withTimestamp({
          type: "quest",
          questId: user.questId,
          userId: user.userId,
          status: "connected",
          questRunningStatus: status,
        })
      );

      // Private status for creator self
      const creator = questCreators.get(user.questId);
      if (creator && creator.userId === user.userId) {
        socket.emit(
          "creatorConnectionStatus",
          withTimestamp({
            type: "quest",
            questId: user.questId,
            userId: user.userId,
            status: "connected",
            questRunningStatus: status,
          })
        );
      }
    }
  );

  socket.on("joinQuest", (questId, uId, questTitle, uName) => {
    const displayQuest = questTitle || questId;
    const displayUser = uName || uId;
    const user = joinUserQuest(socket.id, uId, questId);

    rememberUserRoom(uId, questId);
    socket.join(questId);

    const status = questRunningStatus.get(questId) || "pending";

    if (!questParticipants.has(questId))
      questParticipants.set(questId, new Set());
    questParticipants.get(questId).add(uId);
    const participantCount = questParticipants.get(questId).size;
    const participantUserIds = Array.from(questParticipants.get(questId));

    if (!questParticipantDetails.has(questId))
      questParticipantDetails.set(questId, new Map());
    questParticipantDetails.get(questId).set(uId, {
      socketId: user.id,
      userId: user.userId,
      questId: user.questId,
      userName: displayUser,
      questTitle: displayQuest,
    });
    const participantUsers = Array.from(
      questParticipantDetails.get(questId).values()
    );

    if (!questActiveParticipants.has(questId))
      questActiveParticipants.set(questId, new Set());
    questActiveParticipants.get(questId).add(uId);
    const activeSet = questActiveParticipants.get(questId);
    const activeCount = activeSet.size;
    const activeUserIds = Array.from(activeSet);
    const activeUsers = participantUsers.filter((p) => activeSet.has(p.userId));

    const currentQuestion = questCurrentQuestion.get(questId) || {
      questionId: null,
    };

    socket.emit(
      "questJoined",
      withTimestamp({
        socketId: user.id,
        userId: user.userId,
        questId: user.questId,
        displayQuest,
        displayUser,
        welcome: `Welcome ${displayUser} to quest ${displayQuest}`,
        participantCount,
        participantUserIds,
        participantUsers,
        activeCount,
        activeUserIds,
        activeUsers,
        questRunningStatus: status,
        currentQuestion,
      })
    );

    socket.broadcast.to(user.questId).emit(
      "participantJoinedQuest",
      withTimestamp({
        socketId: user.id,
        questId: user.questId,
        userId: user.userId,
        displayQuest,
        displayUser,
        join: `User ${displayUser} joined to quest ${displayQuest}`,
        participantCount,
        participantUserIds,
        participantUsers,
        activeCount,
        activeUserIds,
        activeUsers,
        questRunningStatus: status,
        currentQuestion,
      })
    );

    socket.broadcast.to(user.questId).emit(
      "connectionStatus",
      withTimestamp({
        type: "quest",
        questId: user.questId,
        userId: user.userId,
        status: "connected",
        questRunningStatus: status,
        currentQuestion,
      })
    );

    const creator = questCreators.get(user.questId);
    if (creator && creator.userId === user.userId) {
      socket.emit(
        "creatorConnectionStatus",
        withTimestamp({
          type: "quest",
          questId: user.questId,
          userId: user.userId,
          status: "connected",
          questRunningStatus: status,
          currentQuestion,
        })
      );
    }
  });

  socket.on("startQuest", (questId, uId, questTitle, uName) => {
    const displayQuest = questTitle || questId;
    const displayUser = uName || uId;
    const user = joinUserQuest(socket.id, uId, questId);

    const status = "started";
    questRunningStatus.set(questId, status);
    questCreators.set(questId, {
      socketId: socket.id,
      userId: uId,
      userName: displayUser,
    });

    rememberUserRoom(uId, questId);
    socket.join(questId);

    const currentQuestion = questCurrentQuestion.get(questId) || {
      questionId: null,
    };

    const creator = questCreators.get(user.questId);
    if (creator && creator.userId === user.userId) {
      socket.emit(
        "questStartedAll",
        withTimestamp({
          type: "quest",
          questId: user.questId,
          userId: user.userId,
          status: "connected",
          questRunningStatus: status,
          currentQuestion,
        })
      );
    }

    socket.emit(
      "questStarted",
      withTimestamp({
        questId,
        displayQuest,
        questRunningStatus: status,
        currentQuestion,
        message: `You started quest ${displayQuest}`,
      })
    );

    socket.broadcast.to(user.questId).emit(
      "questStartedAll",
      withTimestamp({
        questId,
        displayQuest,
        questRunningStatus: status,
        currentQuestion,
        message: `Quest ${displayQuest} has started!`,
      })
    );
  });

  // 15. Task Submission Listener (Quest)
  socket.on(
    "submitTask",
    (
      userId,
      questionId,
      userName,
      questionTitle,
      questionType,
      selectedOption,
      optionType
    ) => {
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
        message: `Answer processed for ${displayUser} on ${displayQuestion}`,
      };
      if (isTextType) {
        processedPayload.text_answer = selectedOption;
      } else {
        processedPayload.selected_option = selectedOption;
      }
      processedPayload.questRunningStatus =
        questRunningStatus.get(user.questId) || "pending";
      socket.emit("answerProcessedQuest", withTimestamp(processedPayload));

      // Notify only the quest creator with aggregated/typed details
      const creator = questCreators.get(user.questId);
      if (creator && creator.socketId) {
        if (isTextType) {
          // For text-based answers, send this user's answer with details
          const answersMap =
            questQuestionAnswers.get(user.questId)?.get(questionId) ||
            new Map();
          const textAnswers = Array.from(answersMap.values())
            .filter(
              (ans) =>
                ans.text_answer !== undefined &&
                ans.text_answer !== null &&
                ans.text_answer !== ""
            )
            .map((ans) => ({
              userId: ans.userId,
              userName: ans.userName,
              value: ans.text_answer,
            }));

          io.to(creator.socketId).emit(
            "answerSubmittedToQuestCreator",
            withTimestamp({
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
              questRunningStatus:
                questRunningStatus.get(user.questId) || "pending",
              message: `User ${displayUser} submitted answer for ${displayQuestion}`,
            })
          );
        } else {
          // For option-based answers, aggregate counts and user lists per option index
          const answersMap =
            questQuestionAnswers.get(user.questId)?.get(questionId) ||
            new Map();
          const optionSelections = {};

          Array.from(answersMap.values()).forEach((ans) => {
            const options = Array.isArray(ans.selected_option)
              ? ans.selected_option
              : [ans.selected_option];
            options
              .filter((o) => o !== undefined && o !== null && o !== "")
              .forEach((opt) => {
                const key = String(opt);
                if (!optionSelections[key]) {
                  optionSelections[key] = { count: 0, users: [] };
                }
                optionSelections[key].count += 1;
                optionSelections[key].users.push({
                  userId: ans.userId,
                  userName: ans.userName,
                });
              });
          });

          io.to(creator.socketId).emit(
            "answerSubmittedToQuestCreator",
            withTimestamp({
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
              questRunningStatus:
                questRunningStatus.get(user.questId) || "pending",
              message: `User ${displayUser} submitted answer for ${displayQuestion}`,
            })
          );
        }
      }
    }
  );

  // 16. Quest Completion Listener
  socket.on("completeQuest", (questId, userId, questTitle, userName) => {
    console.log(`Quest completion by User ${userId} for Quest ${questId}`);

    const user = getCurrentUser(socket.id);
    const displayQuest = questTitle || questId;
    const displayUser = userName || userId;
    console.log(user);

    // Remove from active set but keep total participants unchanged
    const targetQuestId = questId || (user && user.questId);
    let activeSet = questActiveParticipants.get(targetQuestId);
    if (activeSet) {
      activeSet.delete(user.userId);
    }
    // Also remove from participants/details for this quest
    const participantsSet = questParticipants.get(targetQuestId);
    if (participantsSet) {
      participantsSet.delete(user.userId);
    }
    const detailsMap = questParticipantDetails.get(targetQuestId) || new Map();
    if (questParticipantDetails.get(targetQuestId)) {
      detailsMap.delete(user.userId);
    }
    const participantUsers = Array.from(detailsMap.values());
    const activeCount = activeSet ? activeSet.size : 0;
    const activeUserIds = activeSet ? Array.from(activeSet) : [];
    const activeUsers = participantUsers.filter(
      (p) => activeSet && activeSet.has(p.userId)
    );

    // Emit to completer
    socket.emit(
      "questCompleted",
      withTimestamp({
        questId: questId,
        userId: user.userId,
        displayQuest: displayQuest,
        displayUser: displayUser,
        message: `${displayUser} completed the quest ${displayQuest}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        questRunningStatus: questRunningStatus.get(targetQuestId) || "pending",
      })
    );

    // Broadcast to all participants
    socket.broadcast.to(targetQuestId).emit(
      "questCompletedAll",
      withTimestamp({
        questId: questId,
        userId: user.userId,
        displayQuest: displayQuest,
        displayUser: displayUser,
        message: `User ${displayUser} has completed the quest ${displayQuest}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        questRunningStatus: questRunningStatus.get(targetQuestId) || "pending",
      })
    );
  });

  // 17. Quest Leave Listener
  socket.on("leaveQuest", (questId, userId, questTitle, userName) => {
    console.log(`Leave attempt: User ${userId} from Quest ${questId}`);

    const user = getCurrentUser(socket.id);
    const displayQuest = questTitle || questId;
    const displayUser = userName || userId;
    console.log(user);

    // Remove from active set but keep total participants unchanged
    const targetQuestId = questId || (user && user.questId);
    let activeSet = questActiveParticipants.get(targetQuestId);
    if (activeSet) {
      activeSet.delete(user.userId);
    }
    // Also remove from participants and details
    const participantsSet = questParticipants.get(targetQuestId);
    if (participantsSet) {
      participantsSet.delete(user.userId);
    }
    const detailsMap = questParticipantDetails.get(targetQuestId) || new Map();
    if (questParticipantDetails.get(targetQuestId)) {
      detailsMap.delete(user.userId);
    }
    const participantUsers = Array.from(detailsMap.values());
    const activeCount = activeSet ? activeSet.size : 0;
    const activeUserIds = activeSet ? Array.from(activeSet) : [];
    const activeUsers = participantUsers.filter(
      (p) => activeSet && activeSet.has(p.userId)
    );

    // Emit to leaver
    socket.emit(
      "participantLeftQuest",
      withTimestamp({
        questId: questId,
        userId: user.userId,
        displayQuest: displayQuest,
        displayUser: displayUser,
        action: "left",
        message: `You have left the quest ${displayQuest}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        questRunningStatus: questRunningStatus.get(targetQuestId) || "pending",
      })
    );

    // Broadcast to others
    socket.broadcast.to(targetQuestId).emit(
      "participantLeftQuestAll",
      withTimestamp({
        questId: questId,
        userId: user.userId,
        displayQuest: displayQuest,
        displayUser: displayUser,
        action: "left",
        message: `User ${displayUser} has left the quest ${displayQuest}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        questRunningStatus: questRunningStatus.get(targetQuestId) || "pending",
      })
    );

    // Ensure socket leaves the room
    try {
      socket.leave(targetQuestId);
    } catch (_) {}

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
    const targetQuestId = questId || (user && user.questId);
    let activeSet = questActiveParticipants.get(targetQuestId);
    if (activeSet) {
      activeSet.delete(user.userId);
    }
    // Also remove from participants/details for this quest
    const participantsSet = questParticipants.get(targetQuestId);
    if (participantsSet) {
      participantsSet.delete(user.userId);
    }
    const detailsMap = questParticipantDetails.get(targetQuestId) || new Map();
    if (questParticipantDetails.get(targetQuestId)) {
      detailsMap.delete(user.userId);
    }
    const participantUsers = Array.from(detailsMap.values());
    const activeCount = activeSet ? activeSet.size : 0;
    const activeUserIds = activeSet ? Array.from(activeSet) : [];
    const activeUsers = participantUsers.filter(
      (p) => activeSet && activeSet.has(p.userId)
    );

    // Emit to abandoner
    socket.emit(
      "participantAbandonedQuest",
      withTimestamp({
        questId: questId,
        userId: user.userId,
        displayQuest: displayQuest,
        displayUser: displayUser,
        action: "abandoned",
        message: `You have abandoned the quest ${displayQuest}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        questRunningStatus: questRunningStatus.get(targetQuestId) || "pending",
      })
    );

    // Broadcast to others
    socket.broadcast.to(targetQuestId).emit(
      "participantAbandonedQuestAll",
      withTimestamp({
        questId: questId,
        userId: user.userId,
        displayQuest: displayQuest,
        displayUser: displayUser,
        action: "abandoned",
        message: `User ${displayUser} has abandoned the quest ${displayQuest}`,
        activeCount: activeCount,
        activeUserIds: activeUserIds,
        activeUsers: activeUsers,
        questRunningStatus: questRunningStatus.get(targetQuestId) || "pending",
      })
    );
    // Ensure socket leaves the room
    try {
      socket.leave(targetQuestId);
    } catch (_) {}
    console.log(`User ${displayUser} abandoned Quest ${displayQuest}`);
  });

  // 19. Quest Leaderboard Update Listener
  socket.on(
    "questLeaderboard",
    (questId, userId, questTitle, userName, leaderboardData) => {
      console.log(`Leaderboard update for Quest ${questId} by User ${userId}`);

      const user = getCurrentUser(socket.id);
      const displayQuest = questTitle || questId;
      const displayUser = userName || userId;
      console.log(user);

      // Emit to updater
      socket.emit(
        "leaderboardUpdatedQuest",
        withTimestamp({
          questId: questId,
          userId: user.userId,
          displayQuest: displayQuest,
          displayUser: displayUser,
          leaderboardData: leaderboardData,
          message: `You updated the leaderboard for quest ${displayQuest}`,
        })
      );

      // Broadcast to all participants
      socket.broadcast.to(user.questId).emit(
        "leaderboardUpdatedQuestAll",
        withTimestamp({
          questId: questId,
          userId: user.userId,
          displayQuest: displayQuest,
          displayUser: displayUser,
          leaderboardData: leaderboardData,
          message: `Leaderboard updated for quest ${displayQuest} by ${displayUser}`,
        })
      );
    }
  );

  // 20. Question Change Listener
  socket.on(
    "changeQuestionQuest",
    (
      questId,
      questionId,
      questTitle,
      questionTitle,
      questiQsenStartTime,
      questiQsenTime,
      questiQsenLateStartTime
    ) => {
      let user = getCurrentUser(socket.id);
      const displayQuest = questTitle || questId;
      const displayQuestion = questionTitle || questionId;

      // Handle case where user is not found
      if (!user) {
        const tempUserId = `temp-${socket.id}`;
        user = joinUserQuest(socket.id, tempUserId, questId);
      }

      // Now we can safely use user.userId
      const userId = user.userId;

      console.log("User changing question:", user);

      // Set quest creator if not set (using userId we now have)
      if (!questCreators.get(questId)) {
        // Note: displayUser is not available, so we use userId as fallback
        questCreators.set(questId, {
          socketId: socket.id,
          userId: userId,
          userName: userId, // Using userId as userName since displayUser isn't available
        });
      }

      // Set the new value with status
      // questCurrentQuestion.set(questId, { questionId: questionId, status: 'updated - ' + questionId });
      const timeObj = {
        questiQsenStartTime,
        questiQsenTime,
        questiQsenLateStartTime,
      };
      const questKey = toQuestKey(questId);
      const current = makeCurrent(questionId, timeObj);
      questCurrentQuestion.set(questKey, current);

      const displayUser = userId;

      const status = "started";
      questRunningStatus.set(questId, status);
      // Save quest creator for targeted notifications
      questCreators.set(questId, {
        socketId: socket.id,
        userId,
        userName: displayUser,
      });

      rememberUserRoom(userId, questId);
      socket.join(questId);

      // Get current question for this quest
      const currentQuestion = questCurrentQuestion.get(questId) || {
        questionId: null,
      };

      // Private status for creator self
      const creator = questCreators.get(user.questId);
      if (creator && creator.userId === user.userId) {
        socket.emit(
          "questStartedAll",
          withTimestamp({
            type: "quest",
            questId: user.questId,
            userId: user.userId,
            status: "connected",
            questRunningStatus: status,
            currentQuestion: currentQuestion,

            questiQsenStartTime: questiQsenStartTime,
            questiQsenTime: questiQsenTime,
            questiQsenLateStartTime: questiQsenLateStartTime,
          })
        );
      }

      // Emit to changer
      socket.emit(
        "questionChangedQuest",
        withTimestamp({
          questId: questId,
          displayQuest: displayQuest,
          questionId: questionId,
          displayQuestion: displayQuestion,
          message: `You changed to question ${displayQuestion} in quest ${displayQuest}`,

          questiQsenStartTime: questiQsenStartTime,
          questiQsenTime: questiQsenTime,
          questiQsenLateStartTime: questiQsenLateStartTime,
        })
      );

      // Emit to ALL users in the quest room (including creator and participants)
      io.to(user.questId).emit(
        "questionChangedQuestAll",
        withTimestamp({
          questId: questId,
          displayQuest: displayQuest,
          questionId: questionId,
          displayQuestion: displayQuestion,
          message: `Question changed to ${displayQuestion} in quest ${displayQuest}`,

          questiQsenStartTime: questiQsenStartTime,
          questiQsenTime: questiQsenTime,
          questiQsenLateStartTime: questiQsenLateStartTime,
        })
      );
    }
  );

  // 21. Quest End Listener
  socket.on("endQuest", (questId, questTitle) => {
    console.log(`Ending quest: ${questId}`);
    const user = getCurrentUser(socket.id);
    const displayQuest = questTitle || questId;

    // Check if quest exists in any of the data structures
    const questExists =
      questParticipants.has(questId) ||
      questParticipantDetails.has(questId) ||
      questActiveParticipants.has(questId) ||
      questCreators.has(questId) ||
      questQuestionAnswers.has(questId) ||
      questCurrentQuestion.has(String(questId));

    if (!questExists) {
      console.log(
        `[Quest Cleanup] Quest ${questId} not found or already ended`
      );
      socket.emit(
        "questNotFound",
        withTimestamp({
          questId: questId,
          message: `Quest ${displayQuest} does not exist or has already ended`,
        })
      );
      return; // Exit early
    }

    // Update status to ended
    const status = "ended";
    questRunningStatus.set(questId, status);
    console.log(user);

    // Emit to ender
    socket.emit(
      "questEnded",
      withTimestamp({
        questId: questId,
        displayQuest: displayQuest,
        questRunningStatus: status,
        message: `You ended the quest ${displayQuest}`,
      })
    );

    // Emit to ALL participants in the quest room (including the ender)
    socket.broadcast.to(user.questId).emit(
      "questEndedAll",
      withTimestamp({
        questId: questId,
        displayQuest: displayQuest,
        questRunningStatus: status,
        message: `Quest ${displayQuest} has ended`,
      })
    );

    // End quest and flush/remove all data based on questId
    try {
      questParticipants.delete(questId);
      questParticipantDetails.delete(questId);
      questActiveParticipants.delete(questId);
      questCreators.delete(questId);
      questQuestionAnswers.delete(questId);
      questCurrentQuestion.delete(String(questId));
      userRooms.forEach((set, uid) => {
        if (set.has(String(questId))) set.delete(String(questId));
      });
      console.log(`[Quest Cleanup] Flushed all data for questId=${questId}`);
    } catch (e) {
      console.error(
        `[Quest Cleanup] Failed to flush data for questId=${questId}:`,
        e
      );
    }
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
    const activeUsers = participantUsers.filter((p) =>
      activeParticipants.has(p.userId)
    );

    socket.emit(
      "quizStatusResponse",
      withTimestamp({
        quizId: quizId,
        status: status,
        participantCount: participants.size,
        participantUserIds: Array.from(participants),
        participantUsers: participantUsers,
        activeCount: activeParticipants.size,
        activeUserIds: Array.from(activeParticipants),
        activeUsers: activeUsers,
        message: `Quiz ${quizId} status: ${status}`,
      })
    );
  });

  // 23. Check Quest Status Listener
  socket.on("checkQuestStatus", (questId) => {
    console.log(`Checking status for Quest ${questId}`);

    const user = getCurrentUser(socket.id);
    const status = questRunningStatus.get(questId) || "pending";
    const participants = questParticipants.get(questId) || new Set();
    const activeParticipants =
      questActiveParticipants.get(questId) || new Set();
    const detailsMap = questParticipantDetails.get(questId) || new Map();
    const participantUsers = Array.from(detailsMap.values());
    const activeUsers = participantUsers.filter((p) =>
      activeParticipants.has(p.userId)
    );

    socket.emit(
      "questStatusResponse",
      withTimestamp({
        questId: questId,
        status: status,
        participantCount: participants.size,
        participantUserIds: Array.from(participants),
        participantUsers: participantUsers,
        activeCount: activeParticipants.size,
        activeUserIds: Array.from(activeParticipants),
        activeUsers: activeUsers,
        message: `Quest ${questId} status: ${status}`,
      })
    );
  });

  // 24. Task Submission Listener With options ranking/sorting (Quest)
  socket.on(
    "submitTaskWithRanking",
    (
      userId,
      questionId,
      userName,
      questionTitle,
      questionType,
      optionRankings
    ) => {
      console.log(
        `${questionType} submission from User ${userId} for Question ${questionId}`
      );

      const user = getCurrentUser(socket.id);
      const displayUser = userName || userId;
      const displayQuestion = questionTitle || questionId;
      console.log(user);

      // Check if this is ranking, sorting, or scaling
      const isRanking =
        String(questionType || "").toLowerCase() === "option_ranking";
      const isSorting =
        String(questionType || "").toLowerCase() === "option_sorting";
      const isScaling =
        String(questionType || "").toLowerCase() === "option_scaling" ||
        String(questionType || "").toLowerCase() === "scaling";

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
        timestamp: new Date().toISOString(),
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
        message: `${questionType} processed for ${displayUser} on ${displayQuestion}`,
      };

      processedPayload.questRunningStatus =
        questRunningStatus.get(user.questId) || "pending";
      socket.emit("answerProcessedQuest", withTimestamp(processedPayload));

      // Calculate scores based on question type
      let calculateScores;
      let scoreType;

      if (isRanking) {
        // Ranking calculation: Treat array values as direct ratings for each option
        calculateScores = (rankings) => {
          const scores = {};
          rankings.forEach((rating, index) => {
            scores[index] = rating; // Use array index as option ID, value as rating
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
        // Mathematical scaling factor calculation
        calculateScores = (scalings) => {
          console.log("Calculating scaling scores for:", scalings);
          const scores = {};
          const maxPoints = Math.max(...scalings.map(Number));
          
          // Calculate scaling factor: divide by 5 and round up
          // 1-5: factor=1, 6-10: factor=2, 11-15: factor=3, etc.
          const scalingFactor = Math.ceil(maxPoints / 5);
          console.log("Scaling factor:", scalingFactor, maxPoints);
          scalings.forEach((optionId, position) => {
              const basePoints = maxPoints - position;
              const points = basePoints / scalingFactor;
              scores[optionId] = points;
          });
          console.log("Calculated scaling scores:", scores);
          return scores;
        };
        scoreType = "scaling";
      }
      
      // else if (isScaling) {
      //   // Mathematical scaling factor calculation
      //   calculateScores = (scalings) => {
      //     console.log("Calculating scaling scores for:", scalings);
      //     const scores = {};
      //     const maxPoints = Math.max(...scalings.map(Number));
          
      //     // Calculate scaling factor: divide by 5 and round up
      //     // 1-5: factor=1, 6-10: factor=2, 11-15: factor=3, etc.
      //     const scalingFactor = Math.ceil(maxPoints / 5);
      //     console.log("Scaling factor:", scalingFactor, maxPoints);
      //     scalings.forEach((optionId, position) => {
      //         const basePoints = maxPoints - position;
      //         const points = basePoints / scalingFactor;
      //         scores[optionId] = points;
      //     });
      //     console.log("Calculated scaling scores:", scores);
      //     return scores;
      //   };
      //   scoreType = "scaling";
      // }
      
      else {
        // Default fallback (treat as ranking with dynamic length)
        calculateScores = (rankings) => {
          const scores = {};
          const maxPoints = rankings.length; // Dynamic max points based on array length
          rankings.forEach((optionId, position) => {
            const points = maxPoints - position;
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
        formattedScores: Object.entries(userScores).map(
          ([optionId, score]) => `${optionId}:${score}`
        ),
        message: `Your ${scoreType} scores calculated`,
      });

      // Notify only the quest creator/admin with aggregated data
      const creator = questCreators.get(user.questId);
      if (creator && creator.socketId) {
        const answersMap =
          questQuestionAnswers.get(user.questId)?.get(questionId) || new Map();
        const allSubmissions = Array.from(answersMap.values());

        // Calculate overall option scores across all users
        const overallOptionScores = {};
        const userSubmissions = [];

        if (isScaling) {
          // For scaling: Group by array index position and sum values at each position
          const positionSums = {};
          const positionCounts = {};

          allSubmissions.forEach((answer) => {
            const userSubmission = {
              userId: answer.userId,
              userName: answer.userName,
              rankings: answer.option_rankings,
              scores: {}, // Will be calculated differently for scaling
            };
            userSubmissions.push(userSubmission);

            // Sum values at each position across all users
            answer.option_rankings.forEach((value, position) => {
              if (!positionSums[position]) {
                positionSums[position] = 0;
                positionCounts[position] = 0;
              }
              positionSums[position] += value;
              positionCounts[position] += 1;
            });
          });

          // Calculate average for each position and use as overallOptionScores
          Object.keys(positionSums).forEach((position) => {
            const sum = positionSums[position];
            const count = positionCounts[position];
            overallOptionScores[position] = sum; // Store sum for percentage calculation
          });
        } else {
          // For ranking/sorting: Use existing logic
          allSubmissions.forEach((answer) => {
            const userSubmission = {
              userId: answer.userId,
              userName: answer.userName,
              rankings: answer.option_rankings,
              scores: calculateScores(answer.option_rankings),
            };
            userSubmissions.push(userSubmission);

            // Aggregate scores for each option
            Object.entries(userSubmission.scores).forEach(
              ([optionId, score]) => {
                if (!overallOptionScores[optionId]) {
                  overallOptionScores[optionId] = 0;
                }
                overallOptionScores[optionId] += score;
              }
            );
          });
        }

        // Calculate average scores for each option
        const averageOptionScores = {};
        if (isScaling) {
          // For scaling: Calculate average based on position counts
          const positionSums = {};
          const positionCounts = {};

          allSubmissions.forEach((answer) => {
            answer.option_rankings.forEach((value, position) => {
              if (!positionSums[position]) {
                positionSums[position] = 0;
                positionCounts[position] = 0;
              }
              positionSums[position] += value;
              positionCounts[position] += 1;
            });
          });

          Object.keys(positionSums).forEach((position) => {
            const sum = positionSums[position];
            const count = positionCounts[position];
            averageOptionScores[position] = sum / count;
          });
        } else {
          // For ranking/sorting: Use existing logic
          Object.entries(overallOptionScores).forEach(
            ([optionId, totalScore]) => {
              averageOptionScores[optionId] =
                totalScore / allSubmissions.length;
            }
          );
        }

        // Calculate percentage-based scores based on question type
        let percentageScores = {};

        if (isScaling) {
          // For scaling: Calculate a new scaling factor based on the aggregated data
          const allScalingValues = allSubmissions.flatMap(answer => answer.option_rankings);
          const maxScalingValue = Math.max(...allScalingValues.map(Number));
          const calculatedScalingFactor = Math.ceil(maxScalingValue / 5);
          
          console.log("Percentage calculation - Scaling factor:", calculatedScalingFactor, "Max value:", maxScalingValue);
          
          // Scaling calculation: Use average as percentage (multiply by 20 for bar length)
          Object.entries(averageOptionScores).forEach(([optionId, avgScore]) => {
            percentageScores[optionId] = avgScore * 20 / calculatedScalingFactor; // Bar length calculation
          });
        } else {
          // Ranking/Sorting calculation: (Sum ÷ Max(Sum)) × 100 (percentage-based)
          const maxSum = Math.max(...Object.values(overallOptionScores));
          Object.entries(overallOptionScores).forEach(([optionId, totalScore]) => {
            percentageScores[optionId] = maxSum > 0 ? (totalScore / maxSum) * 100 : 0;
          });
        }

        // Format overall scores for display
        const formattedOverallScores = Object.entries(overallOptionScores)
          .map(([optionId, score]) => `${optionId}:${score}`)
          .sort((a, b) => {
            const scoreA = parseFloat(a.split(":")[1]);
            const scoreB = parseFloat(b.split(":")[1]);
            return scoreB - scoreA; // Sort descending by score
          });

        // Format percentage scores for display (formattedAverageScores)
        const formattedAverageScores = Object.entries(percentageScores)
          .map(([optionId, score]) => {
            if (isScaling) {
              return `${optionId}:${score.toFixed(2)}`; // Bar length without % for scaling
            } else {
              return `${optionId}:${score.toFixed(2)}%`; // Percentage for ranking/sorting
            }
          })
          .sort((a, b) => {
            const scoreA = parseFloat(a.split(":")[1]);
            const scoreB = parseFloat(b.split(":")[1]);
            return scoreB - scoreA; // Sort descending by score
          });

        // Send detailed data to admin/creator
        io.to(creator.socketId).emit(
          "rankingSubmittedToQuestCreator",
          withTimestamp({
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
              formattedScores: Object.entries(userScores).map(
                ([optionId, score]) => `${optionId}:${score}`
              ),
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

            message: `User ${displayUser} submitted ${scoreType} for ${displayQuestion}`,
          })
        );

        // Also broadcast to all admin users in the quest (if you have multiple admins)
        const adminUsers = [creator]; // Just send to the main creator for now

        adminUsers.forEach((admin) => {
          if (admin.socketId && admin.socketId !== creator.socketId) {
            io.to(admin.socketId).emit(
              "rankingSubmittedToAdmin",
              withTimestamp({
                questId: user.questId,
                questionId: questionId,
                displayQuestion: displayQuestion,
                questionType: questionType,
                scoreType: scoreType,
                userId: user.userId,
                userName: displayUser,
                option_rankings: optionRankings,
                message: `New ${scoreType} submission from ${displayUser}`,
              })
            );
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
    }
  );

  // 25. Task Submission Listener for QuickForm (Quest)
  socket.on(
    "submitTaskForQuickForm",
    (
      userId,
      questionId,
      userName,
      questionTitle,
      questionType,
      quickFormData
    ) => {
      console.log(
        `QuickForm submission from User ${userId} for Question ${questionId}`
      );

      const user = getCurrentUser(socket.id);
      const displayUser = userName || userId;
      const displayQuestion = questionTitle || questionId;
      console.log(user);

      // Extract answer data from quickFormData
      const selectedOption =
        quickFormData?.selectedOption || quickFormData?.answer || quickFormData;
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
        message: `Answer processed for ${displayUser} on ${displayQuestion}`,
      };
      if (isTextType) {
        processedPayload.text_answer = selectedOption;
      } else {
        processedPayload.selected_option = selectedOption;
      }
      processedPayload.questRunningStatus =
        questRunningStatus.get(user.questId) || "pending";
      socket.emit("answerProcessedQuest", withTimestamp(processedPayload));

      // Notify only the quest creator with aggregated/typed details
      const creator = questCreators.get(user.questId);
      if (creator && creator.socketId) {
        if (isTextType) {
          // For text-based answers, send this user's answer with details
          const answersMap =
            questQuestionAnswers.get(user.questId)?.get(questionId) ||
            new Map();
          const textAnswers = Array.from(answersMap.values())
            .filter(
              (ans) =>
                ans.text_answer !== undefined &&
                ans.text_answer !== null &&
                ans.text_answer !== ""
            )
            .map((ans) => ({
              userId: ans.userId,
              userName: ans.userName,
              value: ans.text_answer,
            }));
          const participants = questParticipants.get(user.questId) || new Set();
          const totalRequestedUsers = participants.size;
          const totalResponses = textAnswers.length;

          io.to(creator.socketId).emit(
            "answerSubmittedToQuestCreatorQuickForm",
            withTimestamp({
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
              questRunningStatus:
                questRunningStatus.get(user.questId) || "pending",
              message: `User ${displayUser} submitted answer for ${displayQuestion}`,
            })
          );
        } else {
          // For option-based answers, aggregate counts and user lists per option index
          const answersMap =
            questQuestionAnswers.get(user.questId)?.get(questionId) ||
            new Map();
          const optionSelections = {};

          const allSubmissions = Array.from(answersMap.values());
          Array.from(allSubmissions).forEach((ans) => {
            const options = Array.isArray(ans.selected_option)
              ? ans.selected_option
              : [ans.selected_option];
            options
              .filter((o) => o !== undefined && o !== null && o !== "")
              .forEach((opt) => {
                const key = String(opt);
                if (!optionSelections[key]) {
                  optionSelections[key] = { count: 0, users: [] };
                }
                optionSelections[key].count += 1;
                optionSelections[key].users.push({
                  userId: ans.userId,
                  userName: ans.userName,
                });
              });
          });
          const participants = questParticipants.get(user.questId) || new Set();
          const totalRequestedUsers = participants.size;
          const perUserResponses = allSubmissions
            .map((ans) => ({
              userId: ans.userId,
              userName: ans.userName,
              value: ans.selected_option,
            }))
            .filter(
              (r) => r.value !== undefined && r.value !== null && r.value !== ""
            );
          const totalResponses = perUserResponses.length;

          io.to(creator.socketId).emit(
            "answerSubmittedToQuestCreatorQuickForm",
            withTimestamp({
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
              questRunningStatus:
                questRunningStatus.get(user.questId) || "pending",
              message: `User ${displayUser} submitted answer for ${displayQuestion}`,
            })
          );
        }
      }
    }
  );

  // Handle disconnection
  socket.on("disconnect", () => {
    const user = getCurrentUser(socket.id);
    console.log(`Connection closed: ${socket.id}`);
    // Broadcast connection status before clearing mapping
    if (user && user.quizId) {
      socket.broadcast.to(user.quizId).emit(
        "connectionStatus",
        withTimestamp({
          type: "quiz",
          quizId: user.quizId,
          userId: user.userId,
          status: "disconnected",
          quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
        })
      );

      // If creator, also privately notify them (in case client handles queued messages)
      const creator = quizCreators.get(user.quizId);
      if (creator && creator.userId === user.userId) {
        socket.emit(
          "creatorConnectionStatus",
          withTimestamp({
            type: "quiz",
            quizId: user.quizId,
            userId: user.userId,
            status: "disconnected",
            quizRunningStatus: quizRunningStatus.get(user.quizId) || "pending",
          })
        );
      }
    }
    if (user && user.questId) {
      socket.broadcast.to(user.questId).emit(
        "connectionStatus",
        withTimestamp({
          type: "quest",
          questId: user.questId,
          userId: user.userId,
          status: "disconnected",
          questRunningStatus: questRunningStatus.get(user.questId) || "pending",
        })
      );
      const creatorQ = questCreators.get(user.questId);
      if (creatorQ && creatorQ.userId === user.userId) {
        socket.emit(
          "creatorConnectionStatus",
          withTimestamp({
            type: "quest",
            questId: user.questId,
            userId: user.userId,
            status: "disconnected",
            questRunningStatus:
              questRunningStatus.get(user.questId) || "pending",
          })
        );
      }
    }
    // Clear only the physical-to-stable mapping; keep logical identity for reuse
    removeUserSocket(userId, socket.id);
    clearSocketMapping(socket.id);
  });
});

// Start the server
httpServer.listen(4001, () => {
  console.log("Server running on port 4001");
});
