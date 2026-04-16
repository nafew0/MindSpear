/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import QuestPlayComponent from "@/components/Liveui/QuestPlayComponent";
import { normalizeTasks } from "@/utils/quickFormTransform";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
	emitLeaveQuest,
	setCurrentQuest,
	waitForQuestJoinedOnce22,
} from "@/socket/quest-socket";
import moment from "@/lib/dayjs";
import { useDispatch } from "react-redux";
import { setQuestData } from "@/stores/features/questQuestionTimeSlice";

function QuizAttempt() {
	const searchParams = useSearchParams();
	const dispatch = useDispatch();
	const quizId = searchParams.get("qid");
	const userId = searchParams.get("ujid");
	const quizTitle = searchParams.get("title");
	const userName = searchParams.get("uname");
	const joinid = searchParams.get("jid");

	const [tasks, setTasks] = useState<any[]>([]);
	const popListenerAdded = useRef(false);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const joinUserGetFunction = async () => {
			try {
				const joined = await waitForQuestJoinedOnce22();
				console.log(joined, "JoinGet");

				const newQuestionsId = joined?.currentQuestion?.questionId;
				const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");

				dispatch(
					setQuestData({
						questId: joined?.questId,
						questionId: `${newQuestionsId}`,
						questiQsenStartTime: `${joined?.currentQuestion?.questiQsenStartTime}`,
						questiQsenTime: `${joined?.currentQuestion?.questiQsenTime}`,
						questiQsenLateStartTime: `${currentTime}`,
					})
				);
			} catch (e) {
				console.warn("qqqqqqqq", e);
			}
		};
		joinUserGetFunction();
	}, []);

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
				const normalized = normalizeTasks(
					response?.data?.data?.quest?.tasks
				);
				setTasks(normalized);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				console.error("Unexpected error:", axiosError.message);
			}
		};
		if (joinid) dataFetch();
	}, [joinid]);

	const handleLeaveQuiz = async () => {
		try {
			await emitLeaveQuest({
				questId: `${quizId}`,
				userId: `${userId}`,
				questTitle: `${quizTitle}`,
				userName: `${userName}`,
			});
			//console.log("Leave quiz request sent");
		} catch (error) {
			console.error("Error leaving quiz:", error);
		}
	};

	useEffect(() => {
		if (popListenerAdded.current) return;
		popListenerAdded.current = true;
		history.pushState({ quizGuard: true }, "", location.href);

		const handlePopState = async () => {
			const confirmLeave = window.confirm(
				"Are you sure you want to leave the quiz?"
			);
			if (confirmLeave) {
				window.removeEventListener("popstate", handlePopState);
				await handleLeaveQuiz();
				history.back();
			} else {
				history.pushState({ quizGuard: true }, "", location.href);
			}
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
			popListenerAdded.current = false;
		};
	}, [quizId, userId, quizTitle, userName]);

	// useEffect(() => {
	// 	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
	// 		event.preventDefault();
	// 		event.returnValue = "";
	// 		emitLeaveQuiz({ quizId, userId, quizTitle, userName }).catch(
	// 			() => {}
	// 		);
	// 	};

	// 	window.addEventListener("beforeunload", handleBeforeUnload);
	// 	return () =>
	// 		window.removeEventListener("beforeunload", handleBeforeUnload);
	// }, [quizId, userId, quizTitle, userName]);

	console.log(tasks, "taskstaskstaskstaskstaskstasks");

	return (
		<div>
			<QuestPlayComponent tasks={tasks} />
		</div>
	);
}

export default QuizAttempt;
