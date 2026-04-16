import { QuizState, QuizOption } from "@/types/types";
import { PayloadAction } from "@reduxjs/toolkit";
// import { PayloadAction } from '@reduxjs/toolkit';

export const addQuizOption = (state: QuizState) => {
	const selected = state.selectedItem;
	if (!selected || !selected.options || selected.options.length >= 6) return;

	const optionCount = selected.options.length;
	const colors = ["#0aa3a3", "#864cbf"];

	const newOption: QuizOption = {
		id: (optionCount + 1).toString(),
		text: "",
		placeholder: `Add answer ${optionCount + 1} (optional)`,
		color: colors[(optionCount - 4) % colors.length],
		isSelected: false,
	};

	selected.options.push(newOption);

	const itemIndex = state.multypleselectedItem.findIndex(
		(item) => item.id === selected.id
	);
	if (itemIndex !== -1 && state.multypleselectedItem[itemIndex].options) {
		state.multypleselectedItem[itemIndex].options?.push(newOption);
	}
};

// helper (type-agnostic; accepts any { id: string }[])
const nextUniqueOptionId = (options: Array<{ id: string }>): string => {
	const used = new Set(options.map((o) => String(o.id)));
	const nums = options
		.map((o) => parseInt(String(o.id), 10))
		.filter((n) => Number.isFinite(n));
	let candidate = nums.length ? Math.max(...nums) + 1 : 1;
	while (used.has(String(candidate))) candidate++;
	return String(candidate);
};

export const addQuestOption = (state: QuizState) => {
	const selected = state.selectedItem;
	if (!selected || !selected.options) return;

	const optionCount = selected.options.length;
	const colors = ["#0aa3a3", "#864cbf"];

	const uniqueId = nextUniqueOptionId(selected.options); // ✅ works with any {id:string}[]

	const newOption: QuizOption = {
		id: uniqueId,
		text: "",
		placeholder: `Option ${optionCount + 1}` || "",
		color: colors[(optionCount - 4) % colors.length],
		isSelected: false,
	};

	selected.options.push(newOption);

	const itemIndex = state.multypleselectedItem.findIndex(
		(item) => item.id === selected.id
	);
	if (itemIndex !== -1) {
		if (!state.multypleselectedItem[itemIndex].options) {
			state.multypleselectedItem[itemIndex].options = [];
		}
		state.multypleselectedItem[itemIndex].options!.push(newOption);
	}
};

// const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

// export const addQuestOptionsFromPaste = (
// 	state: QuizState,
// 	action: PayloadAction<string>
// ) => {
// 	const selected = state.selectedItem;
// 	if (!selected || !selected.options) return;

// 	const colors = ["#0aa3a3", "#864cbf"];

// 	// Existing texts for dedupe
// 	const existingSet = new Set(
// 		selected.options.map((o) => normalize(o?.text ?? "")).filter(Boolean)
// 	);

// 	// Clean incoming lines & dedupe
// 	const incoming: string[] = [];
// 	for (const raw of (action.payload || "").split(/\r?\n/)) {
// 		const cleaned = raw.trim();
// 		if (!cleaned) continue;
// 		const key = normalize(cleaned);
// 		if (!key || existingSet.has(key)) continue;
// 		existingSet.add(key);
// 		incoming.push(cleaned);
// 	}
// 	if (incoming.length === 0) return;

// 	const appended: QuizOption[] = [];
// 	// Work list to compute unique ids without TDZ issues
// 	const workIds: Array<{ id: string }> = selected.options.map((o) => ({
// 		id: String(o.id),
// 	}));

// 	const baseIndex = selected.options.length;

// 	for (let idx = 0; idx < incoming.length; idx++) {
// 		const text = incoming[idx];

// 		// ✅ compute id using current + already-appended ids
// 		const id = nextUniqueOptionId(workIds);

// 		const index = baseIndex + appended.length; // 0-based count of new ones
// 		const colorIdx = Math.max(0, index - 4) % colors.length;

// 		const opt: QuizOption = {
// 			id,
// 			text,
// 			placeholder: `Option ${index + 1}`, // always a string
// 			color: colors[colorIdx],
// 			isSelected: false,
// 		};

// 		appended.push(opt);
// 		workIds.push({ id }); // extend the pool so next ids are unique
// 	}

// 	// push to selected
// 	selected.options.push(...appended);

// 	// mirror
// 	const itemIndex = state.multypleselectedItem.findIndex(
// 		(item) => item.id === selected.id
// 	);
// 	if (itemIndex !== -1) {
// 		const mirror = state.multypleselectedItem[itemIndex];
// 		if (!mirror.options) mirror.options = [];
// 		mirror.options!.push(...appended);
// 	}
// };

// keep your normalize helper
const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

const colors = ["#0aa3a3", "#864cbf"];
export const addQuestOptionsFromPaste = (
	state: QuizState,
	action: PayloadAction<string>
) => {
	const selected = state.selectedItem;
	if (!selected) return;

	if (!selected.options) selected.options = [];
	const options = selected.options;

	const raw = (action.payload ?? "")
		.split(/\r?\n/)
		.map((s) => s.trim())
		.filter(Boolean);

	if (raw.length === 0) return;

	const existingSet = new Set(
		options.map((o) => normalize(o?.text ?? "")).filter(Boolean)
	);

	const incoming: string[] = [];
	for (const line of raw) {
		const key = normalize(line);
		if (!key || existingSet.has(key)) continue;
		existingSet.add(key);
		incoming.push(line);
	}
	if (incoming.length === 0) return;

	let cursor = 0;
	for (let i = 0; i < options.length && cursor < incoming.length; i++) {
		const opt = options[i];
		if (!normalize(opt?.text ?? "")) {
			opt.text = incoming[cursor++];

			const mi = state.multypleselectedItem.findIndex(
				(item) => item.id === selected.id
			);
			if (mi !== -1 && state.multypleselectedItem[mi].options?.[i]) {
				state.multypleselectedItem[mi].options![i].text = opt.text;
			}
		}
	}

	if (cursor < incoming.length) {
		const appended: QuizOption[] = [];

		const workIds: Array<{ id: string }> = options.map((o) => ({
			id: String(o.id),
		}));

		const baseIndex = options.length;

		while (cursor < incoming.length) {
			const text = incoming[cursor++];
			const id = nextUniqueOptionId(workIds);

			const index = baseIndex + appended.length;
			const colorIdx = Math.max(0, index - 4) % colors.length;

			const opt: QuizOption = {
				id,
				text,
				placeholder: `Option ${index + 1}`,
				color: colors[colorIdx],
				isSelected: false,
			};

			appended.push(opt);
			workIds.push({ id });
		}

		options.push(...appended);

		const itemIndex = state.multypleselectedItem.findIndex(
			(item) => item.id === selected.id
		);
		if (itemIndex !== -1) {
			const mirror = state.multypleselectedItem[itemIndex];
			if (!mirror.options) mirror.options = [];
			mirror.options!.push(...appended);
		}
	}
};

export const removeQuizOption = (state: QuizState) => {
	const selected = state.selectedItem;
	if (!selected || !selected.options || selected.options.length <= 4) return;

	selected.options.pop();

	const itemIndex = state.multypleselectedItem.findIndex(
		(item) => item.id === selected.id
	);
	if (itemIndex !== -1 && state.multypleselectedItem[itemIndex].options) {
		state.multypleselectedItem[itemIndex].options?.pop();
	}
};

// prevent going below 1 option (tweak to 0 if you want to allow empty)
export const removeQuestOption = (
	state: QuizState,
	action: { payload: string }
) => {
	const selected = state.selectedItem;
	const optionId = action.payload;

	if (!selected || !selected.options) return;
	if (selected.options.length <= 1) return; // <-- changed from <= 4

	// remove from selected
	selected.options = selected.options.filter((opt) => opt.id !== optionId);

	// mirror change in multypleselectedItem
	const idx = state.multypleselectedItem.findIndex(
		(i) => i.id === selected.id
	);
	if (idx !== -1 && state.multypleselectedItem[idx].options) {
		state.multypleselectedItem[idx].options = state.multypleselectedItem[
			idx
		].options!.filter((opt) => opt.id !== optionId);
	}
};

// Survey option handlers
export const addSurveyOption = (state: QuizState) => {
	const selected = state.selectedItem;
	if (!selected || !selected.options) return;

	const optionCount = selected.options.length;
	const colors = ["#0aa3a3", "#864cbf"];

	const uniqueId = nextUniqueOptionId(selected.options); // ✅ works with any {id:string}[]

	const newOption: QuizOption = {
		id: uniqueId,
		text: "",
		placeholder: `Option ${optionCount + 1}` || "",
		color: colors[(optionCount - 4) % colors.length],
		isSelected: false,
	};

	selected.options.push(newOption);

	const itemIndex = state.multypleselectedItem.findIndex(
		(item) => item.id === selected.id
	);
	if (itemIndex !== -1) {
		if (!state.multypleselectedItem[itemIndex].options) {
			state.multypleselectedItem[itemIndex].options = [];
		}
		state.multypleselectedItem[itemIndex].options!.push(newOption);
	}
};

export const removeSurveyOption = (
	state: QuizState,
	action: { payload: string }
) => {
	const selected = state.selectedItem;
	const optionId = action.payload;

	if (!selected || !selected.options) return;
	if (selected.options.length <= 1) return; // <-- changed from <= 4

	// remove from selected
	selected.options = selected.options.filter((opt) => opt.id !== optionId);

	// mirror change in multypleselectedItem
	const idx = state.multypleselectedItem.findIndex(
		(i) => i.id === selected.id
	);
	if (idx !== -1 && state.multypleselectedItem[idx].options) {
		state.multypleselectedItem[idx].options = state.multypleselectedItem[
			idx
		].options!.filter((opt) => opt.id !== optionId);
	}
};

export const addSurveyOptionsFromPaste = (
	state: QuizState,
	action: PayloadAction<string>
) => {
	const selected = state.selectedItem;
	if (!selected) return;

	if (!selected.options) selected.options = [];
	const options = selected.options;

	const raw = (action.payload ?? "")
		.split(/\r?\n/)
		.map((s) => s.trim())
		.filter(Boolean);

	if (raw.length === 0) return;

	const existingSet = new Set(
		options.map((o) => normalize(o?.text ?? "")).filter(Boolean)
	);

	const incoming: string[] = [];
	for (const line of raw) {
		const key = normalize(line);
		if (!key || existingSet.has(key)) continue;
		existingSet.add(key);
		incoming.push(line);
	}
	if (incoming.length === 0) return;

	let cursor = 0;
	for (let i = 0; i < options.length && cursor < incoming.length; i++) {
		const opt = options[i];
		if (!normalize(opt?.text ?? "")) {
			opt.text = incoming[cursor++];

			const mi = state.multypleselectedItem.findIndex(
				(item) => item.id === selected.id
			);
			if (mi !== -1 && state.multypleselectedItem[mi].options?.[i]) {
				state.multypleselectedItem[mi].options![i].text = opt.text;
			}
		}
	}

	if (cursor < incoming.length) {
		const appended: QuizOption[] = [];

		const workIds: Array<{ id: string }> = options.map((o) => ({
			id: String(o.id),
		}));

		const baseIndex = options.length;

		while (cursor < incoming.length) {
			const text = incoming[cursor++];
			const id = nextUniqueOptionId(workIds);

			const index = baseIndex + appended.length;
			const colorIdx = Math.max(0, index - 4) % colors.length;

			const opt: QuizOption = {
				id,
				text,
				placeholder: `Option ${index + 1}`,
				color: colors[colorIdx],
				isSelected: false,
			};

			appended.push(opt);
			workIds.push({ id });
		}

		options.push(...appended);

		const itemIndex = state.multypleselectedItem.findIndex(
			(item) => item.id === selected.id
		);
		if (itemIndex !== -1) {
			const mirror = state.multypleselectedItem[itemIndex];
			if (!mirror.options) mirror.options = [];
			mirror.options!.push(...appended);
		}
	}
};
