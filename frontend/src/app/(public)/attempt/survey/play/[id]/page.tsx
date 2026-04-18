/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import QuestPlayComponent from "@/features/live/components/Liveui/QuestPlayComponent";
import { normalizeTasks } from "@/utils/quickFormTransform";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";

function QuizAttempt() {
	const searchParams = useSearchParams();
	const quizId = searchParams.get("qid");
	const userId = searchParams.get("ujid");
	const quizTitle = searchParams.get("title");
	const userName = searchParams.get("uname");
	const joinid = searchParams.get("jid");

	const [tasks, setTasks] = useState<any[]>([]);
	const popListenerAdded = useRef(false);

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

	const handleLeaveQuiz = async () => {};

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
