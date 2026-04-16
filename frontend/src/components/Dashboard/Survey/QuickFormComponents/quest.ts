export type QuestionOption = { id: string; text: string };

export type QuestionBlock = {
  id: string;
  type: "checkbox" | "radio" | "dropdown" | "short-answer";
  label: string;
  questId: string;
  serial_number: string;
  options: QuestionOption[];
};

export const QUESTION_TYPES = [
  { label: "Checkboxes", value: "checkbox" as const },
  { label: "Radio Buttons", value: "radio" as const },
  { label: "Dropdown", value: "dropdown" as const },
  { label: "Short Answer", value: "short-answer" as const },
];
