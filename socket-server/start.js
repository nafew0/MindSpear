import "dotenv/config";

if (process.env.SOCKET_SERVER_DISABLED !== "false") {
  console.error(
    "Socket.IO live server is disabled after the Phase 2 Reverb backend cutover. " +
      "Use Laravel Reverb for quiz/quest realtime. To run the legacy server temporarily, set SOCKET_SERVER_DISABLED=false."
  );
  process.exit(1);
}

await import("./server.js");
