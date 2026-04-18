# MindSpear Quiz Redesign — Slide-Based Quiz (AhaSlides Parity)

> **Goal.** Rebuild the Quiz module so authoring, hosting, and participation feel indistinguishable from AhaSlides. Slide-based editor, per-slide question types, time-weighted scoring with per-slide min/max, QR join, 5-second "Get ready" countdown, animated results, emoji-avatar participants, global leaderboard slide.
>
> **Out of scope (for now).** Unscored types (Poll, Word Cloud, Q&A, Rating Scale, etc.), emoji reactions, audience chat, AI option generation, templates marketplace, Spinner Wheel logic that spins during live (simplified — see Phase G). Quest module is not touched by this plan; it will get a Mentimeter-style redesign later and will reuse as much of the slide infrastructure as possible.
>
> **Scope confirmed with user.**
> - Quiz only; Quest stays on its current redesign trajectory.
> - Greenfield data — no migration of existing quizzes/questions/sessions required. Old tables may be dropped after cutover.
> - Only scored question types from the AhaSlides "Quiz" column: Pick Answer, Short Answer, Spinner Wheel, Match Pairs, Correct Order, Categorise. Plus Content + Heading slides, QR Code slide, and Leaderboard slide.
> - Per-slide min/max points with time-based interpolation (AhaSlides model), plus a global Leaderboard slide.
> - Core quiz experience only — no emoji reactions, chat, hand-raise, live feedback screen, etc.
>
> **Relationship to [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).** Phases 0–3 of that plan are complete: Reverb is live, Socket.IO is gone, public/private channel split works, participant-token flow is in place. This plan builds *on top of* that realtime foundation — event classes, channel naming, and the participant-token auth pattern are reused. Phase 4+ of the main plan (UI polish, testing, docs) applies to the redesigned Quiz as a whole.
>
> **Database decision.** Same as main plan — SQLite acceptable locally, PostgreSQL is production target. Every new migration, JSON filter, aggregate, or raw SQL in this plan must be checked against PostgreSQL before merge.

---

## Architectural shape

### Slide-based model (the mental shift)

Today, a Quiz has many `questions` (flat list). The new model:

```
Quiz
└── Slide (ordered, typed)
    ├── SlideOption[]           (for pick_answer, match_pairs, categorise, correct_order, spinner_wheel)
    └── SlideConfig (JSON)      (per-type config — points, timing, layout, etc.)
```

A **slide** is the atomic unit. Every slide has: `type`, `position`, `title`, optional `body`, `config JSON`, and optional `options[]`. This matches AhaSlides' data model and makes it trivial to add new slide types later without schema churn.

### Slide type catalog (v1)

| Type key | Category | Scored? | Options? | Participant UI | Notes |
|---|---|---|---|---|---|
| `pick_answer_single` | Quiz | Yes | Yes (2–10) | Tap one option card | Image + text per option |
| `pick_answer_multi` | Quiz | Yes | Yes (2–10) | Tap multiple option cards, Submit | Partial credit config |
| `short_answer` | Quiz | Yes | Expected answers array | Text input, Submit | Case-insensitive match, multiple accepted answers |
| `match_pairs` | Quiz | Yes | Pairs array (left↔right) | Drag/tap to connect | Shuffled on each participant view |
| `correct_order` | Quiz | Yes | Ordered items array | Drag to reorder | Shown shuffled |
| `categorise` | Quiz | Yes | Items + categories | Drag items into category buckets | |
| `spinner_wheel` | Quiz | Yes | Options array | View-only during spin, tap on landed option | Simplified: host spins, random/weighted landing, all correct-guessers score |
| `heading` | Content | No | — | Read-only | Title + subtitle |
| `content` | Content | No | — | Read-only | Rich text body + optional image |
| `qr_code` | Content | No | — | Read-only | Auto-shows join code + QR; can be reused mid-deck |
| `leaderboard` | System | No | — | Read-only | Top N after points-so-far; can be inserted anywhere |

**Design principle:** every slide type defines the *same five hooks* (Creator view, Present view, Participant view, scoring function, validation schema). Adding a new type in the future = implementing those five hooks.

### Channels and events (reused from Phase 2/3)

No new channel semantics. Same model:

- **Public** `session.quiz.{publicChannelKey}` — all participants + host receive slide-state events.
- **Private** `host.quiz.{sessionId}` — host-only answer stream, participant join details.

New event payloads (not new channels):

| Event | Channel | Purpose |
|---|---|---|
| `slide.changed` | Public | Replaces `task.changed` semantics but keyed on slide, not question |
| `slide.state.changed` | Public | State machine transitions: `waiting → get_ready → answering → reveal → done` |
| `slide.reveal` | Public | After lock: correct answer + aggregate counts + option images |
| `leaderboard.updated` | Public | Already exists; payload now carries `points_delta` per player (for +94 animation) |
| `answer.submitted` | Private (host) | Already exists; payload adds `time_to_answer_ms` and `points_awarded` |

### Live session state machine (per slide)

```
waiting          ← slide just became current, host hasn't started it yet
  ↓ host clicks Start
get_ready        ← 5s countdown overlay on participants; host sees "Get ready (5…4…3…2…1)"
  ↓ auto
answering        ← timer counting down from slide.time_limit_seconds
  ↓ timer end OR host clicks "Reveal" OR all joined participants submitted
reveal           ← results shown to all; host sees "Next" button
  ↓ host advances
done             ← snapshot saved; move to next slide (back to waiting)
```

State lives on `quiz_sessions` (`current_slide_id`, `current_slide_state`, `current_slide_state_started_at`, `timer_state` JSON). On reconnect, clients call `GET /quiz-sessions/{id}/state` and restore from that.

**The 5s "Get ready" is configurable** (on/off globally per quiz; default on). AhaSlides uses it to let the question display before the timer starts so late-joiners aren't penalised.

### Scoring model (time-weighted, per-slide)

Per slide, author sets `points_min` and `points_max` (defaults 50 / 100) and a `speed_bonus_enabled` flag.

```
if speed_bonus_enabled:
  ratio = (time_limit - time_to_answer) / time_limit     # clamped [0, 1]
  points = points_min + ratio * (points_max - points_min)
else:
  points = points_max
```

Wrong answer → `0`. Partial credit for multi-select = `points * (correct_selected / total_correct) - penalty`. The progress bar on the participant screen (the `50p ──── 100p` bar in the screenshot) visualises this in real time.

### Auth model (no change from Phase 2)

- Host = Sanctum-authenticated user, owns the quiz.
- Participant = anonymous, receives a `participant_token` on join, stored as SHA-256 hash server-side. All answer submissions send `X-Participant-Token`.
- Emoji avatar + display name stored in `quiz_participants.anonymous_details` JSON (extended).

---

## Phase 1 — Data model & core backend

**Goal.** New tables, new models, migrations. Zero UI.
**Duration.** 2–3 days.

### 1.1 Drop old quiz structures (greenfield)

Write a single migration that drops: `questions`, `quiz_participants`, `quiz_sessions`, `user_quiz_answers`, `bank_questions` (quiz-only), `quizzes`. Keep Quest + Survey tables untouched. Commit as "drop legacy quiz schema — greenfield for redesign."

### 1.2 New quiz tables

| Table | Purpose |
|---|---|
| `quizzes` | Deck metadata: `id`, `owner_id`, `title`, `description`, `cover_image_path`, `join_code` (unique, 6-char), `settings` (JSON: default_time, default_points_min/max, speed_bonus_enabled, get_ready_seconds=5), `published_at`, timestamps |
| `quiz_slides` | `id`, `quiz_id`, `type`, `position`, `title`, `body`, `config` (JSON), `time_limit_seconds`, `points_min`, `points_max`, `speed_bonus_enabled`, `get_ready_seconds`, timestamps. Unique `(quiz_id, position)` |
| `quiz_slide_options` | `id`, `slide_id`, `position`, `label`, `image_path`, `is_correct`, `payload` (JSON: for pair_key, category_key, correct_order_index), timestamps |
| `quiz_sessions` | `id`, `quiz_id`, `host_user_id`, `public_channel_key`, `join_code` (copied for fast lookup), `status` (pending/live/ended), `current_slide_id`, `current_slide_state` (enum), `current_slide_state_started_at`, `timer_state` (JSON), `started_at`, `ended_at` |
| `quiz_participants` | `id`, `quiz_session_id`, `display_name`, `emoji_avatar`, `participant_token_hash`, `participant_token_expires_at`, `participant_token_revoked_at`, `total_points`, `joined_at`, `left_at` |
| `quiz_participant_answers` | `id`, `quiz_participant_id`, `slide_id`, `answer_payload` (JSON), `time_to_answer_ms`, `is_correct`, `points_awarded`, `submitted_at` |

**Indexes to add up-front:**
- `quiz_slide_options(slide_id, position)`
- `quiz_participant_answers(quiz_participant_id, slide_id)` unique (one answer per slide per participant)
- `quiz_sessions(join_code)` unique
- `quiz_sessions(public_channel_key)` unique
- `quiz_participants(participant_token_hash)` unique

**PostgreSQL check:** test the JSON columns (`settings`, `config`, `payload`, `answer_payload`, `timer_state`) with real queries — we'll need `jsonb_path_query` / `->` operators for analytics. Use `jsonb`, not `json`.

### 1.3 Slide type registry (PHP)

Create `app/Quiz/Slides/SlideTypeRegistry.php` with one class per type implementing `SlideTypeContract`:

```php
interface SlideTypeContract {
    public function key(): string;                          // 'pick_answer_single'
    public function validateConfig(array $config): array;   // Validator rules
    public function validateAnswer(array $payload): array;  // Validator rules
    public function score(Slide $slide, array $payload, int $timeToAnswerMs): ScoreResult;
    public function aggregateForReveal(Slide $slide, Collection $answers): array;
    public function serializeForPresenter(Slide $slide): array;   // What the host's Present view gets
    public function serializeForParticipant(Slide $slide): array; // What the participant's screen gets (strips correct-answer info!)
}
```

**Critical:** `serializeForParticipant` must strip `is_correct` from options. Today this is likely leaked.

Register types in `QuizServiceProvider`. Controllers dispatch to the registry instead of switch-on-string.

### 1.4 Event classes

Keep the Phase 2 event classes that still apply (`QuizSessionStarted`, `QuizSessionEnded`, `QuizParticipantJoined`, `QuizParticipantCountUpdated`, `QuizLeaderboardUpdated`). Rename `QuizQuestionChanged` → `QuizSlideChanged` and add:

- `QuizSlideStateChanged` (public) — carries the state machine transition + `seconds_remaining`
- `QuizSlideReveal` (public) — aggregate + correct option(s) + per-option images
- `QuizAnswerSubmitted` (private host) — already exists, extend payload

All events use `ShouldDispatchAfterCommit` — per main plan §2.6.

### 1.5 Broadcasts throttling

`AnswerAggregateUpdated`-style events stay on a 250–500ms Redis-backed debounce (main plan §2.8). The reveal event is immediate and final.

**Phase 1 exit criteria:** migrations run clean on PostgreSQL, Tinker can `broadcast(new QuizSlideChanged(...))` successfully, all registry types pass unit tests for `score()`.

---

## Phase 2 — Backend authoring API

**Goal.** CRUD endpoints the slide editor needs. No live-session behaviour yet.
**Duration.** 2–3 days.

### 2.1 Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/quizzes` | Create empty quiz with one QR-code slide at position 0 |
| `GET` | `/api/v1/quizzes/{id}` | Load full quiz with all slides + options |
| `PATCH` | `/api/v1/quizzes/{id}` | Update title, settings, cover |
| `DELETE` | `/api/v1/quizzes/{id}` | Soft-delete |
| `POST` | `/api/v1/quizzes/{id}/slides` | Append new slide of given type (returns slide with sensible defaults per type) |
| `GET` | `/api/v1/quizzes/{id}/slides/{slideId}` | Load single slide |
| `PATCH` | `/api/v1/quizzes/{id}/slides/{slideId}` | Update title, body, config, time, points |
| `DELETE` | `/api/v1/quizzes/{id}/slides/{slideId}` | Delete slide + shift positions |
| `POST` | `/api/v1/quizzes/{id}/slides/{slideId}/duplicate` | Clone slide right after original |
| `POST` | `/api/v1/quizzes/{id}/slides/reorder` | Body: `[{id, position}, …]` — single transaction |
| `POST` | `/api/v1/quizzes/{id}/slides/{slideId}/options` | Add option |
| `PATCH` | `/api/v1/quizzes/{id}/slides/{slideId}/options/{optionId}` | Edit option |
| `DELETE` | `/api/v1/quizzes/{id}/slides/{slideId}/options/{optionId}` | Delete option |
| `POST` | `/api/v1/quizzes/{id}/slides/{slideId}/options/{optionId}/image` | Upload/replace option image |

### 2.2 Per-type default configs

When a new slide is appended, backend seeds type-appropriate defaults:

- `pick_answer_single` → 2 empty options, 20s time, 50/100 points, speed bonus on
- `short_answer` → empty accepted-answers array, 30s time, 50/100 points
- `match_pairs` → 3 empty pairs, 45s time
- `correct_order` → 4 empty items, 30s time
- `categorise` → 2 categories + 4 items, 45s time
- `spinner_wheel` → 4 options, no time limit, 100 points (flat)
- `heading` → no time, no points
- `content` → no time, no points
- `qr_code` → no time, no points, auto-rendered
- `leaderboard` → no time, no points, `top_n = 10` in config

### 2.3 Image upload

Reuse existing file-storage conventions (check `backend/app/Services/` for the current uploader). Store under `storage/app/quiz-slide-options/{slide_id}/{uuid}.{ext}`. Return URL via existing `getSourceContentUrlAttribute` pattern. Max 2MB, resize to max 1024×1024 on upload (use `intervention/image` if not already installed).

### 2.4 Join-code generation

6-character alphanumeric (A-Z, 2-9 — skip 0/O/1/I for legibility). Generate on `POST /quizzes/{id}/start-session`, unique across *active* sessions only (can reuse after session ends). Collision retry: 5 attempts, error if unlucky.

### 2.5 Validation

All config validation goes through the slide type registry (Phase 1.3). Controllers stay thin.

**Phase 2 exit criteria:** Postman/Pest collection that creates a quiz, appends one slide of every type, edits each, reorders, duplicates, deletes — all green against PostgreSQL.

---

## Phase 3 — Backend live-session API

**Goal.** State-machine endpoints + scoring + leaderboard. Wire Reverb broadcasts.
**Duration.** 3–4 days.

### 3.1 New endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/quizzes/{id}/sessions` | Host starts a session → returns `{session_id, join_code, public_channel_key}` |
| `GET` | `/api/v1/quiz-sessions/{id}/state` | Full resync snapshot (from main plan §2.5) |
| `POST` | `/api/v1/quiz-sessions/{id}/advance` | Host-controlled transitions (next slide, reveal, end) — see 3.2 |
| `POST` | `/api/v1/quiz-sessions/{id}/end` | Host ends session early |
| `GET` | `/api/v1/quiz-sessions/{id}/leaderboard` | Current leaderboard (paginated, for Leaderboard slide) |
| `POST` | `/api/v1/quiz-sessions/{id}/participants/join` | Anonymous join — name + emoji → `{participant_id, participant_token}` |
| `POST` | `/api/v1/quiz-sessions/{id}/slides/{slideId}/answers` | Submit answer (participant-token auth) |

### 3.2 Advance endpoint — single entry point for host-driven transitions

Body: `{ action: 'start_slide' | 'reveal' | 'next_slide' | 'previous_slide' | 'jump_to', slide_id?, target_slide_id? }`.

Server enforces legal transitions based on current state. Example: `start_slide` from `waiting` sets state to `get_ready`, schedules a job to flip to `answering` after `get_ready_seconds`, which in turn schedules a job to flip to `reveal` after `time_limit_seconds`. Both jobs broadcast `QuizSlideStateChanged`. Host's "Reveal" button short-circuits the timer.

**Why jobs, not timers in the controller?** Reverb doesn't deliver timed broadcasts; Laravel scheduler doesn't run sub-minute. Use `dispatch(new TransitionSlideJob(...))->delay(now()->addSeconds(N))` on Redis queue — guaranteed delivery, cancellable by advancing early.

### 3.3 Scoring service

`app/Services/Quiz/ScoringService.php` — single place that takes `(slide, answerPayload, timeToAnswerMs)` and returns `ScoreResult`. Delegates to slide-type registry. Called from the answer submission controller synchronously (cheap). Points update `quiz_participants.total_points` in the same transaction.

### 3.4 Leaderboard service

`app/Services/Quiz/LeaderboardService.php`:

- `currentTopN(session, n)` — order by `total_points DESC, joined_at ASC`, return players with `rank`, `display_name`, `emoji_avatar`, `total_points`, and `points_delta` (points gained on last slide, for the `+94` animation).
- Cache snapshot in Redis per slide transition (`leaderboard:session:{id}:after:{slideId}`), TTL 1h. Never replay — each request either returns cached or rebuilds.

`QuizLeaderboardUpdated` event fires on every `reveal → done` transition.

### 3.5 Participant join with emoji

```php
// POST /api/v1/quiz-sessions/{id}/participants/join
// Body: { display_name, emoji_avatar, join_code }

$session = QuizSession::where('public_channel_key', $pck)->firstOrFail();
abort_unless($session->status === 'live', 403, 'Session is not accepting participants.');

$rawToken = Str::random(64);
$participant = QuizParticipant::create([
    'quiz_session_id' => $session->id,
    'display_name'    => $request->display_name,
    'emoji_avatar'    => $request->emoji_avatar,     // one of a curated ~40 emoji list
    'participant_token_hash' => hash('sha256', $rawToken),
    'participant_token_expires_at' => now()->addHours(6),
    'total_points'    => 0,
]);

DB::afterCommit(fn () => broadcast(new QuizParticipantJoined(...)));     // private to host
DB::afterCommit(fn () => broadcast(new QuizParticipantCountUpdated(...))); // public

return ['participant_id' => $participant->id, 'participant_token' => $rawToken, 'public_channel_key' => $session->public_channel_key];
```

Emoji list is a PHP constant (~40 curated emoji) to prevent garbage input. Reject anything not in list.

### 3.6 Answer submission

```php
// POST /api/v1/quiz-sessions/{id}/slides/{slideId}/answers
// Header: X-Participant-Token
// Body: { answer_payload: {...}, client_submitted_at: "ISO" }

$participant = ParticipantTokenService::resolve($request->header('X-Participant-Token'), $sessionId);
abort_if($session->current_slide_id !== $slideId, 409, 'Not the current slide.');
abort_if($session->current_slide_state !== 'answering', 409, 'Slide is not accepting answers.');
abort_if(QuizParticipantAnswer::where('quiz_participant_id', $participant->id)->where('slide_id', $slideId)->exists(), 409, 'Already answered.');

$timeToAnswer = now()->diffInMilliseconds($session->current_slide_state_started_at);
$result = app(ScoringService::class)->score($slide, $request->answer_payload, $timeToAnswer);

DB::transaction(function () use (...) {
    QuizParticipantAnswer::create([...]);
    $participant->increment('total_points', $result->pointsAwarded);
});

DB::afterCommit(fn () => broadcast(new QuizAnswerSubmitted(...))); // private host
DB::afterCommit(fn () => broadcast(new QuizAnswerAggregateUpdated(...)))->debounce(500);

return ['submitted' => true]; // NEVER return is_correct / points here — participant sees at reveal
```

**Critical:** the response is deliberately opaque. Correctness is revealed only on state transition to `reveal`.

### 3.7 Reveal payload

On `reveal` transition, server computes aggregate and broadcasts `QuizSlideReveal`:

```json
{
  "slide_id": 42,
  "type": "pick_answer_single",
  "aggregate": {
    "option_counts": [{"option_id": 1, "count": 77}, {"option_id": 2, "count": 38}, ...],
    "total_answers": 158,
    "correct_option_ids": [4]
  },
  "leaderboard_delta": [{"participant_id": 9, "points_delta": 94, "new_total": 94, "new_rank": 1}, ...],
  "server_time": "..."
}
```

Participant-specific `is_correct` + `points_awarded` comes from a separate `GET /quiz-sessions/{id}/slides/{slideId}/my-answer` (participant-token auth) fetched by client on reveal — keeps the broadcast payload small.

### 3.8 Tests (Pest, against PostgreSQL)

- Full happy path: create quiz → start session → 3 participants join → answer slide 1 → reveal → leaderboard updated → slide 2 → etc. → end.
- State-machine edge cases: double-advance, answering-after-reveal, late join (should work but miss past slides).
- Scoring: time interpolation, partial credit, zero on wrong.
- Token revocation: revoked token rejected.
- Authorization: non-host calling `/advance` → 403.

**Phase 3 exit criteria:** full Pest suite green on PostgreSQL; Tinker-driven 3-participant smoke test produces correct leaderboard.

---

## Phase 4 — Frontend: slide editor

**Goal.** Three-panel authoring UI matching AhaSlides image 1. No live-session work yet.
**Duration.** 4–5 days.

### 4.1 Route & layout

Replace `app/(protected)/quiz-creator/` and `app/(protected)/quiz-edit/` with a single slide-based editor at `app/(protected)/quizzes/[id]/edit/`. Old quiz-creator/quiz-edit routes get removed in Phase 8 cleanup.

Three-panel layout (desktop-first; mobile editor is out of scope for v1):

```
┌─────────────┬────────────────────────────────┬──────────────┐
│             │                                │              │
│  Slide      │   Center canvas (live preview) │  Inspector   │
│  rail       │   — WYSIWYG render of the      │  panel:      │
│  (thumbs,   │     Present-view component     │  Content /   │
│   DnD       │                                │  Design /    │
│   reorder)  │                                │  Audio /     │
│             │                                │  Settings    │
│  + New      │                                │              │
│  slide      │                                │              │
└─────────────┴────────────────────────────────┴──────────────┘
```

### 4.2 Module structure

Lands inside the Phase 1 folder scheme from the main plan:

```
features/quiz/
├── components/
│   ├── editor/
│   │   ├── EditorShell.tsx              # three-panel layout
│   │   ├── SlideRail.tsx                # left thumbnail list
│   │   ├── SlideThumbnail.tsx
│   │   ├── SlidePicker.tsx              # modal from image 2 (quiz types only)
│   │   ├── CenterCanvas.tsx             # renders the active slide's Presenter view, scaled
│   │   ├── InspectorPanel.tsx           # right-side tabbed panel
│   │   ├── inspector/
│   │   │   ├── ContentTab.tsx           # question text, options list, add option
│   │   │   ├── DesignTab.tsx            # background, layout presets
│   │   │   ├── SettingsTab.tsx          # time limit, points min/max, speed bonus, get-ready
│   │   │   └── OptionRow.tsx            # image + label + delete, drag handle
│   │   ├── slides/                      # one folder per slide type
│   │   │   ├── pickAnswer/
│   │   │   │   ├── PickAnswerEditor.tsx
│   │   │   │   ├── PickAnswerPresenter.tsx
│   │   │   │   └── PickAnswerParticipant.tsx
│   │   │   ├── shortAnswer/...
│   │   │   ├── matchPairs/...
│   │   │   ├── correctOrder/...
│   │   │   ├── categorise/...
│   │   │   ├── spinnerWheel/...
│   │   │   ├── heading/...
│   │   │   ├── content/...
│   │   │   ├── qrCode/...
│   │   │   └── leaderboard/...
│   │   └── slideRegistry.ts             # map slide.type → { Editor, Presenter, Participant, defaults, icon }
│   └── ...
```

`slideRegistry.ts` is the frontend twin of Phase 1.3's backend registry. One source of truth per side.

### 4.3 Editor-level behaviours

- **Autosave** on blur/debounced input (500ms). Optimistic update local state; roll back on 409.
- **Unsaved-changes indicator** in header.
- **Reorder** via `@dnd-kit/core` (already in codebase per main plan §1.5). Server call is the single batch `POST /slides/reorder`.
- **Duplicate** keyboard shortcut: `Ctrl/Cmd+D`.
- **Delete** slide via keyboard `Delete` or trash icon; confirm modal.
- **Add slide** via `+ New slide` button → opens `SlidePicker` modal (image 2, with unscored row hidden in v1).
- **Preview** button in header → read-only full-screen render of the deck in order.

### 4.4 Per-type editor components

Each type has its own `Editor` component rendered in the Inspector's Content tab. They all operate on the same shape `{ slide, onChange(patch) }` and debounce-save via the parent. Keep them simple — no business logic beyond the config schema.

**Key constraint:** the Center canvas renders the slide's `Presenter` component, not a special "preview" component. This guarantees WYSIWYG parity with live mode.

### 4.5 Image upload UX

For option images: click the image thumbnail → file picker → upload shown as shimmer until server returns URL → replace. Also support drag-drop onto the thumbnail. Max 2MB client-side enforcement with friendly error.

### 4.6 Settings tab essentials

Per slide:
- Time limit (seconds; dropdown: 5, 10, 15, 20, 30, 45, 60, 90, 120)
- Points Max (number input; default 100)
- Points Min (number input; default 50; must be ≤ Max)
- Speed bonus toggle (if off, points = Max)
- Get-ready toggle (inherit from quiz default / override per slide)

Per quiz (editor header → Settings modal):
- Default time, points min/max, speed bonus, get-ready
- Show/hide QR sidebar in presenter view
- Show/hide correct-answer markers on reveal (default on)

**Phase 4 exit criteria:** you can author every slide type end-to-end in the browser, reorder, duplicate, delete, upload images, and a freshly authored quiz round-trips cleanly through the API.

---

## Phase 5 — Frontend: Presenter (Host) mode

**Goal.** Full-screen Present view matching the two host screenshots (QR sidebar + question + bar chart + leaderboard).
**Duration.** 4 days.

### 5.1 Route

`app/(protected)/quizzes/[id]/present/` — host-only, Sanctum-guarded. On mount:
1. `POST /quizzes/{id}/sessions` to create a session
2. Subscribe to public `session.quiz.{publicChannelKey}` via `useSessionChannel` (already built in main plan §3.3)
3. Subscribe to private `host.quiz.{sessionId}` via `useHostChannel` (already built)
4. Render the current slide's `Presenter` component
5. Render the host control bar (bottom)

### 5.2 Layout

```
┌──────────────┬──────────────────────────────────────────────┐
│              │  ┌────────────────────────────────────────┐  │
│  QR + join   │  │ To join: ahaslides.com/APAN61  [X]     │  │  top join banner
│  sidebar     │  └────────────────────────────────────────┘  │
│  (toggleable)│                                              │
│              │           [ active slide Presenter view ]    │
│              │                                              │
│              │                                              │
│              │  ┌─────────────────────────────────┐         │
│              │  │ ≡  ‹ 3 ›  🏆  +  end           │         │  host control bar
│              │  └─────────────────────────────────┘         │
└──────────────┴──────────────────────────────────────────────┘
```

**Host control bar (bottom):**
- Slide list toggle (≡) → popover with all slides
- Prev / Next (‹ ›) + current slide index
- Insert Leaderboard slide on the fly (🏆 icon)
- Participant count + connection indicator (right side)
- "End session" (right side, red)

We're dropping the AhaSlides emoji reaction counters and confetti/hand-raise icons — user said no value-add fluff.

### 5.3 Per-slide Presenter components

Each type renders differently, but **all** listen to the shared state machine and react:

| State | Pick Answer presenter renders |
|---|---|
| `waiting` | Question + options (no counts), big `Start` button in the middle (screenshot "Waiting for players to join"). Shows live participant count. |
| `get_ready` | Overlay: "Get ready… 5, 4, 3, 2, 1" |
| `answering` | Question + options (no correct-answer hint) + live submitted-count + timer |
| `reveal` | Bar chart with option images embedded in bars + ✅/❌ per option (image 3 match) + `Next` button |
| `done` | Identity to `reveal`, but a "moving on" animation is fine |

Spinner Wheel is the special case — its "spin" replaces the timer. Implement as a simple CSS rotation animation to a random stopping angle computed server-side.

Leaderboard slide: always identical to image 4 — ranked bars with avatar emoji, points, delta. Uses Framer Motion for the rank-change animation.

QR Code slide: big centered QR + big join code + "Go to yourdomain.com/QUIZCODE".

### 5.4 Timer sync

Authoritative timer is on the server (`slide.state.changed` carries `state_started_at` + `duration_seconds`). Frontend only ticks locally between events for smooth UI. On reconnect, `useSessionSync` (already exists) resyncs.

### 5.5 Reveal animations

ApexCharts animated bar chart (images on top of bars via chart annotation/SVG overlay). Post-reveal, `✅` / `❌` badges fade in under each option label. Use the `chart.palette` from `config/theme.ts` (main plan §1.2).

### 5.6 Keyboard controls

- `→ / Space / Enter` — advance (start / reveal / next slide)
- `←` — previous slide (confirm modal if mid-answering)
- `Esc` — exit present mode (confirm if session is live)
- `L` — insert Leaderboard slide inline
- `Q` — toggle QR sidebar

**Phase 5 exit criteria:** host can start a session, navigate through a mixed-type deck, see live participant counts and answer aggregates, and the reveal screens match AhaSlides screenshots pixel-closely (same spacing, same colors, same icons).

---

## Phase 6 — Frontend: Participant view

**Goal.** Mobile-first join + answering flow matching the 6 participant screenshots.
**Duration.** 3–4 days.

### 6.1 Routes

- `app/(public)/join/page.tsx` — enter join code (6-char). Already exists at `(public)/join` per the current tree; repurpose / redirect.
- `app/(public)/join/[code]/page.tsx` — enter name + pick emoji avatar (image 4). Calls `/participants/join`.
- `app/(public)/play/[publicChannelKey]/page.tsx` — the live answering page. Stores participant token in `sessionStorage`.

Delete old `app/(public)/attempt/quize/` and `app/(public)/live/quiz/` routes in Phase 8.

### 6.2 Join flow

1. **Code page.** Big input, auto-uppercase, auto-advance to next page on 6 chars. Validates server-side via `GET /quiz-sessions/by-code/{code}` (thin endpoint, returns `public_channel_key` + `quiz.title` if live, 404 otherwise).
2. **Name + emoji page.** Text input (max 50 chars) + emoji grid (~40 curated). `Join the game!` button. On success → store `participant_token` in `sessionStorage`, navigate to play page.
3. **Successfully joined page** (before host starts). Shows QR of own join link for sharing (matches image 1). No emoji-reaction UI; user said skip fluff.

### 6.3 Play page (state-driven render)

```tsx
const { currentSlide, slideState, secondsRemaining } = useSessionChannel('quiz', publicChannelKey);
const { submitAnswer } = useParticipantApi(participantToken);

switch (slideState) {
  case 'waiting':    return <WaitingForHost />;
  case 'get_ready':  return <GetReadyOverlay seconds={secondsRemaining} />;
  case 'answering':  return <SlideParticipantView slide={currentSlide} onSubmit={submitAnswer} />;
  case 'reveal':     return <SlideRevealView slide={currentSlide} myAnswer={myAnswer} />;
  case 'done':       return <Waiting />;
}
```

### 6.4 Per-type Participant components

Mirror image 6:
- Question text at top
- Points range bar (`50p ──────── 100p`) reflecting current earnable points (drops as timer counts down)
- Option cards (image + label for pick_answer; numeric grid for correct_order; etc.)
- Sticky `Submit` / `Submitted` button at bottom

**Tap targets:** min 48×48 per option card. Full-width on narrow viewports.

### 6.5 After-submit state

Show `Submitted` (disabled button) until reveal. On reveal, swap to a per-type reveal component:
- Correct: big green ✅ + "+ 94 points"
- Wrong: red ❌ + "0 points" + highlight correct option
- Tie into `GET /slides/{id}/my-answer` for the authoritative result — don't trust a broadcast.

### 6.6 Review screen (post-session)

Bottom-tab "My Answers / All Slides" (image 5). After host ends session:
- **My Answers** tab — list of slides with your answer, correct answer, points earned
- **All Slides** tab — read-only deck walkthrough

Skip AhaSlides' "Sign in to save" upsell (image 7) — we're not pushing signups from participant view.

### 6.7 Reconnect/refresh behaviour

Already handled by `useSessionSync` (main plan §3.8) + `sessionStorage`-stored token. Verify:
- Refresh during `answering` → resumes with remaining time
- Refresh during `reveal` → shows reveal
- Tab background → resyncs on visibility (existing hook behaviour)

**Phase 6 exit criteria:** three browser tabs + one phone join the same session, all progress through all slide types, answers submit, reveals show, leaderboard renders with avatars + deltas.

---

## Phase 7 — New question types implementation

**Goal.** Implement the five types that don't exist today (Match Pairs, Correct Order, Categorise, Spinner Wheel, Short Answer variant).
**Duration.** 5–6 days. Parallelisable — one type per dev per day.

Each type follows the same pattern (five components already outlined). Notable implementation notes per type:

### 7.1 Short Answer

Author enters 1–5 accepted answers + case-sensitivity flag. Matching: trim, collapse whitespace, lowercase if case-insensitive, exact compare to each accepted. No fuzzy match in v1 (Levenshtein is a v2 ask). Participant UI: single text input, Submit button.

### 7.2 Match Pairs

Author: 2–8 pairs, each pair has a `left` + `right` label (optional images). Participant UI: two columns, tap left then tap right to connect (visual line drawn). Submit when all pairs connected. Scoring: `correct_pairs / total_pairs * points`. Shuffle right column per participant on mount (deterministic seed = participant_id + slide_id so refresh is stable).

### 7.3 Correct Order

Author: 3–8 items, author-defined correct order (stored as `payload.correct_index` per option). Participant UI: vertical list with drag handles, initial shuffle (same seeded shuffle pattern). Scoring: exact match = full, else `items_in_correct_position / total * points`.

### 7.4 Categorise

Author: 2–5 categories, 4–20 items, each item assigned a `correct_category_key` in `payload`. Participant UI: categories as drop zones (horizontal row on desktop, stacked on mobile), items draggable from a pool. Scoring: `items_in_correct_category / total * points`.

### 7.5 Spinner Wheel

Simpler than it looks. Author: 2–12 options, each optionally weighted. Live flow:
1. Host clicks Start → server picks weighted-random winner, broadcasts `spin.started` with `target_angle`
2. All clients animate a 3-second CSS rotation to that angle
3. Server broadcasts `slide.state.changed → reveal` when animation ends
4. Everyone sees the landed option. Scoring: *flat* points to anyone who *picked that option before the spin* if author enabled "participant prediction mode"; otherwise the slide is purely a randomiser with 0 points.

v1 ships prediction mode *off* by default — the wheel is mostly for engagement, not scoring. Revisit based on user feedback.

### 7.6 Tests per type

For each: Pest backend test asserting `ScoringService::score()` handles the full truth table (all-correct, all-wrong, partial, empty submission, malformed payload).

**Phase 7 exit criteria:** every type round-trips edit → present → answer → reveal with correct points awarded.

---

## Phase 8 — Polish, responsive, cleanup, docs

**Goal.** Ship-ready. Absorbs the applicable parts of main plan §4–§6.
**Duration.** 3–4 days.

### 8.1 Responsive pass

- Participant view tested at 320px, 375px, 414px, 768px
- Presenter view tested at 1280×720 (projector), 1920×1080, ultrawide
- Editor desktop-only acceptable for v1; mobile editor parked for v2

### 8.2 Cleanup

- Delete old quiz routes: `quiz-creator`, `quiz-edit`, `quiz-play`, `quiz-reports` (if it was tied to old model; rebuild on new model if used)
- Delete old `attempt/quize/play/[id]`, `live/quiz/`, `create-live/` quiz pieces
- Delete old Redux slices / service files under `features/quiz/` no longer used
- Grep for dead imports: `grep -rn "from.*quiz.*Question" frontend/src`

### 8.3 Load test (reuse main plan §5.2)

- 500 participants join same session
- `slide.changed` propagation <500ms
- 500 answers in 20s window, leaderboard updates correctly, no drops
- Reconnect 100 participants mid-session → all recover

### 8.4 Docs

Update `STRUCTURE_AND_DEVELOPMENT_GUIDE.md` with:
- Slide type registry (backend + frontend) — the one place to read when adding a new type
- State machine diagram
- Scoring formula
- Channel/event inventory (extending main plan's)

Add `QUIZ_ADDING_A_SLIDE_TYPE.md` — step-by-step for future devs.

### 8.5 Feature flag for gradual rollout (optional)

If you want beta users only at first, gate the new `/quizzes/[id]/edit` and `/present` routes behind a `quiz_v2_enabled` flag on the user model. Drop the flag after 2 weeks of stability.

---

## Timeline

| Phase | Duration | Parallelisable with |
|---|---|---|
| 1. Data model & core backend | 2–3 days | — |
| 2. Authoring API | 2–3 days | Phase 4 can start on mocks |
| 3. Live-session API | 3–4 days | Phase 5 can start on mocks |
| 4. Editor UI | 4–5 days | Phase 2 |
| 5. Presenter UI | 4 days | Phase 3 |
| 6. Participant UI | 3–4 days | Phase 5 (partial) |
| 7. New question types | 5–6 days | Phase 6 (per-type slices) |
| 8. Polish + cleanup + docs | 3–4 days | — |
| **Total (serial)** | **26–33 days** | |
| **Total (two devs, parallelised)** | **~18–22 days** | |

With two devs: dev A owns Phases 1→3→7-backend; dev B owns Phases 4→5→6→7-frontend. Sync at Phase 2 end (API contract freeze) and Phase 3 end (state-machine contract freeze).

---

## Decision log (additions to main plan's)

| Decision | Rationale |
|---|---|
| Greenfield schema; drop old quiz tables | User confirmed no data-migration requirement. Keeping both would double the surface area of every slide-type handler. |
| Single `quiz_slides` table with `type` discriminator + JSON `config` | Matches AhaSlides' own model; makes new slide types additive with no migrations. |
| Slide type registry on both sides | One class per type, same five hooks. Stops controllers from growing switch statements as types multiply. |
| Server-authoritative state machine with Redis-queued transition jobs | Reverb isn't a scheduler; Laravel scheduler is minute-granular. Redis-delayed jobs are the only sub-second mechanism that survives server restarts. |
| Opaque answer-submit response + separate `my-answer` endpoint | Prevents leaking correctness before reveal via network-tab inspection. |
| No emoji reactions, chat, hand-raise, confetti, "sign in to save" | User confirmed: core quiz only. Keeps surface focused; can add later without rework. |
| 40-emoji curated avatar list, server-validated | Prevents garbage input and makes the leaderboard look consistent. |
| Spinner Wheel ships without prediction scoring in v1 | Prediction scoring is an engagement feature, not a quiz-core feature. Ship the animation, validate interest, add scoring later. |
| Editor is desktop-only in v1 | AhaSlides' own mobile editor is weak. Not worth the build cost pre-validation. |
| Reuse Phase 2/3 channels + events verbatim | The Reverb architecture is already correct. Only payloads change. |
