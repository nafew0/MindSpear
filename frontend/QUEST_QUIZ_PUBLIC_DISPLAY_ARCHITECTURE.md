# Quest & Quiz Public Template Display Architecture

## Overview
This document explains how created quests and quizzes are displayed to the public and which components render the answers/created content.

---

## 🎯 PUBLIC ROUTES

### Quest Template Display
- **Route**: `/app/(public)/templates/quest/[id]/page.tsx`
- **Endpoint**: `/quests-public/show/{questId}`
- **Purpose**: Shows a public preview of a quest template before users can join/attempt it

### Quiz Template Display  
- **Route**: `/app/(public)/templates/quiz/[id]/page.tsx`
- **Endpoint**: Similar public API endpoint for quizzes
- **Purpose**: Shows a public preview of a quiz template

### Discover Pages
- **Quest Discovery**: `/app/(public)/discover/discover-quest`
- **Quiz Discovery**: `/app/(public)/discover/discover-quiz`
- **Survey Discovery**: `/app/(public)/discover/discover-survey`
- Uses components in `/src/views/discover/`

---

## 📋 MAIN TEMPLATE DISPLAY PAGE: `templates/quest/[id]/page.tsx`

### Page Structure (3-Column Layout)

```
┌─────────────────────────────────────────────┐
│              Quest Title                     │
├─────────────────────────────────────────────┤
│         │                    │               │
│  Left   │     Middle         │     Right    │
│  Panel  │     (Main View)    │     Panel    │
│         │                    │              │
│ Tasks   │  Question Preview  │   Details    │
│ List    │  OR Chart View     │   & Actions  │
│         │                    │              │
│ ✓ Icons │ - Content Display  │ • Schedule   │
│ • Click │ - Answers Preview  │ • Creator    │
│ to      │ - Chart/Results    │ • Add to Lib │
│ Switch  │                    │ • Share/Save │
│         │                    │              │
└─────────────────────────────────────────────┘
```

### Key Features
1. **Left Panel**: Task navigation (quest.tasks list)
2. **Middle Panel**: 
   - Question view (showChart = false) - Shows actual answers/questions
   - Chart view (showChart = true) - Shows analytics/results
3. **Right Panel**: Quest metadata and actions

---

## 🎨 COMPONENTS DISPLAYING ANSWERS/CREATED CONTENT

### 1. **ChartPanel Component** (Lines 189-340)
Displays analytics/chart views for different question types:

```typescript
function ChartPanel({ task }: { task: Task })
```

**Question Types Rendered**:
- `single_choice` → Bar chart
- `multiple_choice` → Bar chart  
- `truefalse` → Bar chart
- `fill_in_the_blanks_choice` → Bar chart
- `scales` → Scales chart (1-5 rating)
- `ranking` → Horizontal bar chart
- `sorting` → Horizontal bar chart
- `wordcloud` → Word cloud visualization
- `shortanswer` / `longanswer` → Short/long answer view

**Imported Chart Components**:
- `GlobalBarChart` - For choice-based questions
- `GlobalHorizantalBarChart` - For ranking/sorting
- `D3WordCloud` - For word clouds
- `ScalesChart` - For scale ratings
- `QuickFromAnswerView` - For quick form answers
- `QuickShortAndLongAnswer` - For text answers

---

## 📝 ANSWER/CONTENT DISPLAY COMPONENTS

### Component Location: `/src/components/Liveui/`

#### 1. **QuickFromAnswerView.tsx**
**Purpose**: Display form answers in read-only mode
**Features**:
- Checkbox answers (read-only)
- Radio button answers (read-only)
- Dropdown answers (read-only)
- Shows selected options with styling

```tsx
const CheckboxReadOnly: React.FC<{ options: Option[]; selectedIdx1: number[] }>
const RadioReadOnly: React.FC<{ options: Option[]; selectedIdx1?: number }>
const DropdownReadOnly: React.FC<{ options: Option[]; selectedIdx1?: number }>
```

#### 2. **QuickShortAndLongAnswer.tsx**
**Purpose**: Display short and long answer responses in cards
**Features**:
- Animated card display for each answer
- Color-coded cards (6 different background colors)
- Responsive grid layout
- Socket.js integration for real-time answer updates

```tsx
function QuickShortAndLongAnswer({ answerData }: any)
// Displays answers in colorful gradient cards
// Maps through answerData array with animations
```

#### 3. **QuickFromCreateorView.tsx**
**Purpose**: Creator view of form responses
**Features**:
- Modal display of individual respondent answers
- Lists all respondents with their submission data
- Socket.js integration for live updates

```tsx
type Respondent = {
	id: string;
	user_name: string;
	time: number;
	answer_data: AnswerItem[];
};

function QuickFromCreateorView({ quickFromId }: any)
```

---

## 🔄 ATTEMPT/LIVE ROUTES

### Quest Attempt
- **Route**: `/app/(public)/attempt/quest/[id]/page.tsx`
- **Component**: `QuestAttemptForm` (from Liveui)
- **Live Route**: `/app/(public)/attempt/quest-live/[id]/page.tsx`
- **Play Component**: `QuestPlayComponent`

### Quiz Attempt
- **Route**: `/app/(public)/attempt/[id]/page.tsx`
- **Component**: `GlobalAttempFrom`

### Survey Attempt
- **Route**: `/app/(public)/attempt/survey/[id]/page.tsx`
- **Component**: `QuestAttemptForm`

---

## 📊 DATA TYPES & STRUCTURES

### Quest Interface (from templates/quest/[id]/page.tsx)
```typescript
interface Task {
	id: number;
	quest_id: number;
	title: string;
	description: string | null;
	task_type: 'single_choice' | 'multiple_choice' | 'truefalse' | 
	           'fill_in_the_blanks_choice' | 'sorting' | 'scales' | 
	           'ranking' | 'wordcloud' | 'longanswer' | 'shortanswer';
	serial_number: number;
	task_data: {
		maxNumber?: number;
		questions: Question[];
		time_limit?: number;
		time_limit_seconds?: number;
	};
	is_required: boolean;
	created_at: string;
	updated_at: string;
}

interface Quest {
	id: number;
	title: string;
	description: string | null;
	creator_id: number;
	is_published: boolean;
	start_datetime: string;
	end_datetime: string;
	timezone: string;
	visibility: string;
	join_link: string;
	join_code: string;
	sequential_progression: boolean;
	tasks: Task[];
	creator: Creator;
}
```

### Question Types
```typescript
type Question = { 
	id: number; 
	text: string; 
	color?: string;  // Color coding for question
}
```

---

## 🎯 ANSWER RENDERING LOGIC

### In `templates/quest/[id]/page.tsx` (Lines 737-870)

**Question View Rendering** (showChart = false):
```tsx
// For single_choice questions
{currentTask.task_type === "single_choice" && (
	<div className="mt-4 grid gap-2">
		{currentTask.task_data.questions.map((option: any) => (
			<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
				<div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
				<span className="text-gray-700">{option.text}</span>
			</div>
		))}
	</div>
)}

// For multiple_choice questions
{currentTask.task_type === "multiple_choice" && (
	<div className="mt-4 grid gap-2">
		{currentTask.task_data.questions.map((option: any) => (
			<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
				<div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
				<span className="text-gray-700">{option.text}</span>
			</div>
		))}
	</div>
)}

// For truefalse questions
{currentTask.task_type === "truefalse" && (
	<div className="mt-4 flex gap-4 justify-center">
		<button className="px-6 py-3 bg-green-100 text-green-700 rounded-lg">Yes</button>
		<button className="px-6 py-3 bg-red-100 text-red-700 rounded-lg">No</button>
	</div>
)}

// For scales questions
{currentTask.task_type === "scales" && (
	<div className="flex gap-2">
		{[1, 2, 3, 4, 5].map((star) => (
			<div className="w-8 h-8 bg-gray-100 rounded-lg border border-gray-200" />
		))}
	</div>
)}
```

---

## 🚀 KEY STATE MANAGEMENT

**In DiscoverQuestPage component**:
```tsx
const [quest, setQuest] = useState<Quest | null>(null);
const [currentSlide, setCurrentSlide] = useState(0);
const [showChart, setShowChart] = useState(true);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [toast, setToast] = useState({...});
const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
```

---

## 📡 API ENDPOINTS USED

1. **Fetch Quest Details**:
   - `GET /quests-public/show/{questId}`
   - Response: `{ status: boolean; data: { quest: Quest } }`

2. **Copy Quest to Library**:
   - `POST /quests/copy-with-tasks/{questId}`
   - Payload: Title, description, is_published, etc.

3. **Discover Quests**:
   - `GET /quests-public?page={page}&per_page={perPage}`

---

## 🎯 ANSWER VISUALIZATION FLOW

```
User visits quest template
    ↓
Fetch quest data from API
    ↓
Display 3-panel layout:
    ├─ Left Panel: Task list
    ├─ Middle Panel: 
    │   ├─ View Mode 1: Questions/Answers (showChart=false)
    │   │   └─ Rendered by inline components (radio/checkbox/etc)
    │   │
    │   └─ View Mode 2: Chart/Analytics (showChart=true)
    │       └─ ChartPanel component
    │           ├─ GlobalBarChart
    │           ├─ GlobalHorizantalBarChart
    │           ├─ ScalesChart
    │           ├─ D3WordCloud
    │           ├─ QuickFromAnswerView
    │           └─ QuickShortAndLongAnswer
    │
    └─ Right Panel: Quest info & actions
```

---

## 💡 KEY TAKEAWAYS

1. **Public Display**: Quest/Quiz templates shown via `/templates/[type]/[id]` routes
2. **Answer Components**: Located in `/components/Liveui/` 
3. **Visualization**: Uses chart components from `/components/Chart/`
4. **Toggle Views**: Chart view vs Question view via `showChart` state
5. **Socket Integration**: Real-time updates via quest-socket for live data
6. **Task Types**: 10+ different question types supported with specific rendering logic
7. **Styling**: Tailwind CSS with Framer Motion animations
8. **Responsive**: Grid-based 3-column layout that adapts to screen sizes
