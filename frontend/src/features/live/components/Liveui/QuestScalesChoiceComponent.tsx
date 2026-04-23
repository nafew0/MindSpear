"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
// import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { upsertAnswer } from "@/features/live/store/leaderboardAnswersSlice";
import { useDispatch } from "react-redux";
import moment from "@/lib/dayjs";
import { AxiosError } from "axios";
import ScaleRow, { ScaleOption } from "./Scales/ScaleRow";
import SharedQuestTimer from "@/components/SharedQuestTimer";
import { IoMdHappy } from "react-icons/io";
type TaskQuestion = ScaleOption;
type TaskItem = {
	id?: number | string;
	quiz_id?: number | string;
	serial_number?: number;
	title?: string;
	question_type?: string;
	task_type?: string; // "scales"
	description?: string | null;
	questions?: TaskQuestion[];
	time_limit_seconds?: number | string;
	source_content_url?: string | null;

	// IMPORTANT: min/max may exist at root (from your sample)
	minNumber?: number;
	maxNumber?: number;

	// sometimes wrapped in task_data in chalangeData.tasks
	task_data?: {
		time_limit?: number;
		minNumber?: number;
		maxNumber?: number;
	};
};
type Props = {
	task?: TaskItem;
	value?: string | null; // kept for legacy API (unused for scales)
	onChange?: (val: string) => void; // legacy
};
const QuestScalesChoiceComponent: React.FC<Props> = ({ task }) => {
	const dispatch = useDispatch();
	const searchParams = useSearchParams();
	const joinid = searchParams.get("jid");
	const attempId = searchParams.get("aid");
	const [watingData, setwatingData] = useState(true);
	const [, setchalangeData] = useState<any>({});
	const [, setcurrentTimeGet] = useState<number>(0);
	useEffect(() => {
		if (typeof window !== "undefined" && !navigator.onLine) {
			console.warn("Offline — skipping API call");
			return;
		}
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quest-attempts-url/show-by-link/${joinid}`,
				);
				setchalangeData(response?.data?.data?.quest);
			} catch (error) {
				const axiosError = error as AxiosError<{
					message?: string;
				}>;
				console.error("Unexpected error:", axiosError.message);
			}
		};
		dataFetch();
	}, [joinid]);
	useEffect(() => {
		if (!task?.id) return;
		const key = `timeExpired_${task.id}`;
		const raw = localStorage.getItem(key);
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

	// derive options and min/max
	const optionObjs = useMemo<ScaleOption[]>(
		() => task?.questions ?? [],
		[task?.questions],
	);

	// priority: task.minNumber/maxNumber -> task.task_data.minNumber/maxNumber -> defaults
	const minNumber = useMemo(() => {
		const direct = (task as any)?.minNumber;
		const nested = (task as any)?.task_data?.minNumber;
		return Number(direct ?? nested ?? 1);
	}, [task]);
	const maxNumber = useMemo(() => {
		const direct = (task as any)?.maxNumber;
		const nested = (task as any)?.task_data?.maxNumber;
		return Number(direct ?? nested ?? 5);
	}, [task]);
	// values aligned with options (0 => skipped)
	const [selectedValues, setSelectedValues] = useState<number[]>(
		optionObjs.map(() => 0),
	);
	const startRef = useRef<number>(Date.now());
	useEffect(() => {
		// reset when the question/task changes
		startRef.current = Date.now();
		setSelectedValues((task?.questions ?? []).map(() => 0));
		setwatingData(true);
	}, [task?.id, task?.questions]); // re-init on change

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

	// sync to Redux
	const syncReduxScales = (values: number[]) => {
		const elapsedSec = Math.max(
			0,
			Math.round((Date.now() - startRef.current) / 1000),
		);
		const answered = optionObjs.map((q, i) => ({
			id: q.id,
			text: q.text ?? q.label ?? "",
			color: q.color ?? null,
			value: values[i] ?? 0,
		}));
		dispatch(
			upsertAnswer({
				id: (task?.id as number | string) ?? "scales",
				quiz_id: (task as any)?.quiz_id ?? null,
				serial_number: (task as any)?.serial_number ?? null,
				title: task?.title ?? null,
				question_type:
					(task as any)?.question_type ?? task?.task_type ?? "scales",
				selected_time: elapsedSec,
				source_content_url: (task as any)?.source_content_url ?? null,
				questions: answered, // detailed per-option entries
				// selected_values: values,     // array like [3,1,0,...] (if your slice supports it)
			}),
		);
	};
	const handleScaleChange = (index: number, nextValue: number) => {
		setSelectedValues((prev) => {
			const copy = [...prev];
			copy[index] = Number(nextValue);
			syncReduxScales(copy);
			return copy;
		});
	};
	const handleSkip = (index: number) => {
		setSelectedValues((prev) => {
			const copy = [...prev];
			copy[index] = 0; // 0 means skipped
			syncReduxScales(copy);
			return copy;
		});
	};
	const dataNew: any = task;
	const dataSubmit = async () => {
		await saveAnswer();
		if (task?.id) setTaskExpired(task.id);
		setwatingData(false);
		if (typeof window !== "undefined") {
			localStorage.setItem("currentId", `${task?.id}`);
		}
	};
	const saveAnswer = async () => {
		try {
			const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
			const payload = {
				task_id: task?.id,
				completion_data: {
					start_time: currentTime,
					selected_option: selectedValues, // array of numbers
				},
				time_taken_seconds: currentTimeGet,
			};
			await axiosInstance.post(
				`/quest-attempts/${attempId}/answer`,
				payload,
			);
		} catch (error) {
			console.error("Error saving answer:", error);
		}
	};
	const handleExpire = () => {
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
		const payload = {
			status: "completed",
			submitStatus: "complited",
			taskId,
			ts: Date.now(),
		};
		localStorage.setItem(key, JSON.stringify(payload));
		setwatingData(false);
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
	useEffect(() => {
		if (!task?.id) return;
		const key = `timeExpired_${task.id}`;
		const userStatus: any = localStorage.getItem(key);
		if (userStatus !== null) {
			const savedState = JSON.parse(userStatus);
			if (
				savedState?.status === "completed" ||
				(savedState?.submitStatus === "completed" &&
					task.id === savedState?.taskId)
			) {
				setwatingData(false);
			}
		} else {
			setwatingData(true);
		}
	}, [dataNew?.id, task?.id]);
	const handleTimeUpdate = (remaining: number) => {
		setcurrentTimeGet(remaining);
	};
	const selectionText = `Selected values: [${selectedValues.join(", ")}]`;
	return (
		<div className="min-h-screen overflow-auto flex flex-col justify-center items-center px-4">
			{watingData ? (
				<div className="max-w-xl w-full space-y-6">
					<h2 className="text-2xl font-semibold text-gray-900 text-center">
						{htmlToText(task?.title)} scales
					</h2>

					<div className="flex justify-center items-center">
						<SharedQuestTimer
							attemptId={`attempt-${dataNew?.id}`}
							onTimeUpdate={handleTimeUpdate}
							onExpire={handleExpire}
						/>
					</div>

					{/* SCALES LIST */}
					<div className="space-y-4">
						{optionObjs.length > 0 ? (
							optionObjs.map((opt, i) => (
								<ScaleRow
									key={opt.id ?? i}
									option={opt}
									index={i}
									min={minNumber}
									max={maxNumber}
									value={selectedValues[i] ?? 0}
									onChange={handleScaleChange}
									onSkip={handleSkip}
								/>
							))
						) : (
							<div className="text-sm text-gray-500 text-center border rounded-xl p-4">
								No options provided for this question.
							</div>
						)}
					</div>

					<div className="text-center text-sm text-gray-500">
						{selectionText}
					</div>

					<div className="flex items-center justify-center py-2">
						<button
							onClick={dataSubmit}
							className="bg-primary px-4 py-2 rounded-lg text-white"
						>
							Submit
						</button>
					</div>
				</div>
			) : (
				<div className="flex justify-center items-center">
					<h3 className="md:text-[30px] font-bold text-[18px] flex flex-col justify-center items-center pt-30">
						<IoMdHappy className="mb-[30px] text-[100px]" />
						Please wait for the presenter to change slides.
					</h3>
				</div>
			)}
		</div>
	);
};
export default QuestScalesChoiceComponent;
