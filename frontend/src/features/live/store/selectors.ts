import type { RootState } from "@/stores/store";
import type {
	APIPayload,
	APITask,
	APITaskQuestion,
} from "@/types/quickForm.types";

export const selectTasksByQuest = (state: RootState, quest_id: string) =>
	(state.quickForm.byQuest[quest_id] ?? [])
		.slice()
		.sort((a, b) => a.serial_number - b.serial_number);

export const selectTaskById = (
	state: RootState,
	quest_id: string,
	taskId: number | string
) => {
	const list = state.quickForm.byQuest[quest_id] ?? [];
	return list.find((t) => String(t.id) === String(taskId)) || null;
};

export const selectQuickFormPayload = (
	state: RootState,
	quest_id: string
): APIPayload => {
	const tasks = selectTasksByQuest(state, quest_id);

	const apiTasks: APITask[] = tasks.map((t) => {
		const apiQuestions: APITaskQuestion[] = t.questions
			.slice()
			.sort((a, b) => Number(a.serial_number) - Number(b.serial_number))
			.map((q, idx) => ({
				id: Number(q.id) || Math.floor(100000 + Math.random() * 900000),
				title: q.label,
				type: q.type,
				options: q.options.map((o, i) => ({
					id: Number(o.id) || i + 1,
					text: o.text,
				})),
				is_required: q.type === "short-answer",
				serial_number: idx + 1,
			}));

		return {
			id: t.id,
			quest_id: t.quest_id,
			title: t.title ?? "",
			description: t.description ?? "",
			task_type: "quick_form",
			serial_number: t.serial_number,
			is_required: t.is_required,
			task_data: { questions: apiQuestions },
		};
	});

	return { tasks: apiTasks };
};
