# MindSpear - Phase-by-Phase Development Plan

> This plan covers: Reverb migration, code cleanup, folder restructuring, UI overhaul, chart consolidation, theming, and architecture hardening. Each phase is ordered by dependency - later phases build on earlier ones.
>
> **Key architectural decision:** Participants join anonymously (no login required), like AhaSlides/Mentimeter. This means we cannot use authenticated presence channels for the participant side. Instead, we use **public channels for broadcast** and **participant tokens for REST submissions**.
>
> **Database decision:** Local development may use SQLite for speed, but production will use PostgreSQL. Any new migration, query, JSON filter, aggregate, or raw SQL added during this plan must be checked against PostgreSQL before deployment. SQLite is acceptable for quick local work, but PostgreSQL must be the compatibility target.

---

## Phase 0: Foundation (Before Any Feature Work)

**Goal:** Set up version control, clean house, and establish the standards everything else builds on.

**Duration:** 2-3 days

**Commit strategy:** Phase 0 must be split into small, reversible commits. Do not combine git initialization, dead-code deletion, spelling renames, in-code renames, and commented-code cleanup into one large cleanup commit.

### 0.1 Phase 0A: Initialize Git and Commit Clean Baseline

- [x] `git init` in project root
- [x] Create `.gitignore` for Laravel, Next.js, Node
- [x] Add rule: `*.Zone.Identifier` (Windows->WSL artifacts everywhere)
- [x] Add rules: `.env`, `node_modules/`, `vendor/`, `.next/`, `storage/logs/`
- [x] Delete all `*.Zone.Identifier` files from the repo
- [x] Initial commit with current state (so you have a rollback point)

**Commit:** Baseline only. No refactors, deletions, spelling changes, or code cleanup in this commit.

### 0.2 Phase 0B: Delete Dead Code and Duplicate Files

**Review and delete:**

| File/Dir | Reason |
|----------|--------|
| `frontend/src/components/Liveui/QuickFormPreview copy.tsx` | Copy file, not imported anywhere |
| `frontend/src/components/loadding/` (entire directory) | Misspelled duplicate of `loading/` |
| `frontend/src/utils/sockerReconnected.ts` | Typo filename, `useSocketStatusComparison()` hook never used |
| `frontend/src/components/Chart/D3WordCloud.tsx` | Entirely commented-out D3 implementation, replaced by Highcharts |
| `socket-server/server-latest-copy.js` | Backup file in source |
| `socket-server/quest_operations.js` | Defines functions never imported by `server.js` |
| `socket-server/quiz_operations.js` | Defines functions never imported by `server.js` |
| `frontend/mindspear_frontend-dev.zip` | Build artifact in source |
| `frontend/mindspear_frontend-dev/` | Extracted build artifact |

**For each file:** Confirm it's not imported anywhere with `grep -r "filename" src/` before deleting.

**Commit:** Dead-file deletion only.

### 0.3 Phase 0C: Fix Spelling Mistakes in File/Folder Names

This must happen early because later phases reference these paths.

| Current Name | Correct Name | Files to Update Imports |
|-------------|-------------|------------------------|
| `components/loadding/` | DELETE (use `components/loading/`) | All files importing from `loadding` |
| `components/Dashboard/QuizPublict/` | `components/Dashboard/QuizPublic/` | All imports referencing `QuizPublict` |
| `components/Liveui/WatingRoomComponent.tsx` | `components/Liveui/WaitingRoomComponent.tsx` | All imports |
| `components/Liveui/WatingRoomComponentQuiz.tsx` | `components/Liveui/WaitingRoomComponentQuiz.tsx` | All imports |
| `components/Liveui/QuickFromAnswerView.tsx` | `components/Liveui/QuickFormAnswerView.tsx` | All imports |
| `components/Liveui/QuickFromCreateorView.tsx` | `components/Liveui/QuickFormCreatorView.tsx` | All imports |
| `components/Liveui/QuestContantComponent.tsx` | `components/Liveui/QuestContentComponent.tsx` | All imports |
| `components/Dashboard/QuestComplitedPages.tsx` | `components/Dashboard/QuestCompletedPages.tsx` | All imports |
| `stores/features/ledaerboardAnswersSlice.ts` | `stores/features/leaderboardAnswersSlice.ts` | All imports |
| `stores/features/questQsenTimeSlice.ts` | `stores/features/questQuestionTimeSlice.ts` | All imports |
| `utils/QuickFromTransform.ts` | `utils/quickFormTransform.ts` | All imports |
| `utils/QuestConvertDataComponent.tsx` | `utils/questDataTransformer.ts` | All imports (also: utils shouldn't be .tsx) |
| `components/Layouts/publicLayout/` | `components/Layouts/PublicLayout/` | All imports |

**Method for each rename:**
1. Grep for all imports of the old name
2. Rename the file/folder
3. Update every import
4. Build to verify no breakage

**Commit:** Rename files/folders in small batches. Do not mix filename renames with broad in-code variable renames.

### 0.4 Phase 0D: Fix In-Code Spelling Mistakes

Search and replace across the codebase:

| Typo | Correct | Scope |
|------|---------|-------|
| `complitedQuiz` | `completedQuiz` | Function names, variables, component methods |
| `complitedApiCall` | `completedApiCall` | Function names |
| `Complited` | `Completed` | Component names, strings, comments |
| `QuickFrom` | `QuickForm` | Variable names, function names (not filenames - those are Phase 0.3) |
| `displayQuizion` | `displayQuestion` | socket server variable names |
| `Horizantal` | `Horizontal` | `GlobalHorizantalBarChart` component and filename |
| `Publict` | `Public` | folder name and any references |
| `questiQsen` | `questQuestion` | Variable names in socket server and frontend |
| `quizQsen` | `quizQuestion` | Variable names in socket server and frontend |

**Commit:** In-code spelling fixes in small batches by feature area.

### 0.5 Phase 0E: Remove Commented-Out Code

Review and remove large blocks of commented-out code in:

- [ ] `socket-server/server.js` (~200 lines of commented code)
- [ ] `frontend/src/components/Chart/ScalesChart.tsx`
- [ ] `frontend/src/components/Chart/Mchart.tsx`
- [ ] Any other files found during Phase 0.3/0.4 work

**Rule going forward:** If code is removed, delete it. Git history preserves everything.

### 0.6 Commit

Do **not** commit all Phase 0 changes as a single cleanup commit. Use this sequence instead:

1. Phase 0A baseline commit
2. Phase 0B dead-code deletion commit
3. Phase 0C spelling/file rename commits in small batches
4. Phase 0D in-code spelling rename commits in small batches
5. Phase 0E commented-code cleanup commit

This keeps rollback easy if a rename or deletion breaks imports.

---

## Phase 1: Frontend Restructuring & Theming

**Goal:** Reorganize the frontend folder structure, establish a theming system, and consolidate charting libraries. This phase touches no business logic - just structure and configuration.

**Duration:** 3-4 days

**Priority adjustment:** Do not let Phase 1 delay the realtime fix. After minimal Phase 0 cleanup, move to Phase 2 Reverb/backend work and prove the live-session architecture first. Large folder restructuring, theming, and chart cleanup can happen after the backend realtime path and one frontend vertical slice are stable.

### 1.1 New Folder Structure

Reorganize `frontend/src/` to this structure:

```
frontend/src/
├── app/                          # Next.js App Router (unchanged)
│   ├── (auth)/
│   ├── (protected)/
│   ├── (public)/
│   └── api/
│
├── components/                   # Shared UI components only
│   ├── ui/                       # Atomic UI primitives
│   │   ├── Button.tsx
│   │   ├── Modal.tsx             # Consolidate globalModal + globalBigModal
│   │   ├── Pagination.tsx        # Rename from GlobalPagination
│   │   ├── Skeleton.tsx
│   │   ├── Table.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Loader.tsx
│   │   ├── ConfirmDialog.tsx     # Extract from showConfirmDialog utility
│   │   └── Toast.tsx
│   ├── charts/                   # All chart components (unified library)
│   │   ├── BarChart.tsx
│   │   ├── HorizontalBarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── DonutChart.tsx
│   │   ├── RadialBarChart.tsx
│   │   ├── TreemapChart.tsx
│   │   ├── ScalesChart.tsx
│   │   ├── WordCloud.tsx
│   │   ├── ProgressBar.tsx
│   │   └── chart-theme.ts       # Shared chart colors, responsive config
│   ├── editor/                   # Tiptap content editor (keep as-is)
│   ├── forms/                    # Form elements
│   │   └── InputGroup/
│   └── layout/                   # App-wide layout components
│       ├── Header/
│       ├── Sidebar/
│       ├── PublicHeader/
│       ├── QuizHeader/
│       ├── Breadcrumbs/
│       └── ErrorBoundary/
│
├── features/                     # Feature modules (domain-organized)
│   ├── auth/
│   │   ├── components/           # SignIn, SignUp forms
│   │   ├── store/                # authSlice
│   │   └── types.ts
│   ├── quiz/
│   │   ├── components/           # Quiz creator, editor, reports, live UI
│   │   │   ├── creator/
│   │   │   ├── live/             # ChoiceComponent, TrueFalseComponent, etc.
│   │   │   ├── reports/
│   │   │   └── bank/
│   │   ├── hooks/
│   │   ├── services/             # quizService.ts (consolidated API calls)
│   │   ├── store/                # quizSlice, quizInformationSlice
│   │   └── types.ts
│   ├── quest/
│   │   ├── components/
│   │   │   ├── creator/
│   │   │   ├── live/             # QuestChoiceComponent, Ranking, Scales, etc.
│   │   │   ├── reports/
│   │   │   └── bank/
│   │   ├── hooks/
│   │   ├── services/             # questService.ts
│   │   ├── store/                # questInformationSlice, questSessionSlice, etc.
│   │   └── types.ts
│   ├── survey/
│   │   ├── components/
│   │   │   ├── builder/
│   │   │   ├── reports/
│   │   │   └── bank/
│   │   ├── hooks/                # useSurveyAutoSave
│   │   ├── services/             # surveyService.ts
│   │   ├── store/                # surveySlice, surveyInformationSlice, etc.
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── components/
│   │   └── views/
│   ├── live/                     # Shared live session infrastructure (Phase 3)
│   │   ├── components/           # WaitingRoom, Timer, QRCode, Leaderboard
│   │   ├── hooks/                # useQuestChannel, useQuizChannel
│   │   ├── services/             # Echo client setup
│   │   └── types.ts
│   ├── discover/
│   │   └── components/
│   ├── profile/
│   │   └── components/
│   └── billing/
│       ├── components/
│       └── views/
│
├── config/                       # App-wide configuration
│   ├── theme.ts                  # Color palette, chart colors (Phase 1.2)
│   ├── api.ts                    # API base URL, timeout config
│   ├── constants.ts              # App-wide constants
│   └── env.ts                    # Environment variable access
│
├── hooks/                        # Shared hooks only
│   ├── useDebounce.ts
│   ├── useMobile.ts
│   └── useClickOutside.ts
│
├── lib/                          # Third-party wrappers
│   ├── axios.ts                  # axiosInstance (renamed from utils/)
│   ├── serverAxios.ts
│   └── echo.ts                   # Laravel Echo client (Phase 3)
│
├── stores/                       # Redux store setup only
│   └── store.ts                  # Store config, persist config, combine reducers
│
├── styles/
│   ├── globals.css               # Tailwind directives + global overrides
│   └── fonts.css                 # Satoshi font definitions
│
├── types/                        # Shared types only (feature-specific types live in features/)
│   ├── api.ts                    # API response types
│   └── common.ts                 # Shared utility types
│
└── utils/                        # Pure utility functions (no React, no components)
    ├── dateTime.ts               # Date/time formatting
    ├── chartDataTransformer.ts   # prepareChart.ts renamed
    ├── pdfUtils.ts
    ├── storageCleaner.ts
    └── quickFormTransform.ts
```

**Key principles:**
- **Feature-first organization:** Quiz, Quest, Survey are self-contained modules
- **No more `views/` directory:** Views are just pages in `app/` that compose feature components
- **Store slices live with their feature**, not in a global `stores/features/` dump
- **Shared components in `components/`**, feature-specific components in `features/{name}/components/`
- **No `services/` at root** - each feature owns its API service

**Migration approach:**
1. Create the new directory structure
2. Move files one feature at a time (start with `auth`, it's the smallest)
3. Update imports after each move
4. Build + verify after each feature migration
5. Delete empty old directories last

### 1.2 Theme Configuration System

Create a centralized theme config that Tailwind, charts, and components all read from.

**Create `frontend/src/config/theme.ts`:**

```typescript
// Central theme configuration
// Change these values to re-theme the entire application

export const theme = {
  colors: {
    primary: {
      DEFAULT: '#F79945',
      light: '#F9B474',
      dark: '#E07D2A',
      50: '#FFF5EB',
      100: '#FFE8D1',
      200: '#FFD1A3',
      300: '#FFBA75',
      400: '#F79945',
      500: '#E07D2A',
      600: '#C46620',
      700: '#A85016',
      800: '#8C3A0C',
      900: '#702402',
    },
    secondary: {
      DEFAULT: '#BC5EB3',
      light: '#D080C8',
      dark: '#9A3F92',
      50: '#FBF0FA',
      100: '#F5DCF3',
      200: '#E9B8E4',
      300: '#D894D2',
      400: '#BC5EB3',
      500: '#9A3F92',
      600: '#7E2D78',
      700: '#621C5E',
      800: '#460C44',
      900: '#2A002A',
    },
    success: '#22AD5C',
    danger: '#F23030',
    warning: '#F59E0B',
    info: '#3C50E0',
  },

  // Chart color palette - used by ALL chart components
  chart: {
    // Primary palette for bar/pie/donut charts
    palette: [
      '#F79945', '#BC5EB3', '#3C50E0', '#22AD5C', '#F23030',
      '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316',
    ],
    // Gradient pairs for special visualizations
    gradients: {
      primary: ['#F79945', '#E07D2A'],
      secondary: ['#BC5EB3', '#9A3F92'],
    },
    // Responsive breakpoints for chart sizing
    responsive: {
      mobile: { width: '100%', height: 250 },
      tablet: { width: '100%', height: 350 },
      desktop: { width: '100%', height: 400 },
    },
  },
} as const;

export type Theme = typeof theme;
```

**Update `tailwind.config.ts` to import from theme:**

```typescript
import { theme as appTheme } from './src/config/theme';

const config: Config = {
  // ...
  theme: {
    extend: {
      colors: {
        primary: appTheme.colors.primary,
        secondary: appTheme.colors.secondary,
        // ... rest derived from theme config
      },
    },
  },
};
```

**Remove hardcoded hex colors from chart components.** Every chart component should import colors from `config/theme.ts` instead of using inline hex strings like `#40475D`, `#17ead9`, `#6078ea`, etc.

### 1.3 Consolidate Chart Libraries

**Decision: Standardize on ApexCharts (`react-apexcharts`) for everything.**

Rationale:
- Already used by 10 of 14 chart components
- Handles bar, pie, donut, radial, treemap, horizontal bar natively
- Has built-in responsive options
- Single dependency instead of four

**Migration plan:**

| Current | Library | Action |
|---------|---------|--------|
| `GlobalBarChart.tsx` | ApexCharts | Keep, refactor to use theme colors |
| `GlobaldonutChart.tsx` | ApexCharts | Keep, rename to `DonutChart.tsx` |
| `GlobalPieChart.tsx` | ApexCharts | Keep, rename to `PieChart.tsx` |
| `GlobalGridMapChart.tsx` | ApexCharts | Keep, rename to `TreemapChart.tsx` |
| `GlobalHorizantalBarChart.tsx` | ApexCharts | Keep, rename to `HorizontalBarChart.tsx` |
| `HorizontalProgressBars.tsx` | ApexCharts | Keep, rename to `ProgressBar.tsx` |
| `RadialBarCharts.tsx` | ApexCharts | Keep, rename to `RadialBarChart.tsx` |
| `ApexDashboard.tsx` | ApexCharts | Keep as `DashboardChart.tsx` |
| `Mchart.tsx` | Recharts | **Rewrite** using ApexCharts |
| `ScalesChart.tsx` | Recharts (commented) | **Rewrite** using ApexCharts horizontal bar or custom CSS |
| `AllScalesChart.tsx` | Custom CSS | Keep (no library needed) |
| `WordCloudChart.tsx` | Highcharts | **Keep Highcharts for word cloud only** (ApexCharts has no word cloud) |
| `AnimatedWordCloud.tsx` | Highcharts | Merge into `WordCloud.tsx` |
| `D3WordCloud.tsx` | D3 (commented out) | **Delete** (already dead code) |

**After migration, remove from package.json:**
- `recharts`
- `d3`, `d3-selection`, `d3-scale`, `d3-scale-chromatic`, `d3-cloud`
- Keep: `react-apexcharts`, `apexcharts`, `highcharts`, `highcharts-react-official`

**Create a shared chart wrapper** that applies responsive defaults and theme colors:

```typescript
// components/charts/chart-theme.ts
import { theme } from '@/config/theme';

export const defaultChartOptions = {
  colors: theme.chart.palette,
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    toolbar: { show: false },
  },
  responsive: [
    {
      breakpoint: 640,
      options: { chart: { height: theme.chart.responsive.mobile.height } },
    },
    {
      breakpoint: 1024,
      options: { chart: { height: theme.chart.responsive.tablet.height } },
    },
  ],
};
```

### 1.4 Clean Up Tailwind Config

The current `tailwind.config.ts` has 90+ custom spacing values (most are unused template bloat). Audit and remove unused values:

- [ ] Run PurgeCSS analysis to find which custom spacing values are actually used
- [ ] Remove unused spacing, maxWidth, maxHeight, minWidth values
- [ ] Remove unused animations (keep only those referenced in components)
- [ ] Remove unused boxShadow definitions (11 defined, likely 3-4 used)
- [ ] Keep the color system but migrate to CSS variables for runtime theming

### 1.5 Consolidate Duplicate Libraries

| Duplicate | Keep | Remove | Action |
|-----------|------|--------|--------|
| `moment` + `dayjs` | `dayjs` | `moment` | Find-and-replace moment imports. dayjs is 2KB vs 70KB. |
| `@dnd-kit` + `@hello-pangea/dnd` | `@dnd-kit` | `@hello-pangea/dnd` | Rewrite the 1-2 components using hello-pangea. |
| `globalModal` + `globalBigModal` | Merge into `Modal.tsx` | Both old files | Single Modal component with `size` prop. |

### 1.6 Fix Type Safety in Redux Slices

- [ ] `questInformationSlice.ts`: Change type from `Quiz | null` to proper `Quest` interface
- [ ] `surveyInformationSlice.ts`: Change type from `Quiz | null` to proper `Survey` interface
- [ ] Create proper TypeScript interfaces for all socket event payloads (for Phase 3)
- [ ] Remove all `any` types from exported function signatures in services and hooks

---

## Phase 2: Backend - Reverb Setup & Event Architecture

**Goal:** Install Reverb, define all broadcast events, wire them to existing controllers, and set up channel authorization. No frontend changes yet.

**Duration:** 2-3 days

### 2.0 PostgreSQL and Redis Readiness Gate

SQLite is fine for fast local development, but PostgreSQL is the production target. Before merging or deploying Reverb/live-session work, run the backend against PostgreSQL at least once with `php artisan migrate:fresh --seed` and the core quiz/quest flows.

**PostgreSQL checks before deployment:**

- [ ] Audit raw SQL such as `EXTRACT(...)`, `TIMESTAMPDIFF(...)`, `orderByRaw(...)`, and JSON filters for PostgreSQL compatibility
- [ ] Verify migrations that use `json`, `enum`, `boolean`, `after()`, or `change()` work on PostgreSQL
- [ ] Verify aggregate queries obey PostgreSQL's stricter grouping/type rules
- [ ] Verify participant joins and answer bursts against PostgreSQL, not only SQLite
- [ ] Keep SQLite for quick local work only; do not treat SQLite as the final compatibility test

**Redis is part of the Reverb phase, not a later scaling add-on:**

- [ ] Use Redis for queues, cache, rate limits, counters, and coalesced aggregate broadcasts
- [ ] Avoid database queue/cache drivers for 500-user live sessions
- [ ] Keep Redis optional only for quick single-developer smoke tests
- [ ] Use Redis-backed debouncing for chart/aggregate updates during answer bursts

### 2.1 Install and Configure Reverb

```bash
cd backend
composer require laravel/reverb
php artisan reverb:install
```

This creates:
- `config/reverb.php`
- Updates `config/broadcasting.php`
- Adds `REVERB_*` env variables

**Update `.env`:**
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=mindspear
REVERB_APP_KEY=your-key-here
REVERB_APP_SECRET=your-secret-here
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
FRONTEND_URL=http://localhost:2000
CORS_ALLOWED_ORIGINS=http://localhost:2000,http://127.0.0.1:2000
REVERB_ALLOWED_ORIGINS=http://localhost:2000,http://127.0.0.1:2000
SANCTUM_STATEFUL_DOMAINS=
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
```

`CORS_ALLOWED_ORIGINS` controls Laravel HTTP requests such as `/broadcasting/auth`.
`REVERB_ALLOWED_ORIGINS` controls browser websocket origins accepted by Reverb.
Leave `SANCTUM_STATEFUL_DOMAINS` empty while frontend auth uses bearer tokens. If it includes the frontend domain, Sanctum treats API requests as cookie-based SPA requests and POST routes such as `/api/v1/login` require a CSRF cookie.

Database queue/cache drivers are acceptable for quick local smoke tests only. For realistic live-session testing, use Redis from the start of Phase 2.

**Enable broadcasting in `config/app.php`** (uncomment `BroadcastServiceProvider` if needed).

### 2.2 Define Channel Architecture (Anonymous-First)

Since participants join without logging in (like AhaSlides/Mentimeter), we **cannot** use Laravel's authenticated presence channels for the participant-facing side. Here's the channel design:

**Channel types:**

| Channel | Type | Who Listens | Auth Required? |
|---------|------|-------------|----------------|
| `session.quiz.{publicChannelKey}` | **Public** | All participants + host | No |
| `session.quest.{publicChannelKey}` | **Public** | All participants + host | No |
| `host.quiz.{sessionId}` | **Private** | Host only | Yes (Sanctum) |
| `host.quest.{sessionId}` | **Private** | Host only | Yes (Sanctum) |

**Why public channels for participants:**
- AhaSlides/Mentimeter pattern: anyone with the join code can participate
- No login = no Laravel auth = no private/presence channel authorization
- Broadcasts (task changed, session ended, timer sync) are not sensitive data
- Public channel names must use a random `public_channel_key` or `live_room_key`, not raw numeric session IDs
- `session.quest.42` is guessable; `session.quest.live_N4v9sK...` is acceptable for anonymous public listening
- Answer submission is secured separately via participant tokens (see 2.3)

**Why private channels for host:**
- Only the quiz/quest creator should see individual answer details
- Answer aggregation, individual submissions, and admin controls go here
- Host is always a logged-in user with a Sanctum token

**Create `routes/channels.php`:**

```php
// Host-only channels (private, requires Sanctum auth)
Broadcast::channel('host.quiz.{sessionId}', function ($user, $sessionId) {
    $session = QuizSession::with('quiz')->find($sessionId);
    return $session && $session->quiz->user_id === $user->id;
});

Broadcast::channel('host.quest.{sessionId}', function ($user, $sessionId) {
    $session = QuestSession::with('quest')->find($sessionId);
    return $session && $session->quest->creator_id === $user->id;
});

// Public session channels don't need authorization rules.
// They are accessed via Echo.channel() (not Echo.private() or Echo.join())
```

### 2.3 Secure Anonymous Answer Submissions

Participants can't use Sanctum tokens (they're not logged in). Instead, use a **participant token** flow. Return the raw token once on join, store only a hash in the database, and keep the raw token in `sessionStorage`.

**How it works:**
1. Participant opens join page, enters join code + display name
2. Frontend calls `POST /api/v1/quiz-attempts/join` (or quest equivalent)
3. Backend creates a `QuizParticipant` (or `QuestParticipant`) record with `is_anonymous = true`
4. Backend creates a random raw token, stores `hash('sha256', $rawToken)`, and returns the raw token once
5. Frontend stores this token and sends it with every answer submission
6. Backend validates: "does the hash of this token belong to an active, unexpired, non-revoked participant in this session?"

**New columns needed:**

```php
// Migration: add hashed participant token fields to quiz_participants and quest_participants
Schema::table('quiz_participants', function (Blueprint $table) {
    $table->string('participant_token_hash', 64)->nullable()->unique();
    $table->timestamp('participant_token_expires_at')->nullable();
    $table->timestamp('participant_token_revoked_at')->nullable();
});

Schema::table('quest_participants', function (Blueprint $table) {
    $table->string('participant_token_hash', 64)->nullable()->unique();
    $table->timestamp('participant_token_expires_at')->nullable();
    $table->timestamp('participant_token_revoked_at')->nullable();
});
```

**Token generation on join:**

```php
// In QuizAttemptController::join() or startAttempt()
$rawToken = Str::random(64);

$participant = QuizParticipant::create([
    'quiz_id' => $quiz->id,
    'quiz_session_id' => $session->id,
    'is_anonymous' => true,
    'anonymous_details' => ['name' => $request->display_name],
    'participant_token_hash' => hash('sha256', $rawToken),
    'participant_token_expires_at' => now()->addHours(6),
    'status' => 'In Progress',
]);

return $this->okResponse([
    'participant_id' => $participant->id,
    'participant_token' => $rawToken, // Return once; never persist raw token
    'session' => $session,
    'public_channel_key' => $session->public_channel_key,
]);
```

**Answer submission auth (new middleware or inline check):**

```php
// In QuizAttemptController::recordAnswer()
$token = $request->header('X-Participant-Token');
abort_if(blank($token), 401, 'Missing participant token.');

$tokenHash = hash('sha256', $token);

$participant = QuizParticipant::where('participant_token_hash', $tokenHash)
    ->where('status', 'In Progress')
    ->whereNull('participant_token_revoked_at')
    ->where(function ($query) {
        $query->whereNull('participant_token_expires_at')
            ->orWhere('participant_token_expires_at', '>', now());
    })
    ->firstOrFail();

// Now record the answer for this participant
```

**This means the frontend stores two types of auth:**
- Logged-in users: `auth_token` (Sanctum) in localStorage
- Anonymous participants: raw `participant_token` in sessionStorage (cleared on tab close)

Both Quiz and Quest attempt controllers need to support this dual auth pattern.

### 2.4 Create Broadcast Event Classes

Create `app/Events/` directory with these events:

**Shared session events (abstract base):**

```
app/Events/
├── Quiz/
│   ├── QuizSessionStarted.php
│   ├── QuizQuestionChanged.php
│   ├── QuizAnswerSubmitted.php        # To host-only channel
│   ├── QuizAnswerAggregateUpdated.php # To session channel (counts only, not answers)
│   ├── QuizParticipantJoined.php
│   ├── QuizParticipantCompleted.php
│   ├── QuizParticipantCountUpdated.php
│   ├── QuizLeaderboardUpdated.php
│   └── QuizSessionEnded.php
├── Quest/
│   ├── QuestSessionStarted.php
│   ├── QuestTaskChanged.php
│   ├── QuestTaskAnswerSubmitted.php   # To host-only channel
│   ├── QuestAnswerAggregateUpdated.php
│   ├── QuestParticipantJoined.php
│   ├── QuestParticipantCompleted.php
│   ├── QuestParticipantCountUpdated.php
│   ├── QuestLeaderboardUpdated.php
│   └── QuestSessionEnded.php
```

**Events use two channel types:**

- **Participant-facing events** → `new Channel(...)` (public, no auth needed)
- **Host-facing events** → `new PrivateChannel(...)` (requires Sanctum auth)

```php
// Participant-facing: public channel (anonymous users can listen)
class QuestTaskChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $sessionId,
        public string $publicChannelKey,
        public int $questId,
        public int $taskId,
        public ?array $timerData = null,
    ) {}

    public function broadcastOn(): Channel
    {
        // Public channel - anyone with the unguessable room key can listen
        return new Channel("session.quest.{$this->publicChannelKey}");
    }

    public function broadcastAs(): string
    {
        return 'task.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->taskId,
            'timer' => $this->timerData,
            'timestamp' => now()->toISOString(),
        ];
    }
}

// Host-facing: private channel (only the quiz/quest creator)
class QuestTaskAnswerSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $sessionId,
        public int $taskId,
        public int $participantId,
        public string $participantName,
        public array $answerData,
    ) {}

    public function broadcastOn(): Channel
    {
        // Private channel - only the host receives individual answers
        return new PrivateChannel("host.quest.{$this->sessionId}");
    }

    public function broadcastAs(): string
    {
        return 'answer.submitted';
    }
}
```

**Which events go where:**

| Event | Channel Type | Rationale |
|-------|-------------|-----------|
| `SessionStarted` | Public | Everyone needs to know |
| `TaskChanged` / `QuestionChanged` | Public | Everyone needs the current task |
| `ParticipantCountUpdated` | Public | Show count to all (not names - privacy) |
| `AnswerAggregateUpdated` | Public | Show live bar chart / word cloud to all |
| `LeaderboardUpdated` | Public | Everyone sees the leaderboard |
| `SessionEnded` | Public | Everyone needs to know |
| `AnswerSubmitted` (individual) | **Private (host)** | Only host sees who answered what |
| `ParticipantJoined` (with details) | **Private (host)** | Only host sees participant names |
```

### 2.5 Add New Backend Endpoints

The current architecture requires the host's browser to emit socket events for state changes. Move these to REST endpoints:

**New endpoints needed:**

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/quiz-sessions/{id}/change-question` | Host advances to next question |
| `POST` | `/api/v1/quest-sessions/{id}/change-task` | Host advances to next task |
| `GET` | `/api/v1/quiz-sessions/{id}/state` | Get current session state (for reconnection) |
| `GET` | `/api/v1/quest-sessions/{id}/state` | Get current session state (for reconnection) |

**Add `public_channel_key` / `live_room_key` plus current-state columns to session tables:**

```bash
php artisan make:migration add_current_state_to_sessions
```

```php
// In migration
Schema::table('quiz_sessions', function (Blueprint $table) {
    $table->string('public_channel_key', 64)->nullable()->unique();
    $table->unsignedBigInteger('current_question_id')->nullable();
    $table->json('timer_state')->nullable();
});

Schema::table('quest_sessions', function (Blueprint $table) {
    $table->string('public_channel_key', 64)->nullable()->unique();
    $table->unsignedBigInteger('current_task_id')->nullable();
    $table->json('timer_state')->nullable();
});
```

Generate the `public_channel_key` when the live session is created or started. It must be random, unguessable, and returned by join/state endpoints so frontend clients can subscribe to `session.quiz.{publicChannelKey}` or `session.quest.{publicChannelKey}`.

This means current question/task is now in the **database**, not just in socket server memory. Reconnecting clients can query the API to get current state and the correct public channel key.

### 2.6 Wire Broadcasts to Existing Controllers

Add `broadcast()` calls to existing controller methods. **Do not refactor the controllers** - just add the broadcast as a side effect.

**Important:** Broadcast only after database transactions commit. If clients receive an event before the API state is readable, reconnect/resync bugs become very hard to diagnose. Use `DB::afterCommit(...)`, `ShouldDispatchAfterCommit`, or queued events configured for after-commit dispatch.

**Example additions:**

```php
// QuestController::statusLive() - when host starts the quest
// After existing logic:
DB::afterCommit(fn () => broadcast(
    new QuestSessionStarted($session->id, $session->public_channel_key, $quest->id)
));

// QuestAttemptController::startAttempt() - when participant joins
// After creating participant record:
DB::afterCommit(fn () => broadcast(
    new QuestParticipantJoined($session->id, $participant->id, $userName)
));
DB::afterCommit(fn () => broadcast(
    new QuestParticipantCountUpdated($session->id, $session->public_channel_key, $participantCount)
));

// QuestAttemptController::recordAnswer() - when participant submits
// After recording the answer:
DB::afterCommit(fn () => broadcast(
    new QuestTaskAnswerSubmitted($session->id, $taskId, $userId, $answerData)
)->toOthers()); // host-only channel

// QuestController::endLive() - when host ends
// After existing logic:
DB::afterCommit(fn () => broadcast(
    new QuestSessionEnded($session->id, $session->public_channel_key, $quest->id)
));
```

### 2.7 Test Backend Events

- [ ] Start Reverb: `php artisan reverb:start --debug`
- [ ] Use Tinker to fire test events: `broadcast(new QuestSessionStarted(1, 'live_demo_key', 1))`
- [ ] Verify events appear in Reverb debug output
- [ ] Test host private-channel authorization with a Postman/curl request to `/broadcasting/auth`

### 2.8 Throttle Aggregate Broadcasts

Persist every answer immediately, but do **not** broadcast a public chart/aggregate update for every answer in a 500-user burst.

**Recommended approach:**

- [ ] Record every answer in PostgreSQL immediately
- [ ] Update Redis counters/aggregates immediately
- [ ] Coalesce public `AnswerAggregateUpdated` events on a 250-1000ms debounce window
- [ ] Broadcast a snapshot payload, not every raw answer
- [ ] Allow host-only `AnswerSubmitted` events to be immediate if the host UI needs them
- [ ] Keep public aggregate broadcasts small enough for weak mobile networks

---

## Phase 3: Frontend - Reverb Integration & Live Module Rewrite

**Goal:** Replace all Socket.IO code with Laravel Echo + Reverb. Rewrite the live session UI with proper hooks, cleanup, and error handling.

**Duration:** 5-7 days

### 3.1 Install Echo and Remove Socket.IO

```bash
cd frontend
npm install laravel-echo pusher-js
npm uninstall socket.io-client @types/socket.io-client
```

### 3.2 Create Echo Client

**Create `frontend/src/lib/echo.ts`:**

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo | null = null;

export function getEcho(): Echo {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
      forceTLS: process.env.NODE_ENV === 'production',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      },
    });
  }
  return echoInstance;
}

export function destroyEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
```

### 3.3 Create Live Session Hooks

**These hooks replace ALL 70+ socket functions and 34 files of imports.**

Two types of hooks because two types of channels:
- **`useSessionChannel`** — Public channel using `publicChannelKey`. Used by BOTH host and participants. Receives task changes, participant counts, leaderboard, session end.
- **`useHostChannel`** — Private channel. Used by host ONLY. Receives individual answer submissions, participant join details.

**`features/live/hooks/useSessionChannel.ts`:**

```typescript
import { useEffect, useState, useRef } from 'react';
import { getEcho } from '@/lib/echo';

interface SessionChannelState {
  participantCount: number;
  currentTaskId: number | null;
  timerData: TimerData | null;
  sessionStatus: 'pending' | 'started' | 'ended';
  leaderboard: LeaderboardEntry[] | null;
  answerAggregate: AnswerAggregate | null;
  isConnected: boolean;
}

/**
 * Subscribe to a live session's public channel.
 * Works for BOTH logged-in hosts and anonymous participants.
 * No authentication required — uses Echo.channel() (public).
 *
 * @param type - 'quiz' or 'quest'
 * @param publicChannelKey - unguessable room key returned by join/state endpoints
 */
export function useSessionChannel(
  type: 'quiz' | 'quest',
  publicChannelKey: string | null
) {
  const [state, setState] = useState<SessionChannelState>({
    participantCount: 0,
    currentTaskId: null,
    timerData: null,
    sessionStatus: 'pending',
    leaderboard: null,
    answerAggregate: null,
    isConnected: false,
  });

  useEffect(() => {
    if (!publicChannelKey) return;

    const echo = getEcho();

    // Public channel — no auth needed, anonymous participants can listen
    const channel = echo.channel(`session.${type}.${publicChannelKey}`)
      .listen('.session.started', () => {
        setState(prev => ({ ...prev, sessionStatus: 'started' }));
      })
      .listen('.task.changed', (e: any) => {
        setState(prev => ({
          ...prev,
          currentTaskId: e.task_id,
          timerData: e.timer,
        }));
      })
      .listen('.participant.count.updated', (e: any) => {
        setState(prev => ({ ...prev, participantCount: e.count }));
      })
      .listen('.answer.aggregate.updated', (e: any) => {
        setState(prev => ({ ...prev, answerAggregate: e }));
      })
      .listen('.leaderboard.updated', (e: any) => {
        setState(prev => ({ ...prev, leaderboard: e.leaderboard }));
      })
      .listen('.session.ended', () => {
        setState(prev => ({ ...prev, sessionStatus: 'ended' }));
      });

    setState(prev => ({ ...prev, isConnected: true }));

    // CLEANUP — the thing the old code never did
    return () => {
      echo.leave(`session.${type}.${publicChannelKey}`);
    };
  }, [type, publicChannelKey]);

  return state;
}
```

**`features/live/hooks/useHostChannel.ts`:**

```typescript
/**
 * Subscribe to the host-only private channel.
 * Receives individual answer submissions, participant join details.
 * Requires Sanctum auth (host is always logged in).
 *
 * @param type - 'quiz' or 'quest'
 * @param sessionId - the session ID
 * @param handlers - callbacks for each event type
 */
export function useHostChannel(
  type: 'quiz' | 'quest',
  sessionId: number | null,
  handlers: {
    onAnswerReceived?: (answer: AnswerPayload) => void;
    onParticipantJoined?: (participant: ParticipantDetail) => void;
  }
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!sessionId) return;

    const echo = getEcho();

    // Private channel — requires Sanctum auth, host only
    echo.private(`host.${type}.${sessionId}`)
      .listen('.answer.submitted', (e: AnswerPayload) => {
        handlersRef.current.onAnswerReceived?.(e);
      })
      .listen('.participant.joined', (e: ParticipantDetail) => {
        handlersRef.current.onParticipantJoined?.(e);
      });

    return () => {
      echo.leave(`host.${type}.${sessionId}`);
    };
  }, [type, sessionId]);
}
```

**`features/live/hooks/useParticipantApi.ts`:**

```typescript
/**
 * API calls for anonymous participants.
 * Uses participant_token instead of Sanctum auth.
 */
export function useParticipantApi(participantToken: string | null) {
  const headers = participantToken
    ? { 'X-Participant-Token': participantToken }
    : {};

  const submitAnswer = async (
    attemptId: number,
    taskId: number,
    answerData: any
  ) => {
    return api.post(
      `/quest-attempts/${attemptId}/answer`,
      { task_id: taskId, answer_data: answerData },
      { headers }
    );
  };

  const completeAttempt = async (attemptId: number) => {
    return api.put(
      `/quest-attempts/${attemptId}/status`,
      { status: 'Completed' },
      { headers }
    );
  };

  return { submitAnswer, completeAttempt };
}
```

**Usage example — Participant view (anonymous, no login):**

```typescript
function QuestParticipantPage({ sessionId, publicChannelKey, participantToken }) {
  // Public channel — no auth needed
  const { currentTaskId, timerData, sessionStatus } = useSessionChannel('quest', publicChannelKey);
  // Participant API — uses participant token, not Sanctum
  const { submitAnswer } = useParticipantApi(participantToken);

  const handleSubmit = (answerData) => {
    submitAnswer(attemptId, currentTaskId, answerData);
  };

  if (sessionStatus === 'ended') return <SessionEndedScreen />;
  return <TaskView taskId={currentTaskId} timer={timerData} onSubmit={handleSubmit} />;
}
```

**Usage example — Host view (logged in):**

```typescript
function QuestHostPage({ sessionId, publicChannelKey }) {
  // Public channel — same events as participants
  const { participantCount, currentTaskId, sessionStatus } = useSessionChannel('quest', publicChannelKey);
  // Private channel — individual answers, participant details (host only)
  useHostChannel('quest', sessionId, {
    onAnswerReceived: (answer) => addToAnswerList(answer),
    onParticipantJoined: (p) => addToParticipantList(p),
  });

  return (
    <HostDashboard
      participantCount={participantCount}
      currentTaskId={currentTaskId}
      answers={answerList}
    />
  );
}
```

### 3.4 Create Shared Live Session Components

Build reusable components that both Quiz and Quest live flows share:

| Component | Purpose | Replaces |
|-----------|---------|----------|
| `WaitingRoom.tsx` | Pre-session lobby showing participants and join code | `WatingRoomComponent.tsx` + `WatingRoomComponentQuiz.tsx` |
| `SessionTimer.tsx` | Countdown timer with sync from server | `GlobalTimer.tsx` + `SharedQuestTimer.tsx` |
| `JoinForm.tsx` | Join by code/link form | `QuestAttemptForm.tsx` + `QuizAttemptForm.tsx` |
| `Leaderboard.tsx` | Leaderboard display with animations | Existing leaderboard components |
| `ConnectionStatus.tsx` | Shows connection state to user | New (didn't exist before) |
| `ParticipantCounter.tsx` | Live participant count | Inline code scattered across components |

**Key design principle:** These components receive state from hooks. They don't call socket functions directly. They render what they're given.

### 3.5 Migrate Quest Live Flow

Rewrite these pages/components to use the new hooks:

| Page/Component | What Changes |
|----------------|-------------|
| `app/(protected)/quests-session/[id]/page.tsx` | Use `useQuestChannel` + `useHostChannel` instead of 8 socket imports |
| `app/(public)/live/quests/page.tsx` | Use `useQuestChannel` for participant view |
| `QuestPlayComponent.tsx` | Simplify to render state from hook, remove all socket imports |
| `QuestChoiceComponent.tsx` | Submit via REST API (`POST /quest-attempts/{id}/answer`), not socket |
| `QuestRankingComponent.tsx` | Same - REST for submission |
| `QuestScalesChoiceComponent.tsx` | Same |
| `QuestShortAnswerComponent.tsx` | Same |
| `QuickFormCreatorView.tsx` | Same |

**For each component:**
1. Read the existing component fully
2. Identify which socket events it uses
3. Map those to the equivalent hook state or REST API call
4. Rewrite the component using the hook
5. Test the flow end-to-end

### 3.6 Migrate Quiz Live Flow

Same pattern as Quest:

| Page/Component | What Changes |
|----------------|-------------|
| `app/(protected)/quiz-play/[id]/page.tsx` | Use `useQuizChannel` + `useHostChannel` |
| `QuizPlayComponent.tsx` | Render state from hook |
| `ChoiceComponent.tsx` | Submit via REST |
| `MultipleChoiceComponent.tsx` | Submit via REST |
| `TrueFalseComponent.tsx` | Submit via REST |
| `FillInTheBlanksComponent.tsx` | Submit via REST |
| `ShortAnswerComponent.tsx` | Submit via REST |

### 3.7 Remove All Old Socket Code

After both Quiz and Quest are migrated:

- [ ] Delete `frontend/src/socket/socket.ts`
- [ ] Delete `frontend/src/socket/quest-socket.ts`
- [ ] Delete `frontend/src/socket/` directory
- [ ] Delete `socket-server/` directory entirely
- [ ] Remove all localStorage keys used for socket state caching:
  - `quest.session`, `quiz.session`
  - `quiz_currentQuestion`, `quiz_questions`, `quiz_questionsId`
  - `timer_*` keys
  - `attempt-*` keys
  - `leaderboardState`
  - `quest:joined:*`, `quiz:joined:*`
- [ ] Remove `socket.io-client` from `package.json` (should already be done in 3.1)
- [ ] Verify no file imports from `@/socket/` remain: `grep -r "from.*socket" src/`

### 3.8 Reconnection Strategy

With Reverb, reconnection is handled by the Echo library automatically. But you need a "resync from server" strategy for both authenticated and anonymous users.

**Create `features/live/hooks/useSessionSync.ts`:**

```typescript
/**
 * On reconnect, fetch current session state from the API.
 * Works for both logged-in users (Sanctum) and anonymous participants (participant token).
 * This is the SINGLE source of truth after a reconnect — never replay localStorage.
 */
export function useSessionSync(
  type: 'quiz' | 'quest',
  sessionId: number | null,
  participantToken: string | null, // null if user is logged in (host)
  onSync: (state: SessionSnapshot) => void,
) {
  useEffect(() => {
    if (!sessionId) return;

    const resync = async () => {
      const headers: Record<string, string> = {};
      if (participantToken) {
        headers['X-Participant-Token'] = participantToken;
      }

      const endpoint = type === 'quiz'
        ? `/quiz-sessions/${sessionId}/state`
        : `/quest-sessions/${sessionId}/state`;

      const response = await api.get(endpoint, { headers });
      onSync(response.data);
    };

    // Resync on initial mount (handles page refresh)
    resync();

    // Resync on WebSocket reconnect
    const echo = getEcho();
    echo.connector.pusher.connection.bind('connected', resync);

    // Resync when tab becomes visible again (mobile background)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resync();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      echo.connector.pusher.connection.unbind('connected', resync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [type, sessionId, participantToken]);
}
```

**The state endpoint** (`GET /api/v1/quest-sessions/{id}/state`) should return:

```json
{
  "session_id": 42,
  "public_channel_key": "live_N4v9sK...",
  "running_status": true,
  "current_task_id": 7,
  "timer_state": { "start_time": "...", "duration_seconds": 30 },
  "participant_count": 156,
  "session_status": "started"
}
```

This endpoint accepts either Sanctum auth OR `X-Participant-Token` header (for anonymous users). It returns the `public_channel_key` needed for the public Echo subscription, but it does NOT return answer data or participant names — those are host-only.

**Key insight from Codex:** On reconnect, always resync from the backend API. Never replay cached localStorage data. The backend is the single source of truth.

---

## Phase 4: UI Polish & Responsiveness

**Goal:** Improve the visual quality and responsiveness of live session UI and reports.

**Duration:** 3-4 days

### 4.1 Responsive Charts

Every chart component should:
- [ ] Use `width: '100%'` (never a fixed pixel width)
- [ ] Use the responsive breakpoints from `config/theme.ts`
- [ ] Adjust label sizes and legend positioning on mobile
- [ ] Hide non-essential labels on small screens
- [ ] Test at 375px, 768px, 1024px, 1440px viewports

**Create a wrapper component:**

```typescript
// components/charts/ResponsiveChart.tsx
export function ResponsiveChart({ options, series, type, ...props }) {
  const isMobile = useMobile();
  const mergedOptions = deepMerge(defaultChartOptions, options, {
    chart: { height: isMobile ? 250 : 400 },
    legend: { position: isMobile ? 'bottom' : 'right' },
    dataLabels: { enabled: !isMobile },
  });

  return <ApexChart options={mergedOptions} series={series} type={type} {...props} />;
}
```

### 4.2 Live Session UI Improvements

- [ ] **Waiting Room:** Show QR code prominently, participant count with animation, join code in large font
- [ ] **Timer:** Full-screen countdown on question transitions, smooth animations
- [ ] **Answer feedback:** Immediate visual feedback when answer is submitted (checkmark, color change)
- [ ] **Leaderboard:** Animated position changes, podium for top 3
- [ ] **Connection status:** Non-intrusive toast/banner when connection drops/reconnects
- [ ] **Mobile participant view:** Full-width answer buttons, larger tap targets (min 48px)
- [ ] **Host controls:** Clear "Next Question" / "End Session" buttons, participant count always visible

### 4.3 Consistent Component Styling

Create shared CSS patterns:
- [ ] Card component with consistent shadow, border-radius, padding
- [ ] Button variants: primary, secondary, danger, ghost, loading state
- [ ] Input field styling consistent across quiz/quest/survey creators
- [ ] Loading skeleton that matches actual content layout
- [ ] Empty state component for lists with no data

### 4.4 Dark Mode Audit

Tailwind dark mode is configured (`darkMode: ["class"]`) but likely inconsistent:
- [ ] Audit every page for dark mode rendering
- [ ] Ensure chart backgrounds, labels, and gridlines adapt to dark mode
- [ ] Ensure Ant Design components respect dark mode (may need ConfigProvider)

---

## Phase 5: Testing & Load Testing

**Goal:** Verify everything works under real conditions before shipping.

**Duration:** 2-3 days

### 5.1 Manual Integration Testing

Test each flow end-to-end:

**Quest flow:**
- [ ] Create quest with all task types (choice, ranking, scales, wordcloud, short/long answer, quick form)
- [ ] Host live session
- [ ] Join from 3+ browser tabs/windows simultaneously
- [ ] Navigate through all tasks
- [ ] Submit answers from each participant
- [ ] Verify host sees live answer aggregation
- [ ] Verify leaderboard updates
- [ ] End session
- [ ] Verify reports show correct data

**Quiz flow:**
- [ ] Same as Quest but with quiz question types

**Edge cases:**
- [ ] Disconnect host's WiFi mid-session, reconnect. Does session resume?
- [ ] Disconnect a participant mid-session. Does host see updated count?
- [ ] Close participant tab. Does their status update to abandoned?
- [ ] Refresh host page. Does current question state restore from API?
- [ ] Open the same session in two host tabs. What happens? (Should block)
- [ ] Join after session has started. Does participant get current question?

### 5.2 Load Testing

Use **Artillery** or **k6** to simulate concurrent users:

```yaml
# pseudo Artillery/k6 flow example
scenarios:
  - name: "500 participants join and answer"
    engine: ws
    flow:
      - connect: "ws://localhost:8080/app/your-key"
      - send: { event: "pusher:subscribe", data: { channel: "session.quest.live_demo_key" } }
      - think: 5
      - post:
          url: "/api/v1/quest-attempts/{attemptId}/answer"
          headers:
            X-Participant-Token: "{{ participantToken }}"
          json:
            task_id: 1
            answer: "A"
      - think: 10
      - post:
          url: "/api/v1/quest-attempts/{attemptId}/answer"
          headers:
            X-Participant-Token: "{{ participantToken }}"
          json:
            task_id: 2
            answer: "B"
```

**Test targets:**
- [ ] 500 concurrent WebSocket connections to Reverb
- [ ] Host sends "change task" → all 500 receive within 500ms
- [ ] 500 participants submit answers within 30 seconds → all recorded, host sees aggregation
- [ ] 100 simultaneous disconnects and reconnects → no data loss
- [ ] 10 concurrent sessions with 50 users each

### 5.3 Add Backend Tests (Pest)

Write integration tests for the new broadcast flows:

- [ ] Test `broadcast()` is called when `statusLive()` is invoked
- [ ] Test public session channels can be subscribed to with the random public channel key
- [ ] Test host private channel authorization allows only the session owner
- [ ] Test host private channel authorization rejects unauthorized users
- [ ] Test host-only channel rejects non-hosts
- [ ] Test participant token hash, expiry, and revocation validation
- [ ] Test session state endpoint returns correct current question
- [ ] Test answer recording + broadcast happens atomically

---

## Phase 6: Cleanup & Documentation

**Goal:** Remove all migration artifacts, update documentation, and prepare for ongoing development.

**Duration:** 1-2 days

### 6.1 Final Cleanup

- [ ] Remove the old `DEVELOPMENT_GUIDE.md` section about Socket.IO
- [ ] Remove `socket-server/` references from any README or setup guides
- [ ] Remove old `.env` variables (`NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_SOCKET_PATH`)
- [ ] Add new `.env` variables to `SETUP_GUIDE.md` (`REVERB_*`)
- [ ] Clean up `package.json` - remove unused dependencies found during migration
- [ ] Run `npm audit` and fix any vulnerabilities

### 6.2 Update DEVELOPMENT_GUIDE.md

Update the guide to reflect:
- [ ] New folder structure
- [ ] Reverb as the real-time layer
- [ ] Event architecture (event classes, channels, authorization)
- [ ] How to add a new broadcast event
- [ ] How to add a new live interaction type
- [ ] Development server ports (add Reverb: 8080)

### 6.3 Add Docker Compose

```yaml
services:
  backend:
    image: php:8.4-fpm
    # ...
  frontend:
    image: node:20
    # ...
  reverb:
    command: php artisan reverb:start
    # ...
  postgres:
    image: postgres:16-alpine
    # ...
  redis:
    image: redis:7-alpine
    # ... required for queue/cache/counters during realistic live-session testing
```

---

## Summary Timeline

| Phase | Duration | Can Parallelize? |
|-------|----------|-----------------|
| **Phase 0:** Foundation (git baseline, minimal cleanup, small commits) | 1-3 days | No - baseline must be first |
| **Phase 2:** Backend Reverb setup & events | 2-4 days | Yes - should start before large Phase 1 restructuring |
| **Phase 3:** Frontend Reverb integration & live rewrite | 5-7 days | No - depends on Phase 2 and minimal live UI readiness |
| **Phase 1:** Frontend restructuring & theming | 3-4 days | Yes - defer large restructuring until realtime architecture is proven |
| **Phase 4:** UI polish & responsiveness | 3-4 days | Partially with Phase 3 |
| **Phase 5:** Testing & load testing | 2-3 days | No - depends on 3 & 4 |
| **Phase 6:** Cleanup & documentation | 1-2 days | No - must be last |
| **Total** | **18-26 days** | |

With two developers, put one developer on Phase 2 backend Reverb/Redis/PostgreSQL work and the other on the smallest Phase 3 frontend vertical slice needed to prove one live quest/quiz flow. Defer broad Phase 1 restructuring until that vertical slice is stable.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Keep Laravel, don't switch to Django | Backend is solid; Reverb is native; no benefit to rewriting |
| Self-hosted Reverb (not Ably/Pusher) | Free, handles 2000+ connections, sufficient for 500-user scale |
| SQLite for local speed, PostgreSQL for production compatibility | SQLite is useful locally, but production queries, migrations, JSON behavior, concurrency, and aggregates must be verified on PostgreSQL. |
| Public channels use random room keys, not numeric session IDs | Anonymous public channels are acceptable, but guessable channels like `session.quest.42` are avoidable risk. |
| Public channels for participants, private for host | Anonymous users (no login) can't use authenticated channels. This is how AhaSlides/Mentimeter work. |
| Hashed participant tokens for answer auth | Anonymous users need a way to prove they're a valid participant. Return the raw token once, store only its hash, add expiry/revocation, and keep the raw token in sessionStorage. |
| ApexCharts as primary chart library | Already used by 10/14 charts; feature-complete; good responsive support |
| Keep Highcharts for word cloud only | ApexCharts has no word cloud; Highcharts excels at this |
| Feature-first folder structure | Reduces cross-feature coupling; easier onboarding for new developers |
| REST for answer submission, WebSocket for broadcast only | Server is single source of truth; no data loss on disconnect |
| Redis from the Reverb phase | 500-user answer bursts need Redis-backed queues, cache, counters, rate limits, and aggregate coalescing from the beginning. |
| Broadcast after DB commit | Clients should not receive events before the committed API state is readable. |
| Throttle public aggregate broadcasts | Persist every answer, but broadcast chart/aggregate snapshots on a short debounce window instead of one event per answer. |
| Keep `quizes` table typo | Renaming a table used across 60+ migrations, models, controllers, and routes is too risky for zero functional gain |
| Realtime stability before large folder restructuring | The main business risk is live-session stability; broad frontend restructuring should wait until the Reverb vertical slice is proven. |
