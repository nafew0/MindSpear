# Legacy Socket.IO Server

This Socket.IO server is disabled after the Phase 2 Laravel Reverb backend cutover.

Quiz and quest realtime traffic should use Laravel Reverb instead. The legacy server can still be started temporarily for emergency comparison by running:

```bash
SOCKET_SERVER_DISABLED=false npm start
```

Do not build new quiz or quest realtime behavior here.
