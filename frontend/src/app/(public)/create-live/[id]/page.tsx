/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import HostLiveHeader from "../HostLiveHeader";
import HostLiveQuestionView from "../HostLiveQuestionView";
import HostLiveNavigationControls from "../HostLiveNavigationControls";
import HostLiveLeftSideBar from "../HostLiveLeftSideBar";
import { useDispatch, useSelector } from "react-redux";
import {
	nextSlide,
	prevSlide,
	setCurrentSlideIndex,
	setTotalSlides,
	setCurrentQsentId,
	forceEndLive,
} from "@/features/live/store/leaderboardSlice";
import QuestCompletedPages from "@/features/quest/components/QuestCompletedPages";
import { AxiosError } from "axios";
import { useSearchParams, useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";
import moment from "@/lib/dayjs";
import { setQuestData } from "@/features/quest/store/questQuestionTimeSlice";
import { Modal } from "@/components/ui";
import { useLiveSession } from "@/features/live/hooks/useLiveSession";
import {
	aggregatePayloadToResult,
	type LiveResultDatum,
} from "@/features/live/services/aggregateResults";
import { buildHostLiveViewModel } from "@/features/live/services/hostLiveViewModel";
import {
	changeQuestTask,
	changeQuizQuestion,
	endLiveSession,
} from "@/features/live/services/liveSessionApi";
import Leaderboard from "@/components/Dashboard/Leaderboard";
import type { SessionSnapshot, TimerState } from "@/features/live/types";
import { toast } from "react-toastify";

type Task = {
	[x: string]: any;
	id: number;
	title: string;
	task_type: string;
	open_datetime?: string;
	close_datetime?: string;
	created_at?: string;
	updated_at?: string;
	contant_title?: string;
	image_url?: string;
	layout_id?: string;
	description: string | null;
	serial_number: number;
	duration: number;
	quest_id: number;
	session_id: number;
	maxNumber?: number;
	minNumber?: number;
	quiztime_mode?: boolean;
	is_required: boolean;
	task_data: {
		questions?: { id: number | string; text: string; color?: string }[];
		time_limit?: number;
	};
};

type Quest = {
	id: number;
	title: string;
	tasks: Task[];
};

/* Map quiz question types -> viewer-understood task_type */
function mapQuizTypeToTaskType(qtype: string): string {
	switch (qtype) {
		// SINGLE CHOICE
		case "quiz_single_choice":
			return "single_choice";
		case "quiz_multiple_choice":
			return "multiple_choice";
		// MULTIPLE CHOICE
		case "multiple_choice":
			return "multiple_choice";
		case "true_false_choice":
			return "truefalse";
		case "truefalse":
			return "truefalse";
		case "sort_answer_choice":
			return "shortanswer";
		case "fill_in_the_blanks_choice":
			return "single_choice";
		case "wordcloud":
			return "wordcloud";
		case "scales":
			return "scales";
		case "ranking":
			return "ranking";
		case "longanswer":
			return "longanswer";
		case "sorting":
			return "sorting";
		case "quick_form":
			return "quick_form";
		case "single_choice":
			return "single_choice";
		case "shortanswer":
			return "shortanswer";
		case "content":
			return "content";
		default:
			return "";
	}
}

/* Normalize quizeData.questions -> Quest.tasks shape */
function normalizeQuize(quizeData: any): Quest {
	const quizSession =
		quizeData.questSession ??
		quizeData.quizSession ??
		quizeData.session ??
		quizeData.sessions?.[0] ??
		null;
	const tasks: Task[] = [...(quizeData.questions ?? [])]
		.map((q, idx): Task => {
			const colors = (q.options?.color ?? []).map(String);
			const rawChoices = (q.options?.choices ?? []).filter(
				(c: any) => c !== null && c !== undefined
			);
			const choices: string[] = rawChoices.map(String);
			return {
				id: q.id,
				quest_id: quizeData.id,
				session_id: quizSession?.id ?? 0,
				title: q.question_text,
				description: null,
				task_type: mapQuizTypeToTaskType(q.question_type),
				serial_number: q.serial_number ?? idx + 1,
				task_data: {
					questions: choices.map((text, i) => ({
						id: i + 1,
						text,
						color: colors[i],
					})),
					time_limit: q.time_limit_seconds ?? 0,
				},
				is_required: true,
				open_datetime: quizeData.open_datetime,
				close_datetime: quizeData.close_datetime,
				duration: quizeData.duration,
				quiztime_mode: quizeData.quiztime_mode,
			};
		})
		.sort((a, b) => (a.serial_number ?? 0) - (b.serial_number ?? 0));

	return { id: quizeData.id, title: quizeData.title, tasks };
}

function normalizeQuizeToQuest(quizeData: any): Quest {
	const tasks: Task[] = [...quizeData.tasks]
		.map((q, idx): Task => {
			return {
				id: q.id,
				quest_id: quizeData.id,
				session_id: quizeData.questSession?.id,
				title: q.title,
				description: null,
				task_type: mapQuizTypeToTaskType(q.task_type),
				serial_number: q.serial_number ?? idx + 1,
				task_data: {
					questions: q?.task_data?.questions,
					// time_limit: q.time_limit_seconds ? q.time_limit_seconds : q?.time_limit,
					time_limit: q?.task_data?.time_limit ?? 0,
				},
				is_required: true,
				open_datetime: quizeData.start_datetime,
				close_datetime: quizeData.end_datetime,
				duration: quizeData.duration || 0,
				quiztime_mode: quizeData.quiztime_mode || false,
				maxNumber: q?.task_data?.maxNumber,
				minNumber: q?.task_data?.minNumber,
				contant_title: q?.task_data?.contant_title,
				image_url: q?.task_data?.image_url?.path,
				layout_id: q?.task_data?.layout_id,
			};
		})
		.sort((a, b) => (a.serial_number ?? 0) - (b.serial_number ?? 0));
	return { id: quizeData.id, title: quizeData.title, tasks };
}

/* Guard against duplicate ids in results (your sample has id: 43 twice) */
function uniqueById<T extends { id: number }>(arr: T[]): T[] {
	const seen = new Set<number>();
	const out: T[] = [];
	// keep the LAST occurrence
	for (let i = arr.length - 1; i >= 0; i--) {
		const item = arr[i];
		if (!seen.has(item.id)) {
			out.unshift(item);
			seen.add(item.id);
		}
	}
	return out;
}

export default function LiveQuiz() {
	const [endModalOpen, setEndModalOpen] = useState(false);
	const [sessionId, setSessionId] = useState<number | null>(null);
	const [publicChannelKey, setPublicChannelKey] = useState<string | null>(
		null
	);

	const [isFullscreen, setIsFullscreen] = useState(false);
	const [chartType, setChartType] = useState<
		"bar" | "donut" | "dots" | "pie"
	>("bar");

	const [quest, setQuest] = useState<Quest | null>(null);
	const [results, setResults] = useState<LiveResultDatum[]>([]);
	const { scope } = useSelector(
		(state: any) => state.leaderboard
	);

	// const isLastQuestion =
	// 	currentSlideIndex === (quest?.tasks.length ?? 1) - 1;

	const searchParams = useSearchParams();
	const params = useParams();
	const quizeIdString = searchParams.get("qid");
	const sessionIdFromUrl = searchParams.get("sid");
	const publicChannelKeyFromUrl = searchParams.get("pck");

	const questId = `${quizeIdString}`;
	const joinlink = searchParams.get("jid");
	const questjoinlink = searchParams.get("jlk");
	const mode = String((params as any)?.id ?? "").toLowerCase(); // "quests" | "quize"
	const liveModule = mode === "quize" ? "quiz" : "quest";

	const dispatch = useDispatch();
	const {
		showLeaderboard,
		currentSlideIndex,
		totalSlides,
	} = useSelector((state: any) => state.leaderboard);
	// const llll = useSelector(
	// 	(state: any) => state.leaderboard
	// );

	const handleNextWithConfirm = async () => {
		if (!quest) return;

		const isLast = currentSlideIndex === quest.tasks.length - 1;

		if (isLast) {
			setEndModalOpen(true);
			return;
		}

		// normal next behaviour
		handleNext(); // or handleNextSlide()
	};

	const toggleFullscreen = () => {
		if (!isFullscreen)
			document.documentElement
				.requestFullscreen()
				.catch((e) => console.error("Fullscreen error:", e));
		else if (document.fullscreenElement) document.exitFullscreen();
	};

	const handleFullscreenChange = () =>
		setIsFullscreen(!!document.fullscreenElement);

	const activeSessionId = sessionId ?? sessionIdFromUrl;
	const {
		channelState,
		applySnapshot: applyLiveSnapshot,
	} = useLiveSession({
		module: liveModule,
		sessionId: activeSessionId,
		publicChannelKey: publicChannelKey ?? publicChannelKeyFromUrl,
		role: "host",
	});

	useEffect(() => {
		if (channelState.sessionStatus === "ended") {
			setEndModalOpen(false);
			dispatch(forceEndLive());
		}
	}, [channelState.sessionStatus, dispatch]);

	useEffect(() => {
		const currentItemId =
			liveModule === "quiz"
				? channelState.currentQuestionId
				: channelState.currentTaskId;
		if (!currentItemId) return;

		dispatch(
			setQuestData({
				questId,
				questionId: `${currentItemId}`,
				questiQsenStartTime:
					typeof channelState.timerState?.start_time === "string"
						? channelState.timerState.start_time
						: moment().format("MMMM Do YYYY, h:mm:ss"),
				questiQsenTime: `${
					channelState.timerState?.duration_seconds ??
					channelState.timerState?.remaining_seconds ??
					""
				}`,
				questiQsenLateStartTime: false,
			})
		);
	}, [
		channelState.currentQuestionId,
		channelState.currentTaskId,
		channelState.timerState,
		dispatch,
		liveModule,
		questId,
	]);

	useEffect(() => {
		if (channelState.sessionStatus === "ended") return;
		if (!quest) return;

		const currentItemId =
			liveModule === "quiz"
				? channelState.currentQuestionId
				: channelState.currentTaskId;
		if (!currentItemId) return;

		const nextIndex = quest.tasks.findIndex(
			(task) => Number(task.id) === Number(currentItemId)
		);

		if (nextIndex >= 0 && nextIndex !== currentSlideIndex) {
			dispatch(setCurrentSlideIndex(nextIndex));
		}
	}, [
		channelState.currentQuestionId,
		channelState.currentTaskId,
		channelState.sessionStatus,
		currentSlideIndex,
		dispatch,
		liveModule,
		quest,
	]);

	useEffect(() => {
		if (!channelState.answerAggregate || !quest) return;

		const itemId = Number(
			liveModule === "quiz"
				? channelState.answerAggregate.question_id ??
						channelState.answerAggregate.current_question_id
				: channelState.answerAggregate.task_id ??
						channelState.answerAggregate.current_task_id
		);
		const task = quest.tasks.find((item) => Number(item.id) === itemId);
		if (!task) return;

		const result = aggregatePayloadToResult(channelState.answerAggregate, task);
		if (!result) return;

		setResults((previous) =>
			uniqueById([
				...previous.filter((item) => Number((item as any).id) !== result.id),
				result,
			])
		);
	}, [channelState.answerAggregate, liveModule, quest]);

	// useEffect(() => {
	// 	if (showLeaderboard) {
	// 		dispatch(clearCache());

	// 		if (typeof window !== "undefined") {
	// 			sessionStorage.clear();
	// 		}
	// 		window.history.back();
	// 	}
	// }, []);

	useEffect(() => {
		if (typeof window !== "undefined" && !navigator.onLine) {
			console.warn("Offline — skipping API call");
			return;
		}

		const loadFromFile = async () => {
			try {
				// We do not *require* jlk for local data; it’s optional.
				if (mode === "quize") {
					const dataFetch = async () => {
						try {
							const response = await axiosInstance.get(
								`/quiz-attempts-url/show/${joinlink}`
							);

							const questData = response?.data?.data;
							const quizSession =
								questData?.quizSession ??
								questData?.session ??
								questData?.quiz?.sessions?.[0] ??
								null;
							const normalized = normalizeQuize({
								...questData?.quiz,
								questSession: quizSession,
							});
							setQuest(normalized);

							if (quizSession?.id) {
								setSessionId(quizSession.id);
							}
							setPublicChannelKey(
								quizSession?.public_channel_key ??
									questData?.public_channel_key ??
									publicChannelKeyFromUrl ??
									null
							);

						setResults([]);

							dispatch(
								setTotalSlides(normalized.tasks.length || 0)
							);
						} catch (error) {
							const axiosError = error as AxiosError<{
								message?: string;
							}>;
							console.error("Error verifying token:", axiosError);
						} finally {
						}
					};
					dataFetch();
				} else {
					const dataFetch = async () => {
						try {
							const response = await axiosInstance.get(
								`/quests/start-by-admin/${questjoinlink}`
							);

							const questData = response?.data?.data;

							const normalized = normalizeQuizeToQuest({
								...questData.quest,
								questSession: questData.questSession,
							});

							setQuest(normalized);
							setResults([]);
							setSessionId(questData.questSession.id);
							setPublicChannelKey(
								questData.questSession.public_channel_key ?? null
							);

							dispatch(
								setTotalSlides(normalized.tasks.length || 0)
							);
						} catch (error) {
							const axiosError = error as AxiosError<{
								message?: string;
							}>;
							console.error("Error verifying token:", axiosError);
						} finally {
						}
					};
					dataFetch();
				}
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				if (axiosError?.response) {
					console.error(
						"Error loading data:",
						axiosError.response.data?.message || "Load failed."
					);
				} else {
					console.error(
						"Unexpected error:",
						(error as Error).message
					);
				}
			}
		};
		loadFromFile();
	}, [mode, joinlink, questjoinlink]);

	// derive slides (tasks) + current task
	const tasks: Task[] = quest?.tasks ?? [];

	const currentTask: Task | null = tasks.length
		? tasks[Math.min(currentSlideIndex, tasks.length - 1)]
		: null;

	// map result by task id for quick lookup
	const resultByTaskId = useMemo(() => {
		const m = new Map<number, LiveResultDatum>();

		for (const r of results) m.set(r.id, r);
		return m;
	}, [results]);

	// compute view model
	const viewModel = useMemo(() => {
		if (!currentTask) return null;
		return buildHostLiveViewModel(
			currentTask,
			resultByTaskId.get(currentTask.id) ?? null
		);
	}, [currentTask, resultByTaskId]);

	// fullscreen listeners
	useEffect(() => {
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape" && document.fullscreenElement)
				document.exitFullscreen();
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenChange
			);
			document.removeEventListener("keydown", onEsc);
		};
	}, []);

	const timerStateForTask = (task: Task): TimerState => {
		const timeLimit = Number(task?.task_data?.time_limit ?? 0);
		const duration = Number.isFinite(timeLimit) ? timeLimit : 0;

		return {
			status: "running",
			start_time: moment().format("MMMM Do YYYY, h:mm:ss"),
			duration_seconds: duration,
			remaining_seconds: duration,
		};
	};

	const applyCommittedState = (
		liveState: SessionSnapshot,
		task: Task,
		index: number
	) => {
		applyLiveSnapshot(liveState);
		dispatch(
			setQuestData({
				questId,
				questionId: `${
					liveModule === "quiz"
						? liveState.current_question_id ?? task.id
						: liveState.current_task_id ?? task.id
				}`,
				questiQsenStartTime:
					typeof liveState.timer_state?.start_time === "string"
						? liveState.timer_state.start_time
						: moment().format("MMMM Do YYYY, h:mm:ss"),
				questiQsenTime: `${
					liveState.timer_state?.duration_seconds ??
					liveState.timer_state?.remaining_seconds ??
					task.task_data?.time_limit ??
					""
				}`,
				questiQsenLateStartTime: false,
			})
		);
		dispatch(setCurrentSlideIndex(index));
	};

	const changeLiveItem = async (task: Task, index: number) => {
		if (!activeSessionId) return;

		const timerState = timerStateForTask(task);
		const liveState =
			liveModule === "quiz"
				? await changeQuizQuestion(activeSessionId, task.id, timerState)
				: await changeQuestTask(activeSessionId, task.id, timerState);

		applyCommittedState(liveState, task, index);
	};

	const handleNext = async () => {
		if (!quest) return;
		const nextIndex = Math.min(
			currentSlideIndex + 1,
			(quest.tasks?.length ?? 1) - 1
		);
		const nextTask = quest.tasks[nextIndex];

		if (nextTask) {
			await changeLiveItem(nextTask, nextIndex);
			return;
		}

		dispatch(nextSlide());
	};

	const handleNextSlide = async () => {
		if (!quest) return;
		const currentTask = quest.tasks[currentSlideIndex];
		if (currentTask) dispatch(setCurrentQsentId(`${currentTask.id}`));
		await handleNext();
	};

	const handlePrev = async () => {
		if (!quest) return;
		const nextIndex = Math.max(currentSlideIndex - 1, 0);
		const nextTask = quest.tasks[nextIndex];

		if (nextTask) {
			await changeLiveItem(nextTask, nextIndex);
			return;
		}

		dispatch(prevSlide());
	};
	const endHostLive = async () => {
		if (!activeSessionId) {
			console.error("session_id missing");
			return;
		}
		try {
			await endLiveSession(liveModule, activeSessionId);

			setEndModalOpen(false);
			dispatch(forceEndLive());
		} catch (err) {
			console.error("Failed to end live", err);
			toast.error(`Failed to end ${liveModule === "quiz" ? "quiz" : "quest"} live session.`);
		}
	};

	return (
		<div
			className={`relative h-[100vh] ${
				isFullscreen
					? "fixed inset-0 bg-white z-50 p-4"
					: "min-h-screen flex flex-col bg-white p-4"
			}`}
		>
			<HostLiveHeader onClose={() => setEndModalOpen(true)} />
			{!showLeaderboard && (
				<div className="absolute top-50 left-[20px] z-999">
					<HostLiveLeftSideBar
						onChartTypeChange={(type) => setChartType(type)}
					/>
				</div>
			)}
			{showLeaderboard ? (
				mode === "quize" ? (
					<Leaderboard scope={scope} />
				) : (
					<QuestCompletedPages pagesStatus={"creator"} />
				)
			) : viewModel ? (
				<HostLiveQuestionView
					isFullscreen={isFullscreen}
					chartType={chartType}
					viewModel={viewModel}
				/>
			) : (
				<div className="flex-1 flex items-center justify-center text-gray-500">
					{totalSlides === 0 ? "Loading quiz..." : "No slide to show"}
				</div>
			)}

			{scope === "slide" ? (
				<HostLiveNavigationControls
					currentView={viewModel?.currentView || "choice"}
					isFullscreen={isFullscreen}
					onPrev={handlePrev}
					onNext={handleNextSlide}
					onToggleFullscreen={toggleFullscreen}
				/>
			) : (
				<>
					{!showLeaderboard && (
						<HostLiveNavigationControls
							currentView={viewModel?.currentView || "choice"}
							isFullscreen={isFullscreen}
							onPrev={handlePrev}
							onNext={handleNextWithConfirm}
							onToggleFullscreen={toggleFullscreen}
						/>
					)}
				</>
			)}
			<Modal
				title="End Live Session"
				open={endModalOpen}
				onClose={() => setEndModalOpen(false)}
				width={500}
			>
				<div className="space-y-3">
					<p className="text-gray-700 text-[15px] leading-relaxed">
						You are currently viewing the{" "}
						<span className="font-medium">last question</span> of
						this {mode === "quize" ? "quiz" : "quest"}.
					</p>

					<p className="text-gray-700 text-sm font-medium">
						Do you want to end this {mode === "quize" ? "quiz" : "quest"} now?
					</p>

					<div className="flex justify-end gap-3 pt-3">
						<button
							className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
							onClick={() => setEndModalOpen(false)}
						>
							Continue Quest
						</button>

						<button
							disabled={!activeSessionId}
							className={`px-4 py-2 rounded text-white transition
    							${
									!activeSessionId
										? "bg-gray-400 cursor-not-allowed"
										: "bg-red-600 hover:bg-red-700"
								}
  									`}
							onClick={endHostLive}
						>
							End {mode === "quize" ? "Quiz" : "Quest"}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
