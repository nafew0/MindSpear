# MindSpear Quiz Redesign — Slide-Based Quiz (AhaSlides Parity)

> **Goal.** Rebuild the Quiz module so authoring, hosting, and participation feel indistinguishable from AhaSlides. Slide-based editor, per-slide question types, time-weighted scoring with per-slide min/max, QR join, 5-second "Get ready" countdown, animated results, emoji-avatar participants, global leaderboard slide.
>
> **Out of scope (for now).** Poll, Word Cloud, Q&A, Rating Scale, emoji reactions, audience chat, AI option generation, templates marketplace, full Spinner Wheel prediction/scoring mode, and other non-core engagement features. Quest module is not touched by this plan; it will get a Mentimeter-style redesign later and will reuse as much of the slide infrastructure as possible.
>
> **Scope confirmed with user.**
> - Quiz only; Quest stays on its current redesign trajectory.
> - Greenfield Quiz v2 data — no migration of existing legacy quizzes/questions/sessions required.
> - Build Quiz v2 alongside the current Quiz v1 flow first. Do **not** drop legacy quiz tables until the v2 vertical slice is proven, the feature flag is enabled for default use, and cutover is complete.
> - Core slide types: Pick Answer, Short Answer, Match Pairs, Correct Order, Categorise, plus Content + Heading slides, QR Code slide, Leaderboard slide, and a simplified Spinner Wheel engagement slide.
> - Per-slide min/max points with time-based interpolation (AhaSlides model), plus a global Leaderboard slide.
> - Core quiz experience only — no emoji reactions, chat, hand-raise, live feedback screen, etc.
>
> **Relationship to [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).** Phases 0–3 of that plan are complete: Reverb is live, Socket.IO is gone, public/private channel split works, participant-token flow is in place. This plan builds *on top of* that realtime foundation — the existing `LiveSessionService`, generic `LiveBroadcastEvent`, channel split, and participant-token auth pattern are reused unless a dedicated typed event gives clear value. Phase 4+ of the main plan (UI polish, testing, docs) applies to the redesigned Quiz as a whole.
>
> **Database decision.** Same as main plan — SQLite acceptable locally, PostgreSQL is production target. Every new migration, JSON filter, aggregate, or raw SQL in this plan must be checked against PostgreSQL before merge.

> **Cutover decision.** Quiz v2 is a build-alongside replacement, not a Phase 1 table drop. The new API uses correctly spelled `/quizzes` routes and a new `quizzes` authoring table while legacy Quiz v1 keeps its current `/quizes` routes and `quizes` table during development. Runtime tables that conflict with legacy names use v2-safe names until cutover. Legacy table removal happens only in the final cutover phase.

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
| `spinner_wheel` | Engagement | No in v1 | Options array | View-only during spin | Simplified: host spins, server picks weighted/random landing. Prediction scoring is v1.1+ |
| `heading` | Content | No | — | Read-only | Title + subtitle |
| `content` | Content | No | — | Read-only | Rich text body + optional image |
| `qr_code` | Content | No | — | Read-only | Auto-shows join code + QR; can be reused mid-deck |
| `leaderboard` | System | No | — | Read-only | Top N after points-so-far; can be inserted anywhere |

**Design principle:** every slide type defines the *same five hooks* (Creator view, Present view, Participant view, scoring function, validation schema). Adding a new type in the future = implementing those five hooks.

### Channels and events (reused from Phase 2/3)

Same public/private split as Phase 2/3:

- **Public** `session.quiz.{publicChannelKey}` — all participants + host receive slide-state events.
- **Private** `host.quiz.v2.{sessionId}` during build-alongside — host-only answer stream, participant join details.

The v2 private channel is namespaced during coexistence so numeric IDs from legacy `quiz_sessions` cannot collide with new session IDs. After cutover, either keep the v2 namespace as the canonical channel or collapse it back to `host.quiz.{sessionId}` in a dedicated cleanup.

New event payloads:

| Event | Channel | Purpose |
|---|---|---|
| `slide.changed` | Public | Replaces `task.changed` semantics but keyed on slide, not question |
| `slide.state.changed` | Public | State machine transitions: `waiting → get_ready → answering → reveal → done` |
| `slide.reveal` | Public | After lock: correct answer + aggregate counts + option images |
| `leaderboard.updated` | Public | Already exists; payload now carries `points_delta` per player (for +94 animation) |
| `answer.submitted` | Private (host) | Already exists; payload adds `time_to_answer_ms` and `points_awarded` |

Implementation note: prefer routing these events through the existing `LiveSessionService` + generic `LiveBroadcastEvent` layer. Add typed payload DTOs/tests around that layer instead of creating a parallel tree of broadcast classes unless the generic layer becomes a real limitation.

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

Session-level state lives on `quiz_v2_sessions` (`current_slide_run_id`, `status`, `timer_state` JSONB). Per-slide runtime state lives on `quiz_v2_session_slide_runs` (`state`, `state_version`, `state_started_at`, `answering_started_at`, `revealed_at`). On reconnect, clients call `GET /quiz-sessions/{id}/state` and restore from that backend snapshot.

**The 5s "Get ready" is configurable** (on/off globally per quiz; default on). AhaSlides uses it to let the question display before the timer starts so late-joiners aren't penalised.

### Session slide snapshots

Authoring slides are mutable. Live sessions must not read scoring, answer keys, timing, or option order directly from the latest authoring slide after the session starts.

When a host starts a session, create one `quiz_v2_session_slide_runs` row per slide with:

- `slide_id` — pointer back to the authoring slide
- `position` and `type` — copied for fast navigation
- `slide_snapshot` JSONB — title, body, config, options, correct answers, time/points settings
- `state` — `waiting|get_ready|answering|reveal|done`
- `state_version` — incremented on every transition so delayed jobs can safely no-op if stale
- `eligible_participant_count` — set when the slide enters `answering`, used for "all submitted" checks

Answers reference the slide run, not just the authoring slide. This keeps reports stable even if the quiz is edited after a session.

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
- Quiz v2 stores `display_name` and `emoji_avatar` as first-class columns on `quiz_v2_participants`. Legacy Quiz v1 may continue using `quiz_participants.anonymous_details` until cutover.

---

## Phase 1 — Data model & core backend

**Goal.** New v2 tables, models, registry, and migration path. Zero UI.
**Duration.** 3–4 days.

### 1.1 Build v2 schema beside legacy Quiz

Do **not** drop legacy Quiz tables in this phase. Legacy Quiz v1 continues to use:

- `quizes`
- `questions`
- `quiz_sessions`
- `quiz_participants`
- `user_quiz_answers`
- `quiz_origins`
- quiz bank tables such as `quiz_q_bank_categories`, `quiz_q_banks`, `quiz_q_bank_questions`, `quiz_bank_questions`

Create v2 tables that can coexist with those names. Commit as "add quiz v2 slide schema beside legacy quiz."

### 1.2 New quiz tables

| Table | Purpose |
|---|---|
| `quizzes` | V2 deck metadata: `id`, `owner_id`, `title`, `description`, `cover_image_path`, `settings` (JSONB: default_time, default_points_min/max, speed_bonus_enabled, get_ready_seconds=5), `published_at`, timestamps. This intentionally corrects legacy `quizes`. |
| `quiz_slides` | `id`, `quiz_id`, `type`, `position`, `title`, `body`, `config` (JSONB), `time_limit_seconds`, `points_min`, `points_max`, `speed_bonus_enabled`, `get_ready_seconds`, timestamps. Unique `(quiz_id, position)` |
| `quiz_slide_options` | `id`, `slide_id`, `position`, `label`, `image_path`, `is_correct`, `payload` (JSONB: for pair_key, category_key, correct_order_index), timestamps |
| `quiz_v2_sessions` | `id`, `quiz_id`, `host_user_id`, `public_channel_key`, `join_code`, `status` (pending/live/ended), `current_slide_run_id`, `timer_state` (JSONB), `started_at`, `ended_at` |
| `quiz_v2_session_slide_runs` | `id`, `quiz_v2_session_id`, `slide_id`, `position`, `type`, `slide_snapshot` (JSONB), `state`, `state_version`, `state_started_at`, `answering_started_at`, `revealed_at`, `eligible_participant_count`, timestamps |
| `quiz_v2_participants` | `id`, `quiz_v2_session_id`, `display_name`, `emoji_avatar`, `participant_token_hash`, `participant_token_expires_at`, `participant_token_revoked_at`, `total_points`, `joined_at`, `left_at` |
| `quiz_v2_participant_answers` | `id`, `quiz_v2_participant_id`, `quiz_v2_session_slide_run_id`, `answer_payload` (JSONB), `time_to_answer_ms`, `is_correct`, `points_awarded`, `submitted_at` |

**Indexes to add up-front:**
- `quiz_slide_options(slide_id, position)`
- `quiz_v2_session_slide_runs(quiz_v2_session_id, position)` unique
- `quiz_v2_session_slide_runs(quiz_v2_session_id, slide_id)`
- `quiz_v2_participant_answers(quiz_v2_participant_id, quiz_v2_session_slide_run_id)` unique (one answer per slide run per participant)
- `quiz_v2_sessions(join_code)` unique
- `quiz_v2_sessions(public_channel_key)` unique
- `quiz_v2_participants(participant_token_hash)` unique

**PostgreSQL check:** test the JSON columns (`settings`, `config`, `payload`, `slide_snapshot`, `answer_payload`, `timer_state`) with real queries — we'll need `jsonb_path_query` / `->` operators for analytics. Use `jsonb`, not `json`.

### 1.3 Slide type registry (PHP)

Create `app/Quiz/Slides/SlideTypeRegistry.php` with one class per type implementing `SlideTypeContract`:

```php
interface SlideTypeContract {
    public function key(): string;                          // 'pick_answer_single'
    public function validateConfig(array $config): array;   // Validator rules
    public function validateAnswer(array $payload): array;  // Validator rules
    public function score(SlideRuntimeContext $context, array $payload, int $timeToAnswerMs): ScoreResult;
    public function aggregateForReveal(SlideRuntimeContext $context, Collection $answers): array;
    public function serializeForPresenter(QuizSlide|QuizV2SessionSlideRun $slide): array;   // Host/editor payload
    public function serializeForParticipant(QuizSlide|QuizV2SessionSlideRun $slide): array; // Participant payload (strips correct-answer info!)
}
```

**Critical:** `serializeForParticipant` must strip `is_correct` from options. Today this is likely leaked.

`SlideRuntimeContext` is a small value object built from the immutable `slide_snapshot` during live scoring/reveal. Authoring validation can still use the editable `QuizSlide` model.

Register types in `QuizServiceProvider`. Controllers dispatch to the registry instead of switch-on-string.

### 1.4 Broadcast event layer

Do not build a second broadcast architecture. Reuse the Phase 2/3 live layer:

- `App\Services\Live\LiveSessionService` for channel naming, public/private broadcast routing, and after-commit dispatch
- `App\Events\Live\LiveBroadcastEvent` for generic Reverb broadcasts
- frontend `useSessionChannel`, `useHostChannel`, and `useSessionSync` as the base subscription/sync hooks

Extend `LiveSessionService` with v2 channel helpers rather than hard-coding channel strings in controllers.

Add typed constants/DTOs/tests for the new event payloads:

- `slide.changed` (public) — current slide run + participant-safe slide snapshot
- `slide.state.changed` (public) — state transition + `state_started_at` + `duration_seconds` + `state_version`
- `slide.reveal` (public) — aggregate + correct answer payload safe for reveal
- `answer.submitted` (private host) — individual answer details + `time_to_answer_ms` + `points_awarded`
- `leaderboard.updated` (public/private as needed) — top N + `points_delta`

All broadcasts must happen after database commit. If using the existing generic event, keep using `LiveSessionService::afterCommit()`; if adding dedicated event classes later, make them after-commit safe too.

### 1.5 Broadcasts throttling

`AnswerAggregateUpdated`-style events stay on a 250–500ms Redis-backed debounce (main plan §2.8). The reveal event is immediate and final.

**Phase 1 exit criteria:** migrations run clean on PostgreSQL, the generic live broadcaster can emit `slide.changed`/`slide.state.changed` successfully, and all registry types pass unit tests for `score()` or explicitly return unscored.

---

## Phase 2 — Backend authoring API

**Goal.** CRUD endpoints the slide editor needs. No live-session behaviour yet.
**Duration.** 2–3 days.

These are Quiz v2 endpoints. Legacy Quiz v1 routes under `/api/v1/quizes` stay in place until the cutover phase.

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
- `spinner_wheel` → 4 options, no time limit, no points in v1
- `heading` → no time, no points
- `content` → no time, no points
- `qr_code` → no time, no points, auto-rendered
- `leaderboard` → no time, no points, `top_n = 10` in config

### 2.3 Image upload

Reuse existing file-storage conventions (check `backend/app/Services/` for the current uploader). Store under `storage/app/quiz-slide-options/{slide_id}/{uuid}.{ext}`. Return URL via existing `getSourceContentUrlAttribute` pattern. Max 2MB, resize to max 1024×1024 on upload (use `intervention/image` if not already installed).

### 2.4 Join-code generation

6-character alphanumeric (A-Z, 2-9 — skip 0/O/1/I for legibility). Generate on `POST /quizzes/{id}/sessions`, unique across all `quiz_v2_sessions` (no reuse). Collision retry: 5 attempts, error if unlucky. Global uniqueness avoids partial-index differences between SQLite/PostgreSQL and keeps support/debugging simpler.

### 2.5 Validation

All config validation goes through the slide type registry (Phase 1.3). Controllers stay thin.

**Phase 2 exit criteria:** Postman/Pest collection that creates a quiz, appends one slide of every type, edits each, reorders, duplicates, deletes — all green against PostgreSQL.

---

## Phase 3 — Backend live-session API

**Goal.** State-machine endpoints + scoring + leaderboard. Wire Reverb broadcasts.
**Duration.** 4–5 days.

### 3.1 New endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/quizzes/{id}/sessions` | Host starts a session → returns `{session_id, join_code, public_channel_key}` |
| `GET` | `/api/v1/quiz-sessions/by-code/{code}` | Join-code lookup for participant join page |
| `GET` | `/api/v1/quiz-sessions/{id}/state` | Full resync snapshot (from main plan §2.5) |
| `POST` | `/api/v1/quiz-sessions/{id}/advance` | Host-controlled transitions (next slide, reveal, end) — see 3.2 |
| `POST` | `/api/v1/quiz-sessions/{id}/end` | Host ends session early |
| `GET` | `/api/v1/quiz-sessions/{id}/leaderboard` | Current leaderboard (paginated, for Leaderboard slide) |
| `POST` | `/api/v1/quiz-sessions/{id}/participants/join` | Anonymous join — name + emoji → `{participant_id, participant_token}` |
| `POST` | `/api/v1/quiz-sessions/{id}/slide-runs/{slideRunId}/answers` | Submit answer (participant-token auth) |
| `GET` | `/api/v1/quiz-sessions/{id}/slide-runs/{slideRunId}/my-answer` | Participant-specific reveal result |

### 3.2 Advance endpoint — single entry point for host-driven transitions

Body: `{ action: 'start_slide' | 'reveal' | 'next_slide' | 'previous_slide' | 'jump_to', slide_id?, target_slide_id? }`.

Server enforces legal transitions based on current state. Example: `start_slide` from `waiting` sets the current slide run state to `get_ready`, increments `state_version`, schedules a job to flip to `answering` after `get_ready_seconds`, which in turn schedules a job to flip to `reveal` after `time_limit_seconds`. Both transitions broadcast `slide.state.changed`. Host's "Reveal" button short-circuits the timer.

**Why jobs, not timers in the controller?** Reverb doesn't deliver timed broadcasts; Laravel scheduler doesn't run sub-minute. Use `dispatch(new TransitionSlideJob(sessionId, slideRunId, expectedStateVersion, action))->delay(now()->addSeconds(N))` on Redis queue. Each delayed job reloads the slide run and no-ops unless `slide_run_id`, `state`, and `state_version` still match, preventing stale delayed jobs from revealing or advancing the wrong slide.

### 3.3 Scoring service

`app/Services/Quiz/ScoringService.php` — single place that takes `(slideRun, answerPayload, timeToAnswerMs)` and returns `ScoreResult`. Delegates to slide-type registry using the immutable `slide_snapshot`. Called from the answer submission controller synchronously (cheap). Points update `quiz_v2_participants.total_points` in the same transaction.

### 3.4 Leaderboard service

`app/Services/Quiz/LeaderboardService.php`:

- `currentTopN(session, n)` — order by `total_points DESC, joined_at ASC`, return players with `rank`, `display_name`, `emoji_avatar`, `total_points`, and `points_delta` (points gained on last slide run, for the `+94` animation).
- Cache snapshot in Redis per slide transition (`leaderboard:quiz-v2-session:{id}:after-run:{slideRunId}`), TTL 1h. Never replay — each request either returns cached or rebuilds.

`leaderboard.updated` fires through the live broadcast layer on every `reveal → done` transition.

### 3.5 Participant join with emoji

```php
// POST /api/v1/quiz-sessions/{id}/participants/join
// Body: { display_name, emoji_avatar, join_code }

$session = QuizV2Session::where('join_code', $request->join_code)->firstOrFail();
abort_unless($session->status === 'live', 403, 'Session is not accepting participants.');

$rawToken = Str::random(64);
$participant = QuizV2Participant::create([
    'quiz_v2_session_id' => $session->id,
    'display_name'    => $request->display_name,
    'emoji_avatar'    => $request->emoji_avatar,     // one of a curated ~40 emoji list
    'participant_token_hash' => hash('sha256', $rawToken),
    'participant_token_expires_at' => now()->addHours(6),
    'total_points'    => 0,
]);

app(LiveSessionService::class)->broadcastHost('quiz', $session, 'participant.joined', [...]);
app(LiveSessionService::class)->broadcastPublic('quiz', $session, 'participant.count.updated', [...]);

return ['participant_id' => $participant->id, 'participant_token' => $rawToken, 'public_channel_key' => $session->public_channel_key];
```

Emoji list is a PHP constant (~40 curated emoji) to prevent garbage input. Reject anything not in list.

### 3.6 Answer submission

```php
// POST /api/v1/quiz-sessions/{id}/slide-runs/{slideRunId}/answers
// Header: X-Participant-Token
// Body: { answer_payload: {...}, client_submitted_at: "ISO" }

$participant = ParticipantTokenService::resolve($request->header('X-Participant-Token'), $sessionId);
abort_if($session->current_slide_run_id !== $slideRunId, 409, 'Not the current slide.');
abort_if($slideRun->state !== 'answering', 409, 'Slide is not accepting answers.');
abort_if(QuizV2ParticipantAnswer::where('quiz_v2_participant_id', $participant->id)->where('quiz_v2_session_slide_run_id', $slideRunId)->exists(), 409, 'Already answered.');

$timeToAnswer = now()->diffInMilliseconds($slideRun->answering_started_at);
$result = app(ScoringService::class)->score($slideRun, $request->answer_payload, $timeToAnswer);

DB::transaction(function () use (...) {
    QuizV2ParticipantAnswer::create([...]);
    $participant->increment('total_points', $result->pointsAwarded);
});

app(LiveSessionService::class)->broadcastHost('quiz', $session, 'answer.submitted', [...]);
app(QuizV2AggregateService::class)->recordAnswer($session->id, $slideRun->id); // Redis-debounced public aggregate

return ['submitted' => true]; // NEVER return is_correct / points here — participant sees at reveal
```

**Critical:** the response is deliberately opaque. Correctness is revealed only on state transition to `reveal`.

### 3.7 Reveal payload

On `reveal` transition, server computes aggregate and broadcasts `slide.reveal`:

```json
{
  "slide_run_id": 42,
  "slide_id": 12,
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

Participant-specific `is_correct` + `points_awarded` comes from a separate `GET /quiz-sessions/{id}/slide-runs/{slideRunId}/my-answer` (participant-token auth) fetched by client on reveal — keeps the broadcast payload small.

### 3.8 Tests (Pest, against PostgreSQL)

- Full happy path: create quiz → start session → 3 participants join → answer slide 1 → reveal → leaderboard updated → slide 2 → etc. → end.
- State-machine edge cases: double-advance, stale delayed job no-op via `state_version`, answering-after-reveal, late join (should work but miss past slides).
- Snapshot stability: edit the authoring slide after session start; the in-progress session still uses the original `slide_snapshot`.
- Scoring: time interpolation, partial credit, zero on wrong.
- Token revocation: revoked token rejected.
- Authorization: non-host calling `/advance` → 403.

**Phase 3 exit criteria:** full Pest suite green on PostgreSQL; Tinker-driven 3-participant smoke test produces correct leaderboard.

---

## Phase 4 — Frontend: slide editor

**Goal.** Three-panel authoring UI matching AhaSlides image 1. No live-session work yet.
**Duration.** 4–5 days.

### 4.1 Route & layout

Add a single slide-based editor at `app/(protected)/quizzes/[id]/edit/` behind `quiz_v2_enabled`. Legacy `app/(protected)/quiz-creator/` and `app/(protected)/quiz-edit/` stay available until Phase 9 cutover.

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
- **Add slide** via `+ New slide` button → opens `SlidePicker` modal (image 2, with unsupported rows hidden in v1).
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
**Duration.** 4–5 days.

### 5.1 Route

`app/(protected)/quizzes/[id]/present/` — host-only, Sanctum-guarded. On mount:
1. `POST /quizzes/{id}/sessions` to create a session
2. Subscribe to public `session.quiz.{publicChannelKey}` via `useSessionChannel` (already built in main plan §3.3)
3. Subscribe to private `host.quiz.v2.{sessionId}` via `useHostChannel` (extend the existing hook to support the v2 namespace)
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

Authoritative timer is on the server (`slide.state.changed` carries `state_started_at`, `duration_seconds`, and `state_version`). Frontend only ticks locally between events for smooth UI. On reconnect, `useSessionSync` (already exists) resyncs and replaces local state from the backend snapshot.

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
**Duration.** 4–5 days.

### 6.1 Routes

- `app/(public)/join/page.tsx` — enter join code (6-char). Already exists at `(public)/join` per the current tree; repurpose / redirect.
- `app/(public)/join/[code]/page.tsx` — enter name + pick emoji avatar (image 4). Calls `/participants/join`.
- `app/(public)/play/[publicChannelKey]/page.tsx` — the live answering page. Stores participant token in `sessionStorage`.

Keep old `app/(public)/attempt/quize/` and `app/(public)/live/quiz/` routes until Phase 9 cutover.

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

The existing `useSessionChannel` currently understands question/task events. Extend it for v2 slide payloads (`currentSlideRunId`, `currentSlide`, `slideState`, `stateVersion`, `secondsRemaining`) while preserving the old event bridge until legacy Quiz is removed.

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
- Tie into `GET /quiz-sessions/{id}/slide-runs/{slideRunId}/my-answer` for the authoritative result — don't trust a broadcast.

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

**Goal.** Implement the scored types that don't exist today (Match Pairs, Correct Order, Categorise, Short Answer variant) plus the simplified Spinner Wheel engagement slide.
**Duration.** 6–8 days. Parallelisable by type after the first vertical slice establishes the pattern.

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
4. Everyone sees the landed option. In v1, this slide is unscored and acts as a randomiser/engagement slide.

Prediction scoring is a v1.1+ feature, not a hidden toggle in v1. If added later, it should use the same answer-submit/reveal pipeline as other scored slides and have explicit tests.

### 7.6 Tests per type

For each scored type: Pest backend test asserting `ScoringService::score()` handles the full truth table (all-correct, all-wrong, partial, empty submission, malformed payload). For Spinner Wheel: assert winner selection is deterministic under a seeded random source, weighted options behave correctly, and no points are awarded in v1.

**Phase 7 exit criteria:** every scored type round-trips edit → present → answer → reveal with correct points awarded; Spinner Wheel round-trips edit → present → spin → reveal without awarding points.

---

## Phase 8 — Polish, responsive, cleanup, docs

**Goal.** Ship-ready. Absorbs the applicable parts of main plan §4–§6.
**Duration.** 3–4 days.

### 8.1 Responsive pass

- Participant view tested at 320px, 375px, 414px, 768px
- Presenter view tested at 1280×720 (projector), 1920×1080, ultrawide
- Editor desktop-only acceptable for v1; mobile editor parked for v2

### 8.2 Cleanup

- Clean up only v2-owned dead code in this phase.
- Do not delete legacy Quiz v1 routes/tables yet unless the cutover phase has already been approved and completed.
- Mark old quiz routes for removal after cutover: `quiz-creator`, `quiz-edit`, `quiz-play`, `quiz-reports` (if tied to old model), `attempt/quize/play/[id]`, `live/quiz/`, `create-live/`.
- Mark old Redux slices / service files under `features/quiz/` for removal after no v1 route imports them.
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

### 8.5 Feature flag for gradual rollout

Gate the new `/quizzes/[id]/edit` and `/present` routes behind a `quiz_v2_enabled` flag. Use it in three stages:

1. Internal users only while the `pick_answer_single` vertical slice is stabilising.
2. Beta users after all v2 slide types pass manual and Pest coverage.
3. Default-on after load testing and report review pass.

Drop the flag only after the final cutover has been stable for at least 2 weeks.

---

## Phase 9 — Cutover and legacy removal

**Goal.** Make Quiz v2 the default Quiz module and remove old Quiz v1 safely.
**Duration.** 2–3 days after v2 has been running behind the flag.

### 9.1 Cutover checklist

- Confirm `quiz_v2_enabled` has been default-on for the agreed beta group.
- Run PostgreSQL test suite and load test.
- Take a database backup in the target environment.
- Freeze legacy Quiz creation during cutover, or redirect new creation to v2 only.
- Verify no frontend route still imports v1 quiz creation/play/report components.
- Verify no backend route/controller needed by v2 still queries legacy `quizes`, `questions`, `quiz_sessions`, `quiz_participants`, or `user_quiz_answers`.

### 9.2 Legacy cleanup migration

Only after the checklist passes, drop legacy Quiz v1 tables:

- `user_quiz_answers`
- `quiz_participants`
- `quiz_sessions`
- `questions`
- `quiz_origins`
- `quiz_q_bank_questions`
- `quiz_q_banks`
- `quiz_q_bank_categories`
- `quiz_bank_questions`
- `quizes`

Keep Quest and Survey tables untouched.

### 9.3 Naming after cutover

Preferred: keep `quizzes`, `quiz_slides`, `quiz_slide_options`, and the `quiz_v2_*` runtime tables as canonical names, then document them clearly in `STRUCTURE_AND_DEVELOPMENT_GUIDE.md`. Avoid a second rename unless there is a strong reason.

If the team wants clean runtime names (`quiz_sessions`, `quiz_participants`, `quiz_participant_answers`) after legacy removal, do that in a separate post-cutover migration and update models/routes in one dedicated commit.

---

## Timeline

Build by vertical slice, not by completing every backend detail before any frontend work. The first full slice is `pick_answer_single`: create deck → add slide → present → join → answer → reveal → leaderboard → reconnect → end. Freeze the contracts from that slice before adding the remaining types.

| Phase | Duration | Parallelisable with |
|---|---|---|
| 1. Data model & core backend | 3–4 days | — |
| 2. Authoring API | 2–3 days | Phase 4 can start on mocks |
| 3. Live-session API | 4–5 days | Phase 5 can start on mocks |
| 4. Editor UI | 4–5 days | Phase 2 |
| 5. Presenter UI | 4–5 days | Phase 3 |
| 6. Participant UI | 4–5 days | Phase 5 (partial) |
| 7. New question types | 6–8 days | Phase 6 (per-type slices) |
| 8. Polish + cleanup + docs | 3–4 days | — |
| 9. Cutover + legacy removal | 2–3 days | After beta stability |
| **Total (serial)** | **32–42 days** | |
| **Total (two devs, parallelised)** | **~22–30 days** | |

With two devs: dev A owns v2 schema, backend state machine, scoring, and backend tests; dev B owns editor/presenter/participant UI. Sync at the end of the `pick_answer_single` vertical slice, then again after the state-machine contract is stable.

### Recommended vertical-slice order

1. Schema + registry + session slide snapshots.
2. `pick_answer_single` end-to-end.
3. `pick_answer_multi` and `short_answer`.
4. `correct_order`, then `match_pairs`, then `categorise`.
5. QR, content, heading, and leaderboard polish.
6. Spinner Wheel unscored engagement slide.
7. Feature-flag beta, load test, docs, then cutover.

---

## Decision log (additions to main plan's)

| Decision | Rationale |
|---|---|
| Greenfield v2 data, build beside legacy first | User confirmed no data-migration requirement, but legacy tables stay until the v2 vertical slice and cutover are proven. This reduces rollback risk. |
| New `quizzes` table corrects legacy `quizes` typo | The new authoring table can coexist with old `quizes`, so this is the safest moment to fix the public spelling for v2. |
| V2 runtime tables use `quiz_v2_*` names during coexistence | Legacy `quiz_sessions` and `quiz_participants` already exist. Non-conflicting v2 names let both flows run while the feature flag is active. |
| Single `quiz_slides` table with `type` discriminator + JSON `config` | Matches AhaSlides' own model; makes new slide types additive with no migrations. |
| Session slide snapshots | Live sessions and reports must remain stable if an author edits a quiz after starting a session. Answers reference immutable slide runs. |
| Slide type registry on both sides | One class per type, same five hooks. Stops controllers from growing switch statements as types multiply. |
| Reuse generic `LiveSessionService` + `LiveBroadcastEvent` | Phase 3 already created a working Reverb abstraction. Add typed payloads around it instead of creating a second event architecture. |
| Server-authoritative state machine with Redis-queued transition jobs and `state_version` guards | Reverb isn't a scheduler; Laravel scheduler is minute-granular. Redis-delayed jobs are needed, but stale jobs must no-op after host-driven transitions. |
| Opaque answer-submit response + separate `my-answer` endpoint | Prevents leaking correctness before reveal via network-tab inspection. |
| No emoji reactions, chat, hand-raise, confetti, "sign in to save" | User confirmed: core quiz only. Keeps surface focused; can add later without rework. |
| 40-emoji curated avatar list, server-validated | Prevents garbage input and makes the leaderboard look consistent. |
| Spinner Wheel ships unscored in v1 | Prediction scoring is an engagement feature, not quiz-core. Ship the animation/randomiser, validate interest, add scoring later as v1.1+. |
| Editor is desktop-only in v1 | AhaSlides' own mobile editor is weak. Not worth the build cost pre-validation. |
| Reuse Phase 2/3 public/private channel split | The Reverb architecture is already correct. V2 namespaces the private channel during coexistence to avoid ID collisions. |
