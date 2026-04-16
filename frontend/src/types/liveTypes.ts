export type TaskType =
  | "single_choice"
  | "truefalse"
  | "ranking"
  | "sorting"
  | "scales"
  | "wordcloud"
  | "shortanswer"
  | "longanswer"
  | "quick_form";

export interface QuestionItem {
  id: number | string;
  text: string;
  color?: string;
}

export interface TaskData {
  questions: QuestionItem[];
  time_limit: number;
}

export interface Task {
  id: number;
  quest_id: number;
  title: string;
  description: string | null;
  task_type: TaskType;
  serial_number: number;
  task_data: TaskData;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string | null;
  creator_id: number;
  is_published: boolean;
  start_datetime: string; // ISO
  end_datetime: string;   // ISO
  timezone: string;       // e.g. "UTC"
  visibility: string;
  join_link: string;
  join_code: string;
  sequential_progression: boolean;
  created_at: string;
  updated_at: string;
  tasks: Task[];
}

// Live result payload you shared (one per task)
export type ResultDatum =
  | { quest_id: number; task_type: "wordcloud" | "shortanswer" | "longanswer"; id: number; text: string[] }
  | { quest_id: number; task_type: Exclude<TaskType, "wordcloud" | "shortanswer" | "longanswer" | "quick_form">; id: number; number: number[] };

export interface PreparedChart {
  taskId: number;
  title: string;
  type: "bar" | "pie" | "donut" | "wordcloud";
  data?: number[];           // for bar/pie/donut
  categories?: string[];     // labels for bar/pie/donut
  words?: string[];          // for wordcloud
}

