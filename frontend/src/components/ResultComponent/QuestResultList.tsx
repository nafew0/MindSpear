/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import moment from "moment";
import Link from "next/link";
import { toast } from "react-toastify";

function QuestResultList() {
	const params = useParams();
	const [questResultList, setQuestResultList] = useState([]);

	useEffect(() => {
		const quizFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quest-leaderboard/session-list/${params?.id}`
				);
				setQuestResultList(response?.data?.data?.questSessions);
				console.log(response?.data?.data, "response?.data?.data");
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;

				if (axiosError.response) {
					console.error(
						"Error verifying token:",
						axiosError.response.data
					);
					toast.error(
						`Error: ${axiosError.response.data?.message ||
						"Verification failed."
						}`
					);
				} else {
					console.error("Unexpected error:", axiosError);
					console.error("Unexpected error:", axiosError.message);
					toast.error("Unexpected error occurred. Please try again.");
				}
			} finally {
			}
		};
		quizFetch();
	}, []);

	console.log(questResultList, "questResultListquestResultList");

	return (
		<div>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-[20px]">
				<h1 className="text-[20px] font-semibold tracking-tight">
					Quest Result
				</h1>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
				{questResultList?.map((list: any, i) => (
					<Link
						href={`/my-library/quest/${params?.id}/response/${list?.id}/all-result`}

						key={i}
						className="flex cursor-pointer items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 border hover:border-primary dark:hover:bg-gray-700 transition-colors duration-200 shadow-1"
					>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{moment(list?.start_datetime).format("YYYY MMM DD")}
						</span>
						<span className="text-xs text-white dark:text-gray-400 bg-primary dark:bg-gray-600 px-2 py-1 rounded">
							{moment(list?.start_datetime).format("HH:mm")}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}

export default QuestResultList;
