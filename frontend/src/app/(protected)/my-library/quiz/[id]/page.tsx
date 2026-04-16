"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";

import QuizEditPages from "@/features/quiz/components/QuizEdit/QuizEditPages";
import { ApiQuestion } from "@/types/types";
import { toast } from "react-toastify";

function QuizeDetails() {
	const params = useParams();

	const [quizInformation, setQuizInformation] = useState<ApiQuestion[]>([]);

	useEffect(() => {
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quiz/questions?quiz_id=${params?.id}`
				);
				console.log(
					response.data?.data,
					"response.data?.data?.questions?.data"
				);

				setQuizInformation(response.data?.data?.questions?.data);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;

				if (axiosError.response) {
					console.error(
						"Error verifying token:",
						axiosError.response.data
					);
					toast.error(
						`Error: ${
							axiosError.response.data?.message ||
							"Verification failed."
						}`
					);
				} else {
					console.error("Unexpected error:", axiosError.message);
					toast.error("Unexpected error occurred. Please try again.");
				}
			} finally {
			}
		};
		dataFetch();
	}, [params?.id]);

	return (
		<div className="h-screen">
			<QuizEditPages quizInformation={quizInformation} />
		</div>
	);
}

export default QuizeDetails;
