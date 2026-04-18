/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
	useEffect,
	useMemo,
	useRef,
	useState,
	useCallback,
} from "react";
import clsx from "clsx";
import {
	connectSocket,
	emitRankShortAndScaleSubmitTask,
	emitsubmitTaskWithRanking,
	getSocket,
	waitForAnswerProcessedQuestOnce,
} from "@/features/live/services/realtimeBridge";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { upsertAnswer } from "@/features/live/store/leaderboardAnswersSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import moment from "@/lib/dayjs";
import { AxiosError } from "axios";
import QuizTimer, { getCurrentTime } from "@/components/GlobalTimer";
import { TimerCacheManager } from "@/utils/timerCacheUtils";

import {
	DndContext,
	useDraggable,
	useDroppable,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragOverEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import SharedQuestTimer from "@/components/SharedQuestTimer";
import { IoMdHappy } from "react-icons/io";

type TaskQuestion = {
	id: number | string;
	text?: string;
	label?: string;
	color?: string;
};

type TaskItem = {
	id?: number | string;
	quiz_id?: number | string;
	serial_number?: number;
	title?: string;
	question_type?: string;
	task_type?: string;
	description?: string | null;
	questions?: TaskQuestion[];
	time_limit_seconds?: number | string;
	source_content_url?: string | null;
};

type Props = {
	task?: TaskItem;
	value?: string | null;
	onChange?: (val: string) => void;
};

/** --------------------------
 *  Small Draggable Item
 *  --------------------------
 */
function DraggableOption({
	id,
	label,
	from,
	optIdx,
	className,
}: {
	id: string;
	label: any;
	from: "options" | "ranking";
	optIdx: number;
	className?: string;
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id,
			data: { from, optIdx },
		});
	const style: React.CSSProperties = {
		transform: transform ? CSS.Translate.toString(transform) : undefined,
		opacity: isDragging ? 0.75 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={clsx(
				"select-none cursor-grab active:cursor-grabbing",
				className
			)}
			{...attributes}
			{...listeners}
		>
			{label}
		</div>
	);
}

/** --------------------------
 *  Droppable Zones
 *  --------------------------
 */
function Droppable({
	id,
	children,
	className,
}: {
	id: string;
	children: React.ReactNode;
	className?: string;
}) {
	const { setNodeRef, isOver } = useDroppable({ id });
	return (
		<div
			ref={setNodeRef}
			className={clsx(
				className,
				isOver ? "ring-2 ring-orange-400 ring-offset-2" : ""
			)}
		>
			{children}
		</div>
	);
}

const QuestChoiceComponent: React.FC<Props> = ({ task }) => {
	const dispatch = useDispatch();
	const answers = useSelector((state: RootState) => state.answers);
	console.log(answers, "answersanswersanswersanswers");
	console.log(task, "task");

	const dataNew: any = task;
	const searchParams = useSearchParams();
	const joinid = searchParams.get("jid");
	const userId = searchParams.get("ujid");
	const attempId = searchParams.get("aid");

	const [watingData, setwatingData] = useState(true);
	const [chalangeData, setchalangeData] = useState<any>({});
	const [currentTimeGet, setcurrentTimeGet] = useState<number>(0);

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

	// Build options and remember original mapping
	const optionNodes = task?.questions ?? [];
	const options = useMemo(
		() => optionNodes.map((q) => q.text ?? q.label ?? "").filter(Boolean),
		[optionNodes]
	);

	// Ranking state = array of original option indices
	const [ranked, setRanked] = useState<number[]>([]);
	useEffect(() => {
		setRanked([]);
		setwatingData(true);
	}, [task?.id]);

	// Available = all indices not present in ranked
	const available = useMemo(
		() => options.map((_, i) => i).filter((i) => !ranked.includes(i)),
		[options, ranked]
	);

	// Persist to Redux whenever ranking changes
	const persistRedux = useCallback(
		(rankOrder: number[]) => {
			const selectedAnswer =
				rankOrder.map((optIdx, i) => {
					const picked = optionNodes[optIdx];
					return {
						id: picked?.id ?? optIdx,
						text: options[optIdx],
						color: picked?.color ?? null,
						rank: i + 1,
					};
				}) ?? [];

			dispatch(
				upsertAnswer({
					id: (task?.id as number | string) ?? "ranking",
					quiz_id: (task as any)?.quiz_id ?? null,
					serial_number: (task as any)?.serial_number ?? null,
					title: task?.title ?? null,
					question_type:
						(task as any)?.question_type ??
						task?.task_type ??
						"ranking",
					selected_time: 0,
					source_content_url:
						(task as any)?.source_content_url ?? null,
					questions: selectedAnswer,
				})
			);
		},
		[dispatch, optionNodes, options, task]
	);

	const insertAt = (arr: number[], value: number, index: number) => {
		const next = [...arr];
		next.splice(index, 0, value);
		return next;
	};
	const moveItem = (arr: number[], fromIndex: number, toIndex: number) => {
		const next = [...arr];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		return next;
	};

	// Click to add (still supported)
	const addToRanking = (optIdx: number, pos?: number) => {
		if (ranked.includes(optIdx)) return;
		const next =
			typeof pos === "number"
				? insertAt(ranked, optIdx, pos)
				: [...ranked, optIdx];
		setRanked(next);
		persistRedux(next);
	};

	// Remove from ranking (used when dropping back into options)
	const removeFromRanking = (optIdx: number) => {
		if (!ranked.includes(optIdx)) return;
		const next = ranked.filter((v) => v !== optIdx);
		setRanked(next);
		persistRedux(next);
	};

	// Up/Down (kept)
	const moveUp = (pos: number) => {
		if (pos <= 0) return;
		const next = moveItem(ranked, pos, pos - 1);
		setRanked(next);
		persistRedux(next);
	};
	const moveDown = (pos: number) => {
		if (pos >= ranked.length - 1) return;
		const next = moveItem(ranked, pos, pos + 1);
		setRanked(next);
		persistRedux(next);
	};

	// Timer + socket
	const startRef = useRef<number>(Date.now());
	useEffect(() => {
		startRef.current = Date.now();
	}, [task?.id]);

	const handleExpire = () => {
		if (!task?.id) return;

		console.log(
			"Time is up! Current time:",
			getCurrentTime().toISOString()
		);
		const key = `timeExpired_${task.id}`;
		const raw = localStorage.getItem(key);
		console.log(raw, "rawrawrawrawrawrawrawraw");

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

	// 4) Build timerData only when ready

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
	}, [dataNew?.id]);

	// Submit
	const dataSubmit = async () => {
		reqSoketData();
		saveAnswer();
		const submitStatusCheck = await waitForAnswerProcessedQuestOnce();
		if (!submitStatusCheck) {
			connectSocket().then(() => {
				reqSoketData();
				saveAnswer();
				if (typeof window !== "undefined") {
					localStorage.setItem("currentId", `${task?.id}`);
				}
			});
		}

		// const existing = getSocket();
		// if (existing?.connected) {
		// 	reqSoketData();
		// 	await saveAnswer();
		// } else {
		// 	await connectSocket();
		// 	reqSoketData();
		// 	await saveAnswer();
		// }
	};

	const saveAnswer = async () => {
		try {
			const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

			const rankIndexList = ranked.map((_, i) => i + 1);
			const payload = {
				task_id: task?.id,
				completion_data: {
					start_time: currentTime,
					selected_option: ranked,
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

	const reqSoketData = () => {
		const rankIndexList = ranked.map((_, i) => i + 1);
		emitRankShortAndScaleSubmitTask({
			userId: `${userId}`,
			questionId: `${task?.id}`,
			userName: `${userId}`,
			questionTitle: `${task?.title}`,
			questionType: `${task?.task_type === "ranking"
				? "option_ranking"
				: "option_shorting"
				}`,
			selectedOption: ranked,
			optionType: `${task?.task_type === "ranking"
				? "option_ranking"
				: "option_shorting"
				}`,
		});
		setwatingData(false);
	};

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
	);

	const OPTIONS_ZONE_ID = "options-zone";
	const RANKING_ZONE_ID = "ranking-zone";
	const rankItemId = (pos: number) => `rank-item-${pos}`;
	const optItemId = (optIdx: number) => `opt-item-${optIdx}`;

	const onDragOver = (_evt: any) => { };

	const onDragEnd = (evt: DragEndEvent) => {
		const { active, over } = evt;
		if (!over) return;

		const optIdx: number | undefined = active.data?.current?.optIdx;
		if (optIdx === undefined) return;

		const overId = String(over.id);

		if (overId === OPTIONS_ZONE_ID || overId.startsWith("opt-item-")) {
			removeFromRanking(optIdx);
			return;
		}

		if (overId === RANKING_ZONE_ID) {
			if (!ranked.includes(optIdx)) addToRanking(optIdx);
			return;
		}

		if (overId.startsWith("rank-item-")) {
			const targetPos = parseInt(overId.replace("rank-item-", ""), 10);
			const currentPos = ranked.indexOf(optIdx);

			if (currentPos === -1) {
				const next = insertAt(ranked, optIdx, targetPos);
				setRanked(next);
				persistRedux(next);
			} else if (currentPos !== targetPos) {
				const next = moveItem(ranked, currentPos, targetPos);
				setRanked(next);
				persistRedux(next);
			}
			return;
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

	return (
		<div className=" overflow-auto flex flex-col justify-center items-center px-4">
			{watingData ? (
				<div className="max-w-3xl w-full space-y-6">
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

					<DndContext
						sensors={sensors}
						onDragOver={onDragOver}
						onDragEnd={onDragEnd}
					>
						<div className="space-y-3">
							<h3 className="font-semibold">Options</h3>

							<Droppable
								id={OPTIONS_ZONE_ID}
								className="grid md:grid-cols-2 gap-3 rounded-2xl"
							>
								{available.length > 0 ? (
									available.map((i) => (
										<DraggableOption
											key={optItemId(i)}
											id={optItemId(i)}
											from="options"
											optIdx={i}
											label={
												<button
													onClick={() =>
														addToRanking(i)
													}
													className="w-full text-left px-4 py-3 rounded-xl border bg-white hover:border-orange-400 transition"
													title="Click or drag into Your ranking"
												>
													{options[i]}
												</button>
											}
											className="w-full"
										/>
									))
								) : (
									<div className="text-sm text-gray-500">
										All options are ranked.
									</div>
								)}
							</Droppable>
						</div>

						<div className="space-y-3">
							<h3 className="font-semibold">Your ranking</h3>

							<Droppable
								id={RANKING_ZONE_ID}
								className="bg-[#e6e6e6] p-5 rounded-2xl min-h-[120px] flex flex-col gap-3"
							>
								{ranked.length === 0 ? (
									<h3 className="text-center text-gray-700">
										Click or drop options
									</h3>
								) : (
									ranked.map((optIdx, pos) => (
										<Droppable
											key={rankItemId(pos)}
											id={rankItemId(pos)}
										>
											<div className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between">
												<div className="flex items-center gap-3 w-full">
													<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold shrink-0">
														{pos + 1}
													</div>

													<DraggableOption
														id={`rank-draggable-${optIdx}`}
														from="ranking"
														optIdx={optIdx}
														label={
															<div className="text-gray-800">
																{
																	options[
																	optIdx
																	]
																}
															</div>
														}
														className="flex-1"
													/>
												</div>

												<div className="flex items-center gap-2 shrink-0 pl-3">
													<button
														onClick={() =>
															moveUp(pos)
														}
														className={clsx(
															"px-2 py-1 rounded-md border text-sm",
															pos === 0
																? "opacity-40 cursor-not-allowed"
																: "hover:border-orange-400"
														)}
														disabled={pos === 0}
														title="Move up"
													>
														▲
													</button>
													<button
														onClick={() =>
															moveDown(pos)
														}
														className={clsx(
															"px-2 py-1 rounded-md border text-sm",
															pos ===
																ranked.length -
																1
																? "opacity-40 cursor-not-allowed"
																: "hover:border-orange-400"
														)}
														disabled={
															pos ===
															ranked.length - 1
														}
														title="Move down"
													>
														▼
													</button>
												</div>
											</div>
										</Droppable>
									))
								)}
							</Droppable>

							{ranked.length > 0 && (
								<div className="text-sm text-gray-600">
									Ranking indices :{" "}
									<code>[{ranked.join(", ")}]</code>
								</div>
							)}
						</div>
					</DndContext>

					<div className="flex items-center justify-center py-2">
						<button
							onClick={dataSubmit}
							className="bg-primary px-4 py-2 rounded-lg text-white disabled:opacity-50"
							disabled={ranked.length === 0}
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

export default QuestChoiceComponent;
