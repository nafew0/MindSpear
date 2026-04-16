// UI-side option/question shapes you already use:
export type UIOption = { id: string; text: string };

export type UIQuestion = {
  id: string; // string in UI
  type: "checkbox" | "radio" | "dropdown" | "short-answer";
  label: string;
  serial_number: string; // UI keeps it as string
  options: UIOption[];
};

// Server-side (payload) shapes:
export type APITaskQuestionOption = { id: number; text: string };

export type APITaskQuestion = {
  id: number;
  title: string;
  type: "checkbox" | "radio" | "dropdown" | "short-answer";
  options: APITaskQuestionOption[];
  is_required: boolean;
  serial_number: number;
};

export type APITask = {
  id: number;            // server id (temp local negative or zero until persisted)
  quest_id: string;      // as your example
  title: string;
  description: string;
  task_type: "quick_form";
  serial_number: number;
  is_required: boolean;
  task_data: { questions: APITaskQuestion[] };
};

export type APIPayload = { tasks: APITask[] };

// Store shapes:
export type QuickFormTaskState = {
  id: number;              // local/generated or from server
  quest_id: string;
  title: string;
  description: string;
  task_type: "quick_form";
  serial_number: number;   // order among tasks under a quest
  is_required: boolean;
  // UI questions (string ids, label field etc.)
  questions: UIQuestion[];
};

export type QuickFormSliceState = {
  // key: quest_id
  byQuest: Record<string, QuickFormTaskState[]>;
};
