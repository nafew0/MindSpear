/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QuizLiveFooter from "@/components/Layouts/quiz/QuizLiveFooter";
import QuestChoiceComponent from "./QuestChoiceComponent";
import QuestContentComponent from "./QuestContentComponent";
import QuestRankingComponent from "./QuestRankingComponent";
import QuestShortAnswerComponent from "./QuestShortAnswerComponent";
import QuickFormPreview from "./QuickFormPreview";
import QuestScalesChoiceComponent from "./QuestScalesChoiceComponent";
import WaitingRoomComponent from "./WaitingRoomComponent";
import { FaUser } from "react-icons/fa";
// import { toast } from "react-toastify";
import {
	connectSocket,
	waitForQuestCompletedOnce,
	waitForQuestionChangedQuestAll,
	waitForQuestionChangedSingle,
	waitForQuestCompletedAll,
	// emitLeaveQuiz,
	waitForQuestEndedAll,
	waitForQuestJoinedOnce22,
	getCachedJoin,
	cacheJoin,
	// setCurrentQuest,
} from "@/socket/quest-socket";
import QuestCompletedPages from "@/components/Dashboard/QuestCompletedPages";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setQuestData } from "@/features/quest/store/questQuestionTimeSlice";
import moment from "@/lib/dayjs";
// import { toast } from "react-toastify";

export type TaskType =
	| "wordcloud"
	| "scales"
	| "longanswer"
	| "ranking"
	| "sorting"
	| "wordcloud"
	| "shortanswer"
	| string;

export interface TaskItem {
	id: number;
	quest_id: number;
	title: string;
	description?: string | null;
	task_type?: string;
	question_type?: string;
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

	if (
		key === "single_choice" ||
		key === "quiz_single_choice" ||
		key === "multiple_choice" ||
		key === "quiz_multiple_choice" ||
		key === "fill_in_the_blanks_choice"
	)
		return QuestChoiceComponent;
	if (key === "content") return QuestContentComponent;
	if (key === "scales") return QuestScalesChoiceComponent;
	if (key === "ranking" || key === "sorting" || key === "shorting")
		return QuestRankingComponent;

	// true/false
	if (key === "truefalse" || key === "true_false_choice")
		return QuestChoiceComponent;
	if (key === "quick_form") return QuickFormPreview;
	if (
		key === "shortanswer" ||
		key === "longanswer" ||
		key === "wordcloud" ||
		key === "sort_answer_choice"
	)
		return QuestShortAnswerComponent;

	return UnsupportedComponent;
};

export interface NavigatorProps {
	tasks: TaskItem[];
}

const TaskNavigator: React.FC<NavigatorProps> = ({ tasks }) => {
	const router = useRouter();
	const dispatch = useDispatch();
	const [questions, setQuestions] = useState<string>("");
	const { showLeaderboard } = useSelector((state: any) => state.leaderboard);

	console.log(tasks, "taskstaskstaskstaskstaskstaskstasks");

	const [currentQuestion, setCurrentQuestion] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("quiz_currentQuestion") || "";
		}
		return "";
	});

	const [questionsId, setQuestionsId] = useState<number | null>(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("quiz_questionsId");
			return stored ? parseInt(stored) : null;
		}
		return null;
	});
	const [liderBoardShow, setLiderBoardShow] = useState<boolean>(false);
	const searchParams = useSearchParams();
	const quizId = searchParams.get("qid");
	// const questId = searchParams.get("qid");
	// const userId = searchParams.get("ujid");
	// const quizTitle = searchParams.get("title");
	const userName = searchParams.get("uname");
	const attempId = searchParams.get("aid");

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

	// Helper function to clear question data from storage
	const clearQuestionDataFromStorage = () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("quiz_currentQuestion");
			localStorage.removeItem("quiz_questions");
			localStorage.removeItem("quiz_questionsId");
		}
	};

	const ordered = useMemo(
		() =>
			[...tasks].sort(
				(a, b) => a.serial_number - b.serial_number || a.id - b.id
			),
		[tasks]
	);
	const steps = useMemo(
		() => [{ id: -1 }, ...ordered.map((t) => ({ id: t.id }))],
		[ordered]
	);

	const [idx, setIdx] = useState(0);
	const currentIsWaiting = steps[idx].id === -1;
	const currentTask = currentIsWaiting
		? undefined
		: ordered.find((t) => t.id === steps[idx].id)!;

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

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			handleLeaveQuiz();
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	// 	const clearAllLocalStorage = () => {
	//     localStorage.clear();
	// };

	console.log(
		showLeaderboard,
		"showLeaderboardshowLeaderboardshowLeaderboardshowLeaderboard"
	);

	useEffect(() => {
		connectSocket()
			.then(async (s) => {
				//console.log("Socket Connected:", s.id);

				waitForQuestionChangedSingle((payload: any) => {
					//console.log("🎉 Question Changed:", payload);
				});

				const newJoinCheck: any = await waitForQuestionChangedQuestAll(
					(payload: any) => {
						console.log(
							"🎉 joinedjoinedjoinedjoinedjoined:",
							payload
						);
						const newCurrentQuestion =
							payload?.displayQuestion ?? "";
						const newQuestions = payload?.displayQuiz ?? "";
						const newQuestionsId = payload?.questionId;
						const payloadData = {
							questId: payload?.questId,
							currentQuestion: {
								questionId: payload?.questionId,
							},
						};

						if (payload?.questId)
							cacheJoin(String(payload?.questId), payloadData);

						// Update state
						setCurrentQuestion(newCurrentQuestion);
						setQuestions(newQuestions);
						setQuestionsId(newQuestionsId);

						dispatch(
							setQuestData({
								questId: payload?.questId,
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
					const joined = await waitForQuestJoinedOnce22(
						questId,
						1000
					);
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

						console.log(
							joined,
							"joinedjoinedjoinedjoinedjoinedjoinedjoinedjoined"
						);

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

				waitForQuestEndedAll((payload: any) => {
					//console.log("Quest Ended:", payload);
					// clearAllLocalStorage()
					router.replace(`/result-view/${attempId}`);
				});

				// const completed2 = await waitForQuestionChangedSingle();
				const completed = await waitForQuestCompletedOnce();
				if (completed) {
					// sessionStorage.removeItem("userSession");
				}
				//console.log("Quest Completed:", completed);
			})
			.catch((err) => {
				console.error("Socket Connection failed:", err);
				// alert("Socket connection failed");
			});
	}, []);

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
		? WaitingRoomComponent
		: componentForTaskType(
				String(
					(currentTask?.question_type || currentTask?.task_type) ?? ""
				)
		  );

	return (
		<div className="h-screen overflow-auto bg-white relative">
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

			<div className="flex gap-2 absolute top-5 right-5 justify-center items-center font-bold">
				{" "}
				<span className=" bg-primary w-[40px] text-white h-[40px] rounded-full flex justify-center items-center">
					{" "}
					<FaUser />{" "}
				</span>{" "}
				<h3> {userName} </h3>{" "}
			</div>

			{liderBoardShow ? (
				<QuestCompletedPages pagesStatus={"user"} />
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
			<QuizLiveFooter />
		</div>
	);
};

export default TaskNavigator;
