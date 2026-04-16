/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { QuestionBlock } from "@/components/Dashboard/Quest/QuickFormComponents/quest";
import axiosInstance from "@/utils/axiosInstance";
// import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

import {
	connectSocket,
	emitsubmitTaskForQuickForm,
	// getSocket,
	waitForAnswerProcessedQuestOnce,
} from "@/socket/quest-socket";
import { AxiosError } from "axios";

import SharedQuestTimer from "../SharedQuestTimer";
import { IoMdHappy } from "react-icons/io";
// import moment from "moment";

const CheckboxPreview: React.FC<{
	options: { id: string; text: string }[];
	selected: string[];
	onToggle: (optId: string, checked: boolean) => void;
}> = ({ options, selected, onToggle }) => (
	<div className="space-y-2">
		{options.map((o) => {
			const id = String(o.id);
			const checked = selected.includes(id);
			return (
				<label
					key={id}
					className="flex items-center gap-2 cursor-pointer"
				>
					<input
						type="checkbox"
						className="h-4 w-4 text-primary border-gray-300 rounded"
						checked={checked}
						onChange={(e) => onToggle(id, e.target.checked)}
					/>
					<span>{o.text}</span>
				</label>
			);
		})}
	</div>
);

const RadioPreview: React.FC<{
	options: { id: string; text: string }[];
	name: string;
	selected?: string;
	onSelect: (optId: string) => void;
}> = ({ options, name, selected, onSelect }) => (
	<div className="space-y-2">
		{options.map((o) => {
			const id = String(o.id);
			return (
				<label
					key={id}
					className="flex items-center gap-2 cursor-pointer"
				>
					<input
						type="radio"
						name={name}
						className="h-4 w-4 text-primary border-gray-300"
						checked={selected === id}
						onChange={() => onSelect(id)}
					/>
					<span>{o.text}</span>
				</label>
			);
		})}
	</div>
);

const DropdownPreview: React.FC<{
	options: { id: string; text: string }[];
	selected?: string;
	onSelect: (optId: string) => void;
}> = ({ options, selected, onSelect }) => (
	<div className="relative">
		<select
			className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
			value={selected ?? ""}
			onChange={(e) => onSelect(e.target.value)}
		>
			<option value="">Select an option</option>
			{options.map((o) => (
				<option key={o.id} value={String(o.id)}>
					{o.text}
				</option>
			))}
		</select>
		<FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
	</div>
);

const ShortAnswerPreview: React.FC<{
	value?: string;
	onChange: (v: string) => void;
}> = ({ value, onChange }) => (
	<input
		type="text"
		placeholder="Your answer"
		value={value ?? ""}
		onChange={(e) => onChange(e.target.value)}
		className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
	/>
);

const parseSN = (sn?: string | number) => {
	const n = Number(sn);
	return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER; // non-numeric last
};

type TaskItem = {
	id?: number;
	title?: string;
	description?: string | null;
	questions?: QuestionBlock[];
};

type Props = {
	task?: TaskItem;
	onSubmit?: (payload: any) => void; // <-- submit callback
};

/* ---------------- helpers ---------------- */

const optIndex1 = (
	opts: { id: string | number }[] | undefined,
	pickedId: string
) => {
	const list = opts ?? [];
	const i = list.findIndex((o) => String(o.id) === pickedId);
	return i >= 0 ? i + 1 : undefined;
};

const buildSubmission = (
	qs: QuestionBlock[],
	form: Record<string, string | string[]>
) => {
	return qs.map((q) => {
		const qid = String(q.id);
		const base = {
			id: String(q.id),
			type: q.type,
			label: q.label ?? null,
			options: (q.options ?? []).map((o) => ({
				id: String(o.id),
				text: o.text ?? null,
			})),
			serial_number: String(q.serial_number ?? ""),
		};

		const value = form[qid];

		switch (q.type) {
			case "checkbox": {
				const arr = Array.isArray(value) ? (value as string[]) : [];
				const indices = arr
					.map((picked) => optIndex1(q.options, picked))
					.filter((x): x is number => typeof x === "number");
				return { ...base, selected_options: indices };
			}
			case "radio":
			case "dropdown": {
				const picked = typeof value === "string" ? value : "";
				const idx1 = picked ? optIndex1(q.options, picked) : undefined;
				return { ...base, selected_option: idx1 };
			}
			case "short-answer": {
				const text = typeof value === "string" ? value : "";
				return { ...base, text };
			}
			default:
				return base;
		}
	});
};
/* ------------------------------------------ */

const QuickFormPreview: React.FC<Props> = ({ task }) => {
	console.log(task, "tasktask");
	const dataNew: any = task;
	const searchParams = useSearchParams();
	const [questions, setQuestions] = useState<QuestionBlock[]>(
		(task?.questions as QuestionBlock[]) ?? []
	);

	const [form, setForm] = useState<Record<string, string | string[]>>({});
	const [chalangeData, setchalangeData] = useState<any>({});
	const [currentTimeGet, setcurrentTimeGet] = useState<any>(0);
	console.log(chalangeData);

	const attempId = searchParams.get("aid");
	const joinuname = searchParams.get("uname");
	const userId = searchParams.get("ujid");
	const joinid = searchParams.get("jid");
	const [watingData, setwatingData] = useState(true);

	useEffect(() => {
		setQuestions((task?.questions as QuestionBlock[]) ?? []);
		setForm({});
	}, [task?.id]);

	useEffect(() => {
		if (typeof window !== "undefined" && !navigator.onLine) {
			console.warn("Offline — skipping API call");
			return;
		}

		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quest-attempts-url/show-by-link/${joinid}`
				);
				setchalangeData(response?.data?.data?.quest);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				console.error("Unexpected error:", axiosError.message);
			}
		};
		dataFetch();
	}, [joinid]);

	useEffect(() => {
		if (!task?.id) return;

		const key = `timeExpired_${task.id}`;
		const raw = localStorage.getItem(key);
		console.log(raw, "rawrawrawrawrawraw");

		if (raw === null) {
			return;
		}

		try {
			const parsed = JSON.parse(raw);
			const expired =
				parsed?.status === "completed" &&
				String(parsed?.taskId) === String(task.id);

			setwatingData(!expired ? true : false);
		} catch {
			const expired = raw === "completed";
			setwatingData(!expired);
		}
	}, [task?.id]);

	const handleExpire = () => {
		console.log(task?.id, "task?.idtask?.idtask?.id");

		if (!task?.id) return;
		const saved = setTaskExpired(task.id);
		const ok =
			saved?.status === "completed" &&
			String(saved?.taskId ?? task.id) === String(task.id);
		if (ok) {
			setwatingData(false);
		}
	};

	const setTaskExpired = (taskId: string | number) => {
		const key = `timeExpired_${taskId}`;
		const payload = { status: "completed", taskId, ts: Date.now() };
		localStorage.setItem(key, JSON.stringify(payload));
		return payload;
	};

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === `timeExpired_${task?.id}`) {
				// re-run your same logic
				try {
					const parsed = e.newValue ? JSON.parse(e.newValue) : null;
					const ok =
						parsed?.status === "completed" &&
						String(parsed?.taskId ?? task?.id) === String(task?.id);
					setwatingData(!!ok);
				} catch {
					setwatingData(e.newValue === "completed");
				}
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [task?.id]);

	const orderedQuestions = useMemo(() => {
		return questions
			.map((q, idx) => ({ q, idx }))
			.sort((a, b) => {
				const diff =
					parseSN(a.q.serial_number) - parseSN(b.q.serial_number);
				return diff !== 0 ? diff : a.idx - b.idx;
			})
			.map(({ q }) => q);
	}, [questions]);

	const update = (qid: string, val: string | string[]) => {
		const next = { ...form, [qid]: val };
		setForm(next);
	};

	const renderPreview = (q: QuestionBlock) => {
		console.log(q.options, "q.options");

		const qid = String(q.id);
		const opts = (q.options ?? [])
			.filter((o) => o.text !== null && o.text.trim() !== "")
			.map((o) => ({
				id: String(o.id),
				text: o.text,
			}));

		switch (q.type) {
			case "checkbox": {
				const selected = Array.isArray(form[qid])
					? (form[qid] as string[])
					: [];
				return (
					<CheckboxPreview
						options={opts}
						selected={selected}
						onToggle={(optId, checked) => {
							const set = new Set(selected);
							checked ? set.add(optId) : set.delete(optId);
							update(qid, Array.from(set));
						}}
					/>
				);
			}
			case "radio": {
				const selected =
					typeof form[qid] === "string" ? (form[qid] as string) : "";
				return (
					<RadioPreview
						options={opts}
						name={qid}
						selected={selected}
						onSelect={(optId) => update(qid, optId)}
					/>
				);
			}
			case "dropdown": {
				const selected =
					typeof form[qid] === "string" ? (form[qid] as string) : "";
				return (
					<DropdownPreview
						options={opts}
						selected={selected}
						onSelect={(optId) => update(qid, optId)}
					/>
				);
			}
			case "short-answer": {
				const val =
					typeof form[qid] === "string" ? (form[qid] as string) : "";
				return (
					<ShortAnswerPreview
						value={val}
						onChange={(v) => update(qid, v)}
					/>
				);
			}
			default:
				return null;
		}
	};

	// const handleSubmit = () => {
	// 	const payload = buildSubmission(orderedQuestions, form);
	// 	saveAnswer(payload);
	// 	//console.log("SUBMIT payload:", payload);
	// };
	const handleSubmit = async () => {
		// const existing = getSocket();
		const payload = buildSubmission(orderedQuestions, form);
		await saveAnswer(payload);
		reqSoketData(payload);
		const submitStatusCheck = await waitForAnswerProcessedQuestOnce();
		if (!submitStatusCheck) {
			connectSocket().then(() => {
				reqSoketData(payload);
			});
		}

		// if (existing?.connected) {
		// 	reqSoketData(payload);
		// 	await saveAnswer(payload);
		// } else {
		// 	await connectSocket();
		// 	reqSoketData(payload);
		// 	await saveAnswer(payload);
		// }
	};

	const reqSoketData = (payload: any) => {
		emitsubmitTaskForQuickForm({
			userId: `${userId}`,
			questionId: `${task?.id}`,
			userName: `${joinuname}`,
			questionTitle: `${task?.title}`,
			questionType: "quick_form",
			quickFormData: payload,
			optionType: "quick_form",
		});
		setwatingData(false);
	};

	const saveAnswer = async (data: any) => {
		try {
			// const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
			const payload = {
				task_id: task?.id,
				completion_data: {
					...data,
				},
				time_taken_seconds: currentTimeGet,
			};
			await axiosInstance.post(
				`/quest-attempts/${attempId}/answer`,
				payload
			);
		} catch (error) {
			console.error("Error saving answer:", error);
		}
	};

	const htmlToText = (html?: string) => {
		if (!html) return "";
		const stripped = html.replace(/<[^>]*>/g, " ");
		if (typeof window !== "undefined") {
			const div = document.createElement("div");
			div.innerHTML = stripped;
			const text = div.textContent || div.innerText || "";
			return text
				.replace(/\u00a0/g, " ")
				.replace(/\s+/g, " ")
				.trim();
		}
		return stripped
			.replace(/\u00a0/g, " ")
			.replace(/\s+/g, " ")
			.trim();
	};

	const handleTimeUpdate = (
		remaining: number,
		elapsed: number,
		total: number
	) => {
		console.log(total, "total");
		console.log(elapsed, "total");
		console.log(remaining, "total");
		setcurrentTimeGet(remaining);
	};
	console.log(currentTimeGet);

	return (
		<>
			{/* watingData */}

			{watingData ? (
				<div className="max-w-5xl mx-auto space-y-8 p-4 rounded-xl">
					<h2 className="text-2xl font-semibold text-gray-900 text-center">
						{htmlToText(task?.title)}
					</h2>

					<div className="flex justify-center items-center">
						<SharedQuestTimer
							attemptId={`attempt-${dataNew?.id}`}
							onTimeUpdate={handleTimeUpdate}
							onExpire={handleExpire}
						/>
					</div>

					{orderedQuestions.map((q) => (
						<div
							key={String(q.id)}
							className="p-4 bg-white rounded-lg border border-gray-200"
						>
							<p className="font-medium text-gray-800 mb-3">
								{parseSN(q.serial_number)}.{" "}
								{q.label || "Untitled Question"}
							</p>
							{renderPreview(q)}
						</div>
					))}

					{orderedQuestions.length === 0 && (
						<div className="p-4 text-sm text-gray-500 border rounded-lg bg-white">
							No questions for this quick form.
						</div>
					)}

					{/* Submit button */}
					{orderedQuestions.length > 0 && (
						<div className="pt-4 flex justify-center items-center">
							<button
								onClick={handleSubmit}
								className="px-6 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90"
							>
								Submit
							</button>
						</div>
					)}
				</div>
			) : (
				<div className="flex justify-center items-center">
					<h3 className="md:text-[30px] font-bold text-[18px] flex flex-col justify-center items-center pt-30">
						<IoMdHappy className="mb-[30px] text-[100px]" />
						Please wait for the presenter to change slides.
					</h3>
				</div>
			)}
		</>
	);
};

export default QuickFormPreview;
