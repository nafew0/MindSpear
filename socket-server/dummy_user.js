const c_users = [];
// Map physical socket.id -> stable logical id
const socketIdToStableId = new Map();
// Map composite key -> stable logical id
// Keys: "quiz:<quizId>:<userId>" or "quest:<questId>:<userId>"
const stableIdByKey = new Map();

// joins the user to the specific chatroom
function joinUser(id, userId, quizId) {
  const key = `quiz:${quizId}:${userId}`;
  // Reuse existing stable id if exists; otherwise, first seen socket.id becomes stable id
  const stableId = stableIdByKey.get(key) || id;
  stableIdByKey.set(key, stableId);
  socketIdToStableId.set(id, stableId);

  // Try to find existing user by key
  let p_user = c_users.find((u) => u.userId === userId && u.quizId === quizId);
  if (p_user) {
    // Ensure the stored id remains the stable id
    p_user.id = stableId;
  } else {
    p_user = { id: stableId, userId, quizId };
    c_users.push(p_user);
  }

  console.log(c_users, "users");
  return p_user;
}

function joinUserQuiz(id, userId, quizId) {
  const key = `quiz:${quizId}:${userId}`;
  const stableId = stableIdByKey.get(key) || id;
  stableIdByKey.set(key, stableId);
  socketIdToStableId.set(id, stableId);

  let p_user = c_users.find((u) => u.userId === userId && u.quizId === quizId);
  if (p_user) {
    p_user.id = stableId;
  } else {
    p_user = { id: stableId, userId, quizId };
    c_users.push(p_user);
  }

  console.log(c_users, "users");
  return p_user;
}


function joinUserQuest(id, userId, questId) {
  const key = `quest:${questId}:${userId}`;
  const stableId = stableIdByKey.get(key) || id;
  stableIdByKey.set(key, stableId);
  socketIdToStableId.set(id, stableId);

  let p_user = c_users.find((u) => u.userId === userId && u.questId === questId);
  if (p_user) {
    p_user.id = stableId;
  } else {
    p_user = { id: stableId, userId, questId };
    c_users.push(p_user);
  }

  console.log(c_users, "users");
  return p_user;
}

console.log("user out", c_users);

// Gets a particular user id to return the current user
function getCurrentUser(id) {
  const stableId = socketIdToStableId.get(id) || id;
  return c_users.find((p_user) => p_user.id === stableId);
}

// called when the user leaves the chat and its user object deleted from array
function userDisconnect(id) {
  // Clear only the mapping for this physical socket id to preserve stable identity
  socketIdToStableId.delete(id);
}

function clearSocketMapping(id) {
  socketIdToStableId.delete(id);
}

export { getCurrentUser, joinUser, joinUserQuiz, joinUserQuest, userDisconnect, clearSocketMapping };

