/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
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
	setTotalSlides,
	clearCache,
	userQuizCompletedLastSlider,
	setCurrentQsentId,
} from "@/features/live/store/leaderboardSlice";
import QuestCompletedPages from "@/features/quest/components/QuestCompletedPages";
import { AxiosError } from "axios";
import { useSearchParams, useParams } from "next/navigation";

import axiosInstance from "@/utils/axiosInstance";
import {
	emitChangeQuestion,
	answerSubmittedToCreator,
	connectSocket as quizconnectSocket,
	submitCompleteQuiz,
	userQuizCompleted,
	userQuizCompletedAll,
	waitForQuestionChangedQuizAll,
	waitForQuestionChangedQuizSingle,
	setCurrentQuiz,
	emitQuizStart,
	emitEndQuiz,
} from "@/socket/socket";
import {
	answerSubmittedToQuestCreator,
	connectSocket as questconnectSocket,
	getSocket,
	// emitJoinQuest,
	waitForRankingScoresAnswerProcessedQuestOnce22,
	// emitCreateQuest,
	// waitForQuestCreatedOnce,
	emitEndQuest,
	emitStartQuest,
	waitForQuestStartedOnce,
	waitForQuestionChangedQuestSingle,
	setCurrentQuest,
	waitForQuestionChangedQuestAll,
} from "@/socket/quest-socket";

// import { RootState } from "@/services/redux/store";
import {
	emitChangeQuestionQuest,
	emitCompleteQuest,
	waitForQuestCompletedAll,
} from "@/socket/quest-socket";
import moment from "@/lib/dayjs";
import { setQuestData } from "@/features/quest/store/questQuestionTimeSlice";
import { Modal } from "@/components/ui";

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

type ResultDatum =
	| { quest_id: number; task_type: string; id: number; number: number[] }
	| { quest_id: number; task_type: string; id: number; text: string[] };

type RawData = {
	questId: any;
	quizId: string;
	questionId: number;
	question_type: string;
	optionSelections?: Record<string, { count: number }>;
	textAnswers?: Record<string, string[]>;
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

const TYPE_MAP: Record<string, string> = {
	quiz_single_choice: "single_choice",
	single_choice: "single_choice",
	quiz_multiple_choice: "multiple_choice",
	multiple_choice: "multiple_choice",
	sort_answer_choice: "sorting",
	true_false_choice: "truefalse",
	fill_in_the_blanks_choice: "fill_in_the_blanks_choice",
	// others (e.g., true_false_choice) will pass through unchanged
};

function transformData(data: RawData) {
	console.log(data, "666666666");

	const mappedType = TYPE_MAP[data.question_type] ?? data.question_type;

	if (
		data.question_type === "shortanswer" ||
		data.question_type === "sort_answer_choice" ||
		data.question_type === "wordcloud" ||
		data.question_type === "longanswer"
	) {
		return {
			quest_id: Number(data.quizId) || Number(data.questId),
			task_type: mappedType,
			id: data.questionId,
			text: Object.values(data.textAnswers ?? {}).flat(),
		};
	}

	// Build number[] dynamically from 0..maxKey, filling gaps with 0
	const optionKeys = Object.keys(data.optionSelections ?? {}).map(Number);
	const maxIndex = optionKeys.length ? Math.max(...optionKeys) : 0;

	const numberArray = Array.from({ length: maxIndex + 1 }, (_, i) => {
		return data.optionSelections?.[String(i)]?.count ?? 0;
	});

	return {
		quest_id: Number(data.quizId) || Number(data.questId),
		task_type: mappedType,
		id: data.questionId,
		number: numberArray,
	};
}

/* Normalize quizeData.questions -> Quest.tasks shape */
function normalizeQuize(quizeData: any): Quest {
	const tasks: Task[] = [...quizeData.questions]
		.map((q, idx): Task => {
			const colors = (q.options?.color ?? []).map(String);
			const rawChoices = (q.options?.choices ?? []).filter(
				(c: any) => c !== null && c !== undefined
			);
			const choices: string[] = rawChoices.map(String);
			return {
				id: q.id,
				quest_id: quizeData.id,
				session_id: quizeData.questSession.id,
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
			console.log(q, "qqqqqqqqqq");
			console.log(mapQuizTypeToTaskType(q.task_type), "qqqqqqqqqq");

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
	console.log(tasks, "qqqqqqqqqq");
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
	const existing = getSocket();
	const [endModalOpen, setEndModalOpen] = useState(false);
	const [sessionId, setSessionId] = useState<number | null>(null);

	const [isFullscreen, setIsFullscreen] = useState(false);
	const [chartType, setChartType] = useState<
		"bar" | "donut" | "dots" | "pie"
	>("bar");

	const [quest, setQuest] = useState<Quest | null>(null);
	const [results, setResults] = useState<ResultDatum[]>([]);
	const [quizresultsData, setQuizresultsData] = useState<ResultDatum[]>([]);
	const [questresultsData, setQuestresultsData] = useState<ResultDatum[]>([]);

	const [questRankinddataData, setQuestRankinddataData] = useState<any>([]);
	const { scope, leaderboard_slider } = useSelector(
		(state: any) => state.leaderboard
	);
	const dddd = useSelector((state: any) => state.leaderboard);
	console.log(dddd, "listDatalistDatalistDatalistDatalistData");

	// const isLastQuestion =
	// 	currentSlideIndex === (quest?.tasks.length ?? 1) - 1;

	const searchParams = useSearchParams();
	const params = useParams();
	const quizeIdString = searchParams.get("qid");

	const questId = `${quizeIdString}`;
	const joinlink = searchParams.get("jid");
	const questjoinlink = searchParams.get("jlk");
	const mode = String((params as any)?.id ?? "").toLowerCase(); // "quests" | "quize"

	const dispatch = useDispatch();
	const {
		lastSlideReached,
		showLeaderboard,
		currentSlideIndex,
		totalSlides,
	} = useSelector((state: any) => state.leaderboard);
	// const llll = useSelector(
	// 	(state: any) => state.leaderboard
	// );

	const handleQuizCompletion = (payload: any) => {
		// Your existing code...
		console.log("000000000", payload);
		dispatch(userQuizCompletedLastSlider());
	};

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

	const user = useSelector((state: any) => state.auth.user) as any;
	const userId = `${user?.id}`;
	const userName = `${user?.full_name}`;

	const toggleFullscreen = () => {
		if (!isFullscreen)
			document.documentElement
				.requestFullscreen()
				.catch((e) => console.error("Fullscreen error:", e));
		else if (document.fullscreenElement) document.exitFullscreen();
	};

	const handleFullscreenChange = () =>
		setIsFullscreen(!!document.fullscreenElement);

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

							const normalized = normalizeQuize(
								response?.data?.data?.quiz
							);
							const questData = response?.data?.data;
							setQuest(normalized);

							setSessionId(questData.questSession.id);
							console.log(
								"SESSION ID SET:",
								questData.questSession.id
							);

							const unique = uniqueById(
								quizresultsData as unknown as ResultDatum[]
							);
							setResults(unique);

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
							const unique = uniqueById(
								questresultsData as unknown as ResultDatum[]
							);
							setResults(unique);
							setSessionId(questData.questSession.id);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, joinlink, questjoinlink]);

	// derive slides (tasks) + current task
	const tasks: Task[] = quest?.tasks ?? [];
	console.log(quest, "questquestquestquestquest");

	const currentTask: Task | null = tasks.length
		? tasks[Math.min(currentSlideIndex, tasks.length - 1)]
		: null;

	// map result by task id for quick lookup
	console.log(results, "resresresres");
	const resultByTaskId = useMemo(() => {
		const m = new Map<number, ResultDatum>();

		for (const r of results) m.set((r as any).id, r);
		return m;
	}, [results]);
	const roundInts = (obj: Record<string, number>) =>
		Object.fromEntries(
			Object.entries(obj).map(([k, v]) => [k, Math.round(v)])
		);

	function getScoresIfMatch(mydata: any, taskdata: any) {
		if (!taskdata) return null;
		if (`${mydata.questionId}` === `${taskdata.id}`) {
			return roundInts(mydata.percentageScores);
		}

		const length = taskdata?.task_data?.questions?.length || 0;
		const fallback: Record<number, number> = {};
		for (let i = 0; i < length; i++) {
			fallback[i] = 0;
		}
		return fallback;
	}

	// compute view model
	const viewModel = useMemo(() => {
		if (!currentTask) return null;
		const res: any = resultByTaskId.get(currentTask.id);

		const categories2222 = (currentTask.task_data?.questions || []).map(
			(q) => q.text
		);
		const categoryColor = (currentTask.task_data?.questions || []).map(
			(q) => q.color
		);
		console.log(currentTask, "resresresres 222");
		console.log(categories2222, "resresresres 222");
		console.log(res, "resresresres 222");

		const taskType = currentTask.task_type.toLowerCase();
		const title = currentTask.title || "Untitled";
		const id = currentTask.id || "";
		const quest_id = currentTask.quest_id || "";
		const serial_number = currentTask.serial_number || "";
		const scores = getScoresIfMatch(questRankinddataData, currentTask);

		if (
			[
				"wordcloud",
				"scales",
				"sorting",
				"ranking",
				"truefalse",
				"single_choice",
				"multiple_choice",
				"shortanswer",
				"longanswer",
				"sort_answer_choice",
			].includes(taskType)
		) {
			const phrases = res && "text" in res ? res.text : [];
			return {
				currentView: `${currentTask.task_type}` as const,
				title,
				categories: categories2222 as string[],
				color: categoryColor as string[],
				data:
					`${currentTask.task_type}` === "ranking" && scores !== null
						? scores
						: `${currentTask.task_type}` === "sorting" &&
						  scores !== null
						? scores
						: `${currentTask.task_type}` === "scales" &&
						  scores !== null
						? scores
						: res,
				phrases,
				id,
				quest_id,
				serial_number,
			};
		}

		// Otherwise numeric charts (use res.number)
		const categories = (currentTask.task_data?.questions || []).map(
			(q) => q.text
		);
		const series =
			res && "number" in res
				? res?.number
				: new Array(categories.length).fill(0);

		return {
			currentView: `${currentTask.task_type}` as const,
			title,
			categories,
			data: series,
			phrases: res?.text,
		};
	}, [currentTask, resultByTaskId, questRankinddataData, currentTask]);

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

	useEffect(() => {
		if (mode === "quize") {
			quizconnectSocket().then(async (s) => {
				console.log(s);

				answerSubmittedToCreator((payload) => {
					const quizresultsData2 = [transformData(payload)];
					const unique = uniqueById(
						quizresultsData2 as unknown as ResultDatum[]
					);
					setResults(unique);
					setQuizresultsData(quizresultsData2);
				});
				if (lastSlideReached && scope !== "slide") {
					submitCompleteQuiz({
						quizId: `${quest?.id}`,
						userid: userId,
						quizTitle: quest?.title,
						userName: userName,
					});
					await emitEndQuiz({
						quizId: `${quest?.id}`,
						quizTitle: quest?.title,
					});

					userQuizCompleted((payload) => {
						console.log("000000000", payload);
						handleQuizCompletion(payload);
					});
					userQuizCompletedAll((payload) => {
						handleQuizCompletion(payload);
						console.log("000000000", payload);
					});

					setCurrentQuiz(null);
				}
			});
		} else {
			questconnectSocket().then(async () => {
				answerSubmittedToQuestCreator((payload) => {
					console.log(
						"✅ Answer submitted to creator: 000000000",
						payload
					);
					console.log(payload, "quizresultsData2");
					const quizresultsData2 = [transformData(payload)];
					console.log(quizresultsData2, "quizresultsData2");

					const unique = uniqueById(
						quizresultsData2 as unknown as ResultDatum[]
					);
					setResults(unique);

					setQuestresultsData(quizresultsData2);
					console.log(
						quizresultsData2,
						"✅ Answer submitted to creator: 000000000"
					);
				});
				waitForRankingScoresAnswerProcessedQuestOnce22((payload) => {
					setQuestRankinddataData(payload);
					console.log(
						"✅ Answer submitted to creator: 000000000",
						payload
					);
				});

				if (showLeaderboard) {
					emitCompleteQuest({
						questId: `${quest?.id}`,
						userId: userId,
						questTitle: quest?.title,
						userName: userName,
					});
					await emitEndQuest({
						questId: `${quest?.id}`,
						questTitle: quest?.title,
					});
					setCurrentQuest(null);
				}
				waitForQuestCompletedAll(() => {
					// sessionStorage.removeItem("userSession");
				});
			});
		}
	}, [quest?.id, userId, userName, showLeaderboard]);

	useEffect(() => {
		quizconnectSocket().then(async (s) => {
			console.log(s);

			answerSubmittedToCreator((payload) => {
				const quizresultsData2 = [transformData(payload)];
				const unique = uniqueById(
					quizresultsData2 as unknown as ResultDatum[]
				);
				setResults(unique);
				setQuizresultsData(quizresultsData2);
			});

			// if (showLeaderboard) {
			// 	submitCompleteQuiz({
			// 		quizId: quest?.id,
			// 		userid: userId,
			// 		quizTitle: quest?.title,
			// 		userName: userName,
			// 	});
			// }
			// console.log(|| lastSlideReached && leaderboard_slider);

			if (lastSlideReached === true && leaderboard_slider === true) {
				submitCompleteQuiz({
					quizId: `${quest?.id}`,
					userid: userId,
					quizTitle: quest?.title,
					userName: userName,
				});
				await emitEndQuiz({
					quizId: `${quest?.id}`,
					quizTitle: quest?.title,
				});

				userQuizCompleted((payload) => {
					console.log("000000000", payload);
				});
				userQuizCompletedAll((payload) => {
					console.log("000000000", payload);
				});

				setCurrentQuiz(null);
			}
		});
	}, [quest?.id, lastSlideReached, leaderboard_slider]);

	console.log(lastSlideReached && leaderboard_slider);

	const handleNext = async () => {
		if (!quest) return;
		const nextIndex = Math.min(
			currentSlideIndex + 1,
			(quest.tasks?.length ?? 1) - 1
		);
		const nextTask = quest.tasks[nextIndex];
		const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");
		if (nextTask) {
			if (mode === "quize") {
				console.log(
					leaderboard_slider,
					"leaderboard_sliderleaderboard_sliderleaderboard_slider"
				);

				const changedPromise = waitForQuestionChangedQuizSingle();

				emitChangeQuestion({
					quizId: quest?.id,
					questionId: nextTask?.id,
					quizTitle: "quest.title",
					questionTitle: "nextTask?.title",
					quizQsenStartTime: `${currentTime}`,
					quizQsenTime: `${nextTask?.task_data?.time_limit}`,
					quizQsenLateStartTime: false,
				});

				waitForQuestionChangedQuizAll((payload) => {
					console.log("Question Changed:", payload);
					dispatch(
						setQuestData({
							questId: `${payload?.quizId}`,
							questionId: `${payload?.questionId}`,
							questiQsenStartTime: `${payload?.quizQsenStartTime}`,
							questiQsenTime: `${payload?.quizQsenTime}`,
							questiQsenLateStartTime: false,
						})
					);

					if (typeof window === "undefined") return;

					const userJoinData: any = {
						questId: `${payload?.quizId}`,
						questionId: `${payload?.questionId}`,
						questiQsenStartTime: `${payload?.quizQsenStartTime}`,
						questiQsenTime: `${payload?.quizQsenTime}`,
						questiQsenLateStartTime: false,
					};

					localStorage.setItem(
						"userTimeSet",
						JSON.stringify(userJoinData)
					);
				});

				const changeQsen = await changedPromise;
				console.log(changeQsen, "changeQsen");

				if (!changeQsen) {
					setCurrentQuiz({
						quizId: quest.id,
						userId,
						quizTitle: quest.title,
						userName,
						isCreator: true,
					});

					await quizconnectSocket();

					const started = await waitForQuestStartedOnce();

					await emitQuizStart({
						quizId: quest?.id,
						userId,
						userName,
						quizTitle: quest.title,
					});

					const joined = await started;

					if (joined) {
						await emitChangeQuestion({
							quizId: quest.id,
							questionId: nextTask.id,
							quizTitle: quest.title,
							questionTitle: nextTask.title,
							quizQsenStartTime: `${currentTime}`,
							quizQsenTime: `${nextTask?.task_data?.time_limit}`,
							quizQsenLateStartTime: false,
						});
					}
				}
			} else {
				const changedPromise = waitForQuestionChangedQuestSingle();

				await emitChangeQuestionQuest({
					questId: quest.id,
					questionId: nextTask?.id,
					questTitle: "quest.title",
					questionTitle: "nextTask?.title",
					questiQsenStartTime: `${currentTime}`,
					questiQsenTime: `${nextTask?.task_data?.time_limit}`,
					questiQsenLateStartTime: false,
				});
				waitForQuestionChangedQuestAll((payload) => {
					console.log("Question Changed:", payload);
					dispatch(
						setQuestData({
							questId: `${payload?.questId}`,
							questionId: `${payload?.questionId}`,
							questiQsenStartTime: `${payload?.questiQsenStartTime}`,
							questiQsenTime: `${payload?.questiQsenTime}`,
							questiQsenLateStartTime: false,
						})
					);
					if (typeof window === "undefined") return;
					const userJoinData: any = {
						questId: `${payload?.questId}`,
						questionId: `${payload?.questionId}`,
						questiQsenStartTime: `${payload?.questiQsenStartTime}`,
						questiQsenTime: `${payload?.questiQsenTime}`,
						questiQsenLateStartTime: false,
					};
					localStorage.setItem(
						"userTimeSet",
						JSON.stringify(userJoinData)
					);
				});

				const changeQsen = await changedPromise;
				console.log(changeQsen, "changeQsen");

				if (!changeQsen) {
					setCurrentQuest({
						questId: quest.id,
						userId,
						questTitle: quest.title,
						userName,
						isCreator: true,
					});
					await questconnectSocket();

					const started = await waitForQuestStartedOnce();
					await emitStartQuest({
						questId,
						userId,
						userName,
						questTitle: quest.title,
					});
					const joined = await started;
					if (joined) {
						await emitChangeQuestionQuest({
							questId: quest.id,
							questionId: nextTask.id,
							questTitle: quest.title,
							questionTitle: nextTask.title,
							questiQsenStartTime: `${currentTime}`,
							questiQsenTime: `${nextTask?.task_data?.time_limit}`,
							questiQsenLateStartTime: false,
						});
					}
				}
			}
		}
		dispatch(nextSlide());
	};
	const handleNextSlide = async () => {
		if (!quest) return;
		const nextIndex = Math.min(
			currentSlideIndex + 1,
			(quest.tasks?.length ?? 1) - 1
		);
		const nextTask = quest.tasks[nextIndex];
		const currentTask = quest.tasks[currentSlideIndex];
		dispatch(setCurrentQsentId(`${currentTask.id}`));

		console.log(quest.tasks, "99999999999999999");
		console.log(currentTask.id, "99999999999999999");

		const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");
		if (nextTask) {
			console.log(leaderboard_slider, "leaderboard_slider");
			if (scope === "slide" && leaderboard_slider !== false) {
				console.log(leaderboard_slider, "leaderboard_slider 2");

				const changedPromise = waitForQuestionChangedQuizSingle();

				emitChangeQuestion({
					quizId: quest?.id,
					questionId: nextTask?.id,
					quizTitle: "quest.title",
					questionTitle: "nextTask?.title",
					quizQsenStartTime: `${currentTime}`,
					quizQsenTime: `${nextTask?.task_data?.time_limit}`,
					quizQsenLateStartTime: false,
				});

				waitForQuestionChangedQuizAll((payload) => {
					console.log("Question Changed:", payload);
					dispatch(
						setQuestData({
							questId: `${payload?.quizId}`,
							questionId: `${payload?.questionId}`,
							questiQsenStartTime: `${payload?.quizQsenStartTime}`,
							questiQsenTime: `${payload?.quizQsenTime}`,
							questiQsenLateStartTime: false,
						})
					);

					if (typeof window === "undefined") return;

					const userJoinData: any = {
						questId: `${payload?.quizId}`,
						questionId: `${payload?.questionId}`,
						questiQsenStartTime: `${payload?.quizQsenStartTime}`,
						questiQsenTime: `${payload?.quizQsenTime}`,
						questiQsenLateStartTime: false,
					};

					localStorage.setItem(
						"userTimeSet",
						JSON.stringify(userJoinData)
					);
				});

				const changeQsen = await changedPromise;
				console.log(changeQsen, "changeQsen");

				if (!changeQsen) {
					setCurrentQuiz({
						quizId: quest.id,
						userId,
						quizTitle: quest.title,
						userName,
						isCreator: true,
					});

					await quizconnectSocket();

					const started = waitForQuestStartedOnce();

					await emitQuizStart({
						quizId: quest?.id,
						userId,
						userName,
						quizTitle: quest.title,
					});

					const joined = await started;

					if (joined) {
						await emitChangeQuestion({
							quizId: quest.id,
							questionId: nextTask.id,
							quizTitle: quest.title,
							questionTitle: nextTask.title,
							quizQsenStartTime: `${currentTime}`,
							quizQsenTime: `${nextTask?.task_data?.time_limit}`,
							quizQsenLateStartTime: false,
						});
					}
				}
			}
		}
		dispatch(nextSlide());
	};

	const handlePrev = async () => {
		if (!quest) return;
		const nextIndex = Math.min(
			currentSlideIndex - 1,
			(quest.tasks?.length ?? 1) - 1
		);
		const nextTask = quest.tasks[nextIndex];
		const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");
		if (nextTask) {
			if (mode === "quize") {
				emitChangeQuestion({
					quizId: quest?.id,
					questionId: nextTask?.id,
					quizTitle: "quest.title",
					questionTitle: "nextTask?.title",
					quizQsenStartTime: `${currentTime}`,
					quizQsenTime: `${nextTask?.task_data?.time_limit}`,
					quizQsenLateStartTime: false,
				});
				// waitForQuestionChangedQuizAll
				waitForQuestionChangedQuizAll((payload) => {
					console.log("Question Changed:", payload);
					dispatch(
						setQuestData({
							questId: `${payload?.quizId}`,
							questionId: `${payload?.questionId}`,
							questiQsenStartTime: `${payload?.quizQsenStartTime}`,
							questiQsenTime: `${payload?.quizQsenTime}`,
							questiQsenLateStartTime: false,
						})
					);
					if (typeof window === "undefined") return;
					const userJoinData: any = {
						questId: `${payload?.quizId}`,
						questionId: `${payload?.questionId}`,
						questiQsenStartTime: `${payload?.quizQsenStartTime}`,
						questiQsenTime: `${payload?.quizQsenTime}`,
						questiQsenLateStartTime: false,
					};
					localStorage.setItem(
						"userTimeSet",
						JSON.stringify(userJoinData)
					);
				});
			} else {
				// THIS IS QUEST AREA
				if (existing?.connected) {
					await emitChangeQuestionQuest({
						questId: quest.id,
						questionId: nextTask?.id,
						questTitle: "quest.title",
						questionTitle: "nextTask?.title",

						questiQsenStartTime: `${currentTime}`,
						questiQsenTime: `${nextTask?.task_data?.time_limit}`,
						questiQsenLateStartTime: false,
					});
					waitForQuestionChangedQuestAll((payload) => {
						console.log("Question Changed:", payload);
						dispatch(
							setQuestData({
								questId: `${payload?.questId}`,
								questionId: `${payload?.questionId}`,
								questiQsenStartTime: `${payload?.questiQsenStartTime}`,
								questiQsenTime: `${payload?.questiQsenTime}`,
								questiQsenLateStartTime: false,
							})
						);
						if (typeof window === "undefined") return;
						const userJoinData: any = {
							questId: `${payload?.questId}`,
							questionId: `${payload?.questionId}`,
							questiQsenStartTime: `${payload?.questiQsenStartTime}`,
							questiQsenTime: `${payload?.questiQsenTime}`,
							questiQsenLateStartTime: false,
						};
						localStorage.setItem(
							"userTimeSet",
							JSON.stringify(userJoinData)
						);
					});
				} else {
					questconnectSocket().then(async () => {
						const questTitle =
							`${viewModel?.title}` || "Quest Title";
						const currentTime =
							moment().format("MMMM Do YYYY, h:mm");
						await emitStartQuest({
							questId,
							userId,
							userName,
							questTitle,
						});
						const joined = await waitForQuestStartedOnce();
						if (joined) {
							await emitChangeQuestionQuest({
								questId: quest.id,
								questionId: nextTask?.id,
								questTitle: "quest.title",
								questionTitle: "nextTask?.title",

								questiQsenStartTime: `${currentTime}`,
								questiQsenTime: `${nextTask?.task_data?.time_limit}`,
								questiQsenLateStartTime: false,
							});
							// 		waitForQuestionChangedQuestAll((payload) => {
							// 			console.log("Question Changed:", payload);
							// 			dispatch(
							// 				setQuestData({
							// 					questId: `${payload?.questId}`,
							// questionId: `${payload?.questionId}`,
							// questiQsenStartTime: `${payload?.questiQsenStartTime}`,
							// questiQsenTime: `${payload?.questiQsenTime}`,
							// questiQsenLateStartTime: false,
							// 				})
							// 			);
							// 		});
						}
					});
				}
			}
		}
		dispatch(prevSlide());
	};

	const questJoin = async () => {
		questconnectSocket().then(async () => {
			const questTitle = `${viewModel?.title}` || "Quest Title";
			await emitStartQuest({
				questId,
				userId,
				userName,
				questTitle,
			});
		});
	};

	useEffect(() => {
		if (mode === "quests") {
			questJoin();
		}
	}, []);

	// setInterval(() => {
	// 	if (existing?.connected) {
	// 	} else {
	// 		questJoin()
	// 	}
	// }, 3000);

	useEffect(() => {
		if (mode === "quize") {
			console.log("quiz data");
		}
	}, []);
	const endHostLive = async () => {
		if (!sessionId) {
			console.error("session_id missing");
			return;
		}
		try {
			await axiosInstance.post(`/quests/end-host-live/${sessionId}`, {
				end_datetime: moment().toISOString(),
			});

			// QUIZ
			if (mode === "quize") {
				await emitEndQuiz({
					quizId: `${quest?.id}`,
					quizTitle: quest?.title,
				});
			}

			// QUEST
			if (mode === "quests") {
				await emitEndQuest({
					questId: `${quest?.id}`,
					questTitle: quest?.title,
				});
			}

			setEndModalOpen(false);
			dispatch(userQuizCompletedLastSlider()); // leaderboard trigger
		} catch (err) {
			console.error("Failed to end live", err);
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
			<HostLiveHeader
				onClose={() => console.log("Close button clicked")}
			/>
			{!showLeaderboard && (
				<div className="absolute top-50 left-[20px] z-999">
					<HostLiveLeftSideBar
						onChartTypeChange={(type) => setChartType(type)}
					/>
				</div>
			)}
			{showLeaderboard ? (
				<QuestCompletedPages pagesStatus={"creator"} />
			) : viewModel ? (
				<HostLiveQuestionView
					currentView={viewModel.currentView}
					isFullscreen={isFullscreen}
					data={viewModel.data}
					categories={viewModel.categories}
					colors={viewModel.color}
					chartType={chartType}
					title={viewModel.title}
					phrases={viewModel.phrases}
					currentTask={currentTask}
					totalDatat={viewModel}
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
						this quest.
					</p>

					<p className="text-gray-700 text-sm font-medium">
						Do you want to end this quest now?
					</p>

					<div className="flex justify-end gap-3 pt-3">
						<button
							className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
							onClick={() => setEndModalOpen(false)}
						>
							Continue Quest
						</button>

						<button
							disabled={!sessionId}
							className={`px-4 py-2 rounded text-white transition
    							${
									!sessionId
										? "bg-gray-400 cursor-not-allowed"
										: "bg-red-600 hover:bg-red-700"
								}
  									`}
							onClick={endHostLive}
						>
							End Quest
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
