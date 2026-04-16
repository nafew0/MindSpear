// services/redux/features/quickForm/quickFormSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  QuickFormSliceState,
  QuickFormTaskState,
  UIQuestion,
} from "@/types/quickForm.types";

const initialState: QuickFormSliceState = {
  byQuest: {},
};

/** ——— helpers ——— **/
const genNumId = () => Math.floor(100000 + Math.random() * 900000);
const genStrId = () => (Math.floor(100000 + Math.random() * 900000)).toString();
const renumber = <T extends { serial_number: number }>(arr: T[]) =>
  arr
    .map((x, i) => ({ ...x, serial_number: i + 1 }))
    .sort((a, b) => a.serial_number - b.serial_number);

/** ——— Slice ——— **/
const quickFormSlice = createSlice({
  name: "quickForm",
  initialState,
  reducers: {
    ensureQuest(state, action: PayloadAction<{ quest_id: string }>) {
      const { quest_id } = action.payload;
      if (!state.byQuest[quest_id]) state.byQuest[quest_id] = [];
    },

    /** NEW: ensure a task exists with a specific server id (selectedItem.id) */
    ensureTaskWithId(
      state,
      action: PayloadAction<{
        quest_id: string;
        taskId: number; // server id from selectedItem.id
      }>
    ) {
      const { quest_id, taskId } = action.payload;
      const list = state.byQuest[quest_id] ?? (state.byQuest[quest_id] = []);
      const existing = list.find((t) => t.id === taskId);
      if (!existing) {
        const nextSerial = list.length + 1;
        list.push({
          id: taskId,
          quest_id,
          title: "",
          description: "",
          task_type: "quick_form",
          serial_number: nextSerial,
          is_required: true,
          questions: [],
        });
      }
    },

    // TASKS (unchanged except we removed any localStorage calls)
    addTask(state, action: PayloadAction<{ quest_id: string, task_type?: string }>) {
      const { quest_id, task_type = "quick_form" } = action.payload;
      if (task_type !== "quick_form") return;
      const list = state.byQuest[quest_id] ?? (state.byQuest[quest_id] = []);
      const nextSerial = list.length + 1;
      list.push({
        id: genNumId(),
        quest_id,
        title: "",
        description: "",
        task_type: "quick_form",
        serial_number: nextSerial,
        is_required: true,
        questions: [],
      });
    },

    removeTask(state, action: PayloadAction<{ quest_id: string; taskId: number | string }>) {
      const { quest_id, taskId } = action.payload;
      const list = state.byQuest[quest_id] ?? [];
      state.byQuest[quest_id] = renumber(list.filter((t) => t.id !== taskId));
    },

    reorderTasks(state, action: PayloadAction<{ quest_id: string; orderedIds: number[] }>) {
      const { quest_id, orderedIds } = action.payload;
      const map = new Map((state.byQuest[quest_id] ?? []).map((t) => [t.id, t]));
      const reordered = orderedIds.map((id) => map.get(id)!).filter(Boolean);
      state.byQuest[quest_id] = renumber(reordered);
    },

    setTaskMeta(
      state,
      action: PayloadAction<{
        quest_id: string;
        taskId: number;
        patch: Partial<Pick<QuickFormTaskState, "title" | "description" | "is_required">>;
      }>
    ) {
      const { quest_id, taskId, patch } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      if (t) Object.assign(t, patch);
    },

    // QUESTIONS
    addQuestion(
      state,
      action: PayloadAction<{
        quest_id: string;
        taskId: number;
        qType: UIQuestion["type"];
      }>
    ) {
      const { quest_id, taskId, qType } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      if (!t) return;
      const nextSerial = t.questions.length + 1;
      t.questions.push({
        id: genStrId(),
        type: qType,
        label: "",
        serial_number: String(nextSerial),
        options: qType === "short-answer" ? [] : [{ id: "1", text: "Option 1" }],
      });
    },

    removeQuestion(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; qid: string }>
    ) {
      const { quest_id, taskId, qid } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      if (!t) return;
      t.questions = t.questions
        .filter((q) => q.id !== qid)
        .map((q, i) => ({ ...q, serial_number: String(i + 1) }));
    },

    reorderQuestions(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; orderedQIds: string[] }>
    ) {
      const { quest_id, taskId, orderedQIds } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      if (!t) return;
      const map = new Map(t.questions.map((q) => [q.id, q]));
      t.questions = orderedQIds
        .map((id) => map.get(id)!)
        .filter(Boolean)
        .map((q, i) => ({ ...q, serial_number: String(i + 1) }));
    },

    setQuestionLabel(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; qid: string; label: string }>
    ) {
      const { quest_id, taskId, qid, label } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      const q = t?.questions.find((x) => x.id === qid);
      if (q) q.label = label;
    },

    // OPTIONS
    addOptionIfLast(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; qid: string }>
    ) {
      const { quest_id, taskId, qid } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      const q = t?.questions.find((x) => x.id === qid);
      if (!q || q.type === "short-answer") return;
      q.options.push({ id: `${Date.now()}-${Math.random()}`, text: "" });
    },

    setOptionText(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; qid: string; optId: string; text: string }>
    ) {
      const { quest_id, taskId, qid, optId, text } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      const q = t?.questions.find((x) => x.id === qid);
      const o = q?.options.find((x) => x.id === optId);
      if (o) o.text = text;
    },

    removeOption(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; qid: string; optId: string }>
    ) {
      const { quest_id, taskId, qid, optId } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      const q = t?.questions.find((x) => x.id === qid);
      if (!q) return;
      q.options = q.options.filter((o) => o.id !== optId);
    },

    pasteOptionsReplace(
      state,
      action: PayloadAction<{ quest_id: string; taskId: number; qid: string; targetOptId: string; pasted: string }>
    ) {
      const { quest_id, taskId, qid, targetOptId, pasted } = action.payload;
      const t = (state.byQuest[quest_id] ?? []).find((x) => x.id === taskId);
      const q = t?.questions.find((x) => x.id === qid);
      if (!q || q.type === "short-answer") return;

      const parts = pasted.split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
      if (!parts.length) return;

      q.options = [
        ...q.options.filter((o) => o.id !== targetOptId),
        ...parts.map((p) => ({ id: `${Date.now()}-${Math.random()}`, text: p })),
      ];
    },
  },
});

export const {
  ensureQuest,
  ensureTaskWithId,   
  addTask,
  removeTask,
  reorderTasks,
  setTaskMeta,
  addQuestion,
  removeQuestion,
  reorderQuestions,
  setQuestionLabel,
  addOptionIfLast,
  setOptionText,
  removeOption,
  pasteOptionsReplace,
} = quickFormSlice.actions;

export default quickFormSlice.reducer;
