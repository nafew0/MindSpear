/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuizPlayComponent from "@/components/Liveui/QuizPlayComponent";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { normalizeTasks } from "@/utils/quickFormTransform";
import moment from "@/lib/dayjs";

import { waitForQuizJoinedOnce } from "@/socket/socket";
import { useDispatch } from "react-redux";
import { setQuestData } from "@/features/quest/store/questQuestionTimeSlice";

function QuizAttempt() {
	const dispatch = useDispatch();
	const searchParams = useSearchParams();
	// const router = useRouter();
	const joinid = searchParams.get("jid");
	// const userId = searchParams.get("ujid");
	const quizId = searchParams.get("qid");
	const [tasks, setTasks] = useState<any[]>([]);

	useEffect(() => {
		const joinUserGetFunction = async () => {
			try {
				const joined = await waitForQuizJoinedOnce();
				console.log(joined, "JoinGet");

				const newQuestionsId = joined?.currentQuestion?.questionId;
				const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");

				dispatch(
					setQuestData({
						questId: quizId,
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
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quiz-attempts-url/show/${joinid}`
				);
				const serial_numberfilterData =
					response?.data?.data?.quiz?.questions?.sort(
						(
							a: { serial_number: number },
							b: { serial_number: number }
						) => a.serial_number - b.serial_number
					);
				const normalized = normalizeTasks(serial_numberfilterData);
				setTasks(normalized);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				console.error("Unexpected error:", axiosError.message);
			}
		};
		if (joinid) dataFetch();
	}, [joinid]);

	return (
		<div>
			<QuizPlayComponent tasks={tasks} />
		</div>
	);
}

export default QuizAttempt;
