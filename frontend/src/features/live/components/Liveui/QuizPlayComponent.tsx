/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QuizLiveFooter from "@/components/Layouts/quiz/QuizLiveFooter";
import ChoiceComponent from "./ChoiceComponent";
import ShortAnswerComponent from "./ShortAnswerComponent";
import QuickFormPreview from "./QuickFormPreview";
import WaitingRoomComponentQuiz from "./WaitingRoomComponentQuiz";
import Leaderboard from "@/components/Dashboard/Leaderboard";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import {
	connectSocket,
	// userQuizCompleted,
	userQuizCompletedAll,
	waitForQuestCompletedAll,
	// waitForQuestionChangedAll,
	waitForQuestionChangedQuizAll,
	waitForQuizEndedAll,
	waitForQuizJoinedOnce,
	// waitForQuizJoineOnce
} from "@/socket/socket";
// import axiosInstance from "@/utils/axiosInstance";
import { cacheJoin, getCachedJoin } from "@/socket/quest-socket";
import moment from "@/lib/dayjs";
import { useDispatch, useSelector } from "react-redux";
import { setQuestData } from "@/features/quest/store/questQuestionTimeSlice";
import axiosInstance from "@/utils/axiosInstance";

export type TaskType =
	| "wordcloud"
	| "scales"
	| "longanswer"
	| "ranking"
	| "shortanswer"
	| string;

export interface TaskItem {
	id: number;
	quest_id: number;
	title: string;
	description?: string | null;
	task_type?: string; // legacy
	question_type?: string; // current
	serial_number: number;
	is_required?: boolean;
	created_at?: string;
	updated_at?: string;
	questions?: any[];
}

const UnsupportedComponent: React.FC<{ task: TaskItem }> = ({ task }) => (
	<div className="max-w-xl mx-auto space-y-3">
		<h3 className="text-2xl font-semibold text-gray-900 text-center">
			Unsupported task type
		</h3>
		<p className="text-center text-sm text-gray-500">
			Type: {task.task_type}
		</p>
		<p className="text-center text-sm text-gray-500">ID: {task.id}</p>
		<p className="text-center text-base">{task.title}</p>
	</div>
);

const componentForTaskType = (
	t: string
): React.ElementType<{ task: TaskItem }> => {
	const key = (t || "").toLowerCase();

	// single/multiple choice styles
	if (
		key === "single_choice" ||
		key === "quiz_single_choice" ||
		key === "multiple_choice" ||
		key === "quiz_multiple_choice" ||
		key === "scales" ||
		key === "ranking" ||
		key === "fill_in_the_blanks_choice" ||
		key === "sorting"
	)
		return ChoiceComponent;

	// true/false
	if (key === "truefalse" || key === "true_false_choice")
		return ChoiceComponent;
	if (key === "quick_form") return QuickFormPreview;

	// short/long answer, wordcloud, fill-in-the-blanks, sorting/free text types
	if (
		key === "shortanswer" ||
		key === "longanswer" ||
		key === "wordcloud" ||
		key === "sort_answer_choice"
	)
		return ShortAnswerComponent;

	return UnsupportedComponent;
};

export interface NavigatorProps {
	tasks: TaskItem[];
}

const TaskNavigator: React.FC<NavigatorProps> = ({ tasks }) => {
	// socket-driven states (use your names, just typed better)
	const router = useRouter();

	const dispatch = useDispatch();

	const [questions, setQuestions] = useState<string>("");
	const [currentQuestion, setCurrentQuestion] = useState<string>("");
	const [questionsId, setQuestionsId] = useState<number | null>(null);
	const [liderBoardShow, setLiderBoardShow] = useState<boolean>(false);

	const searchParams = useSearchParams();
	const attempId = searchParams.get("aid");
	const sessionId = searchParams.get("sid");
	const quizId = searchParams.get("qid");

	const { showLeaderboard } = useSelector((state: any) => state.leaderboard);
	console.log(showLeaderboard, "ddddddddddddddddddddddddd");
	const ordered = useMemo(
		() =>
			[...tasks].sort(
				(a, b) => a.serial_number - b.serial_number || a.id - b.id
			),
		[tasks]
	);

	console.log(tasks, "taskstaskstaskstaskstasks");
	console.log(questionsId, "taskstaskstaskstaskstasks");

	const steps = useMemo(
		() => [{ id: -1 }, ...ordered.map((t) => ({ id: t.id }))],
		[ordered]
	);

	// Start at Waiting Room
	const [idx, setIdx] = useState(0);

	// const currentIsWaiting = steps[idx].id === -1;
	const currentIsWaiting = steps[idx].id === -1;
	const currentTask = currentIsWaiting
		? undefined
		: ordered.find((t) => t.id === steps[idx].id)!;

	console.log(currentTask, "taskstaskstaskstaskstasks");
	console.log(currentIsWaiting, "taskstaskstaskstaskstasks");

	const saveQuestionDataToStorage = (
		currentQ: string,
		questionsData: string,
		qId: number | null
	) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("quiz_currentQuestion", currentQ);
			localStorage.setItem("quiz_questions", questionsData);
			localStorage.setItem("quiz_questionsId", qId?.toString() || "");
		}
	};

	const handleLeaveQuiz = async () => {
		try {
			// await emitLeaveQuiz({
			// 	quizId,
			// 	userId,
			// 	quizTitle,
			// 	userName,
			// });
			// setCurrentQuest(null);
			const keys = Object.keys(localStorage);
			keys.forEach((key) => {
				if (key.startsWith("attempt-")) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.error("Error leaving quiz:", error);
		}
	};

	const clearQuestionDataFromStorage = () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("quiz_currentQuestion");
			localStorage.removeItem("quiz_questions");
			localStorage.removeItem("quiz_questionsId");
		}
	};

	useEffect(() => {
		connectSocket()
			.then(async (s) => {
				//console.log("Socket Connected:", s.id);

				const newJoinCheck: any = await waitForQuestionChangedQuizAll(
					(payload: any) => {
						console.log(
							payload,
							"payloadpayloadpayloadpayloadpayloadpayload"
						);

						const newCurrentQuestion =
							payload?.displayQuestion ?? "";
						const newQuestions = payload?.displayQuiz ?? "";
						const newQuestionsId = payload?.questionId;
						const payloadData = {
							questId: payload?.quizId,
							currentQuestion: {
								questionId: payload?.questionId,

								quizQsenStartTime: payload?.quizQsenStartTime,
								quizQsenTime: payload?.quizQsenTime,

								quizQsenLateStartTime: false,
							},
						};

						if (payload?.quizId)
							cacheJoin(String(payload?.quizId), payloadData);

						// Update state
						setCurrentQuestion(newCurrentQuestion);
						setQuestions(newQuestions);
						setQuestionsId(newQuestionsId);

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

						// Save to localStorage
						saveQuestionDataToStorage(
							newCurrentQuestion,
							newQuestions,
							newQuestionsId
						);
					}
				);
				const questId = String(quizId);
				const cached = getCachedJoin(questId);
				if (cached) {
					//console.log("🚀 qqqqqqqq", cached);
					// use cached to update UI immediately
				} else {
				}

				try {
					const joined = await waitForQuizJoinedOnce(quizId, 1000);
					console.log(joined, "222222");
					if (!newJoinCheck && joined) {
						const newCurrentQuestion = "";
						const newQuestions = "";
						const newQuestionsId =
							joined?.currentQuestion?.questionId;
						// toast.success(`Current Quest  ${newQuestionsId}`);
						const currentTime = moment().format(
							"MMMM Do YYYY, h:mm:ss"
						);
						setCurrentQuestion(newCurrentQuestion);
						setQuestions(newQuestions);
						setQuestionsId(newQuestionsId);

						dispatch(
							setQuestData({
								questId: questId,
								questionId: `${newQuestionsId}`,
								questiQsenStartTime: `${joined?.currentQuestion?.questiQsenStartTime}`,
								questiQsenTime: `${joined?.currentQuestion?.questiQsenTime}`,
								questiQsenLateStartTime: `${currentTime}`,
							})
						);

						saveQuestionDataToStorage(
							newCurrentQuestion,
							newQuestions,
							newQuestionsId
						);
					}
				} catch (e) {
					console.warn("qqqqqqqq", e);
				}

				waitForQuestCompletedAll((payload) => {
					//console.log("000000000", payload);
					handleLeaveQuiz();
					// sessionStorage.removeItem("userSession");
					// toast.success(`${payload?.message}`);
					setLiderBoardShow(true);
					// questEndFunction();
					clearQuestionDataFromStorage();
				});

				waitForQuizEndedAll((payload: any) => {
					//console.log("Quest Ended:", payload);
					complitedQuiz();
					router.push(`/quiz-result-view/${sessionId}?qid=${quizId}`);
					// clearAllLocalStorage()
					// router.replace(`/result-view/${attempId}`);
				});
				userQuizCompletedAll((payload: any) => {
					//console.log("qqqqqqqqqq Ended:", payload);
					// clearAllLocalStorage()
					complitedQuiz();
					router.replace(
						`/quiz-result-view/${sessionId}?qid=${quizId}`
					);
				});
			})
			.catch((err) => {
				console.error("Socket Connection failed:", err);
				// alert("Socket connection failed");
			});
	}, []);

	console.log(quizId, "quizIdquizIdquizIdquizIdquizId");

	const complitedQuiz = async () => {
		const payload = { status: "Completed" };
		const response = await axiosInstance.put(
			`/quiz-attempts/${attempId}/status`,
			payload
		);
		console.log(response, "complitedQuizcomplitedQuizcomplitedQuiz");
	};

	// Jump to the matching task when questionsId arrives/changes
	useEffect(() => {
		console.log(steps, "targetIdx");
		if (questionsId == null) return;

		// 1) match by id
		let targetIdx = steps.findIndex((s) => s.id === questionsId);
		console.log(targetIdx, "targetIdx");

		// 2) fallback by title if needed
		if (targetIdx === -1 && currentQuestion) {
			const norm = (x: string) => x.trim().toLowerCase();
			const t = ordered.find(
				(t) => norm(t.title || "") === norm(currentQuestion)
			);
			if (t) targetIdx = steps.findIndex((s) => s.id === t.id);
		}

		if (targetIdx !== -1) {
			setIdx(targetIdx);
		} else {
			console.warn("No task matched questionId/title", {
				questionsId,
				currentQuestion,
			});
		}
	}, [questionsId, currentQuestion, steps, ordered]);

	const Body: any = currentIsWaiting
		? WaitingRoomComponentQuiz
		: componentForTaskType(
				String(
					(currentTask?.question_type || currentTask?.task_type) ?? ""
				)
		  );

	return (
		<div className="h-screen overflow-auto bg-white">
			<div className="py-6 flex items-center justify-center">
				<Link href="/">
					<Image
						src="/images/logo/logo.svg"
						className="dark:hidden"
						alt="logo"
						role="presentation"
						quality={100}
						width={176}
						height={42}
					/>
				</Link>
			</div>

			{/* liderBoardShow */}

			{liderBoardShow ? (
				<Leaderboard scope={"entire"} />
			) : (
				<>
					{currentQuestion && (
						<div className="mt-4 px-4 max-w-4xl mx-auto hidden">
							<h2 className="font-semibold">Current Question:</h2>
							<p>{currentQuestion}</p>
							<p>{questions}</p>
						</div>
					)}

					<div className="bg-white w-full">
						<div className="mx-auto max-w-4xl px-4">
							{currentIsWaiting ? (
								<Body />
							) : (
								<Body task={currentTask as TaskItem} />
							)}
						</div>
					</div>
				</>
			)}

			{/* Debug/info block, keep if useful */}

			<QuizLiveFooter />
		</div>
	);
};

export default TaskNavigator;
