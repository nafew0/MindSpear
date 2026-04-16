/* eslint-disable @typescript-eslint/no-explicit-any */
import { PreparedChart, Quest, ResultDatum, Task, TaskType } from "../types/liveTypes";

const CHOICE_TYPES: TaskType[] = ["single_choice", "truefalse", "ranking", "sorting", "scales"];

function pickChartType(taskType: TaskType): PreparedChart["type"] {
  if (taskType === "wordcloud" || taskType === "shortanswer" || taskType === "longanswer") return "wordcloud";
  if (taskType === "ranking") return "bar";
  if (taskType === "scales") return "donut";
  if (taskType === "truefalse") return "pie";
  return "bar";
}

function buildCategories(task: Task, length: number): string[] {
  const fromQuestions = task.task_data?.questions?.map(q => String(q.text).trim()).filter(Boolean) || [];
  if (fromQuestions.length >= length) return fromQuestions.slice(0, length);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return Array.from({ length }, (_, i) => fromQuestions[i] ?? `Option ${alphabet[i] ?? i + 1}`);
}

export function prepareCharts(quest: Quest, results: ResultDatum[]): PreparedChart[] {
  const byId = new Map(results.map(r => [r.id, r]));

  return quest.tasks
    .filter(t => t.task_type !== "quick_form")
    .map(task => {
      const res = byId.get(task.id);
      const type = pickChartType(task.task_type);

      if (!res) {
        const categories = buildCategories(task, Math.max(1, task.task_data?.questions?.length ?? 0));
        return {
          taskId: task.id,
          title: task.title.replace(/\u00A0/g, " "),
          type,
          data: Array(categories.length).fill(0),
          categories,
        } as PreparedChart;
      }

      if (CHOICE_TYPES.includes(task.task_type)) {
        const numbers = (res as any).number as number[] | undefined;
        const categories = buildCategories(task, numbers?.length ?? 0);
        return {
          taskId: task.id,
          title: task.title.replace(/\u00A0/g, " "),
          type,
          data: numbers ?? [],
          categories,
        };
      }

      const words = (res as any).text as string[] | undefined;
      return {
        taskId: task.id,
        title: task.title.replace(/\u00A0/g, " "),
        type: "wordcloud",
        words: words ?? [],
      };
    });
}
