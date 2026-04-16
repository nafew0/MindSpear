"use client";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from "next/navigation";
import QuizAttemptForm from '@/components/Liveui/QuizAttemptForm'
import QuizPlayComponent from '@/components/Liveui/QuizPlayComponent';
import axiosInstance from '@/utils/axiosInstance';
import { AxiosError } from 'axios';
import { normalizeTasks } from '@/utils/QuickFromTransform';

function QuizAttempt() {
	const searchParams = useSearchParams();
	const statusValue = searchParams.get("status");
	const joinid = searchParams.get("jid");
	const [tasks, setTasks] = useState([])

	  useEffect(() => {
			const dataFetch = async () => {
				try {
					const response = await axiosInstance.get(`/quiz-attempts-url/show/${joinid}`);
					const normalized = normalizeTasks(response?.data?.data?.quiz?.questions);
					setTasks(normalized)
					
				} catch (error) {
					const axiosError = error as AxiosError<{ message?: string }>;
					console.error("Unexpected error:", axiosError.message);
				} finally {
				}
			};
			dataFetch();
		}, [joinid]);

		console.log(tasks, "taskstaskstaskstaskstasks");
		
	
  return (
	<div>
		{statusValue === "true" ? <QuizPlayComponent tasks={tasks} /> : <QuizAttemptForm />}
		{/* {statusValue === "true" ? <QuizPlayComponent tasks={tasks} /> : <QuizAttemptForm />} */}
	  
	</div>
  )
}

export default QuizAttempt
