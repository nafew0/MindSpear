/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import QuizDateClose from "@/components/ErrorComponent/QuizDateClose";
import InputGroup from "@/components/FormElements/InputGroup";
// import { setQuestData } from "@/services/redux/features/questQsenTimeSlice";
import {
	emitJoinQuest,
	connectSocket,
	waitForQuestJoinedOnce22,
	clearCachedJoin,
	setCurrentQuest,
} from "@/socket/quest-socket";
import axiosInstance from "@/utils/axiosInstance";
import { clearAppStorage } from "@/utils/storageCleaner";
import { AxiosError } from "axios";
import moment from "@/lib/dayjs";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiUserGroup } from "react-icons/hi";
import { toast } from "react-toastify";
// import { useDispatch } from "react-redux";
// import { useSocketStatusComparison } from "@/utils/sockerReconnected";

interface QuizResponse {
	quest: any;
}

function QuestAttemptForm() {
	const searchParams = useSearchParams();
	// const dispatch = useDispatch();
	// const { currentStatus, statusAfter2Sec, isStable } = useSocketStatusComparison();
	// console.log(currentStatus, statusAfter2Sec, isStable);
	const router = useRouter();
	const qid = searchParams.get("qid");
	const joinid = searchParams.get("jid");
	const [currentUserName, setCurrentUserName] = useState("");
	const [quizData, setQuizData] = useState<QuizResponse | null>(null);

	const [quizErrorMessage, setQuizErrorMessage] = useState<
		string | undefined
	>();
	const [quizErrorStatus, setQuizErrorStatus] = useState<boolean>(false);

	console.log(quizData, "quizDataquizDataquizData");

	useEffect(() => {
		// Clear Local stores
		if (typeof window === "undefined") return;
		const questId = `${qid}`;
		clearCachedJoin(questId);
		clearAppStorage();
		localStorage.removeItem("quest.session");
		localStorage.removeItem("userTimeSet");
		const handleClearQuizData = async () => {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith("quiz")) {
					localStorage.removeItem(key);
					i = -1;
				}
			}
		};
		handleClearQuizData();
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined" && !navigator.onLine) {
			console.warn("Offline — skipping API call");
			return;
		}

		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get<{
					data: QuizResponse;
				}>(`/quest-attempts-url/show-by-link/${joinid}`);
				setQuizData(response?.data?.data);
				console.log(
					response?.data?.data,
					"response?.data.dataresponse?.data.data"
				);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;

				if (axiosError.response) {
					const msg =
						axiosError.response.data?.message ||
						"Verification failed.";
					console.error("Error verifying token:", msg);
					setQuizErrorMessage(msg);
					setQuizErrorStatus(true);
				} else {
					console.error("Unexpected error:", axiosError.message);
					setQuizErrorMessage(
						"Unexpected error occurred. Please try again."
					);
					setQuizErrorStatus(true);
				}
			} finally {
			}
		};
		dataFetch();
	}, []);

	const open = moment.utc(quizData?.quest?.start_datetime);
	const close = moment.utc(quizData?.quest?.end_datetime);

	const duration = moment.duration(close.diff(open));

	const days = Math.floor(duration.asDays());
	const hours = duration.hours();
	const minutes = duration.minutes();

	const timeParts = [];

	if (days > 0) timeParts.push(`${days} day${days > 1 ? "s" : ""}`);
	if (hours > 0) timeParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
	if (minutes > 0)
		timeParts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

	const clearQuestionDataFromStorage = () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("quiz_currentQuestion");
			localStorage.removeItem("quiz_questions");
			localStorage.removeItem("quiz_questionsId");

			const keys = Object.keys(localStorage);
			keys.forEach((key) => {
				if (key.startsWith("attempt-")) {
					localStorage.removeItem(key);
				}
			});
		}
	};

	useEffect(() => {
		clearQuestionDataFromStorage();
	}, []);

	// 	setInterval(() => {
	//     //console.log("⏰ 2-second tick:", currentSocket?.connected);
	//     //console.log("⏰ 2-second tick:", new Date().toLocaleTimeString());
	//     // Your function logic here
	// }, 3000);

	const userId = Math.floor(Math.random() * 10000).toString();
	const soketRequestFunction = () => {
		const questId = `${qid}`;
		const userName = `${currentUserName}`;
		const questTitle = `${quizData?.quest?.title}`;
		setCurrentQuest({
			questId,
			userId,
			questTitle,
			userName,
			isCreator: false,
		});
		connectSocket()
			.then(async (s) => {
				//console.log("Socket Connected:", s.id);

				try {
					await emitJoinQuest({ questId, userId, userName });
					const joined = await waitForQuestJoinedOnce22(
						questId,
						15000
					);
					return joined;
				} catch (e) {
					console.error("Failed to create quiz:", e);
				}
			})
			.catch((err) => {
				console.error("Socket Connection failed:", err);
			});
	};

	const dataSubmit = async () => {
		try {
			const formattedDate = quizData?.quest?.start_datetime
				? moment
						.utc(quizData?.quest?.start_datetime)
						.format("YYYY-MM-DD HH:mm:ss")
				: null;
			const obj = {
				anonymous_name: `${currentUserName}`,
				start_time: `${formattedDate}`,
			};
			const response = await axiosInstance.post(
				`/quest-attempts-url/join-by-link/${joinid}`,
				obj
			);
			console.log(response, "response?.data.dataresponse?.data.data");
			soketRequestFunction();

			const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");
			const joined = await waitForQuestJoinedOnce22();
			if (joined) {
				console.log(joined, "11111");
				if (typeof window === "undefined") return;
				const userJoinData: any = {
					questId: joined?.questId,
					questionId: `${joined?.currentQuestion?.questionId}`,
					questiQsenStartTime: `${joined?.currentQuestion?.questiQsenStartTime}`,
					questiQsenTime: `${joined?.currentQuestion?.questiQsenTime}`,
					questiQsenLateStartTime: `${currentTime}`,
				};
				localStorage.setItem(
					"userTimeSet",
					JSON.stringify(userJoinData)
				);
				// dispatch(
				// 	setQuestData({
				// 		questId: joined?.questId,
				// 		questionId: `${joined?.currentQuestion?.questionId}`,
				// 		questiQsenStartTime: `${joined?.currentQuestion?.questiQsenStartTime}`,
				// 		questiQsenTime: `${joined?.currentQuestion?.questiQsenTime}`,
				// 		questiQsenLateStartTime: `${currentTime}`,
				// 	})
				// );
				router.push(
					`/attempt/quest-live/play/${response?.data?.data.quest?.join_code}?jid=${response?.data?.data.quest.join_link}&qid=${response?.data?.data.quest.id}&aid=${response?.data?.data?.attempt.id}&ujid=${userId}&title=${quizData?.quest?.title}&uname=${currentUserName}`
				);
			}
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

		// currentUserName
	};

	// If the fetched quest has ended, show a clear message and prevent any actions
	if (quizData?.quest?.status === "Ended") {
		return (
			<div className="container mx-auto p-4 max-w-3xl text-center">
				<QuizDateClose
					errorTest={
						"This quest has ended. You cannot join or perform any actions."
					}
					errorStatus={true}
				/>
			</div>
		);
	}

	if (quizErrorStatus) {
		return (
			<div className="container mx-auto p-4 max-w-3xl text-center">
				{quizErrorStatus && (
					<QuizDateClose
						errorTest={quizErrorMessage}
						errorStatus={quizErrorStatus}
					/>
				)}
			</div>
		);
	}

	const createTime =
		quizData?.quest?.start_datetime !== null ||
		quizData?.quest?.start_datetime !== undefined
			? quizData?.quest?.start_datetime
			: new Date();

	return (
		<div className="quiz_play_bg ">
			<div className="flex flex-col justify-center items-center h-screen w-full">
				<div className=" flex flex-col justify-center items-center bg-[#fff] w-full md:w-[500px] rounded-[5px] ">
					<div className="w-[80px] h-[80px] rounded-full bg-[#fff] items-center flex justify-center mt-[-40px] shadow-2">
						<HiUserGroup className="text-[30px] text-[#222]" />
					</div>
					<h3 className="text-[24px] font-bold py-[10px] text-[#222]">
						{" "}
						{quizData?.quest?.title}{" "}
					</h3>
					<h3 className="bg-[#123396] text-[#fff] px-[30px] py-[10px] rounded-[5px] font-bold my-[10px]">
						{" "}
						{/* Open for: {moment.(quizData?.quest?.start_datetime)}{" "} */}
						Open for:{" "}
						{moment(createTime).format("YYYY-MM-DD HH:mm:ss")}
					</h3>

					<div className="flex justify-between w-full bg-[#2222] mt-[10px] px-[10px] py-[10px]">
						<h3>
							{quizData?.quest?.tasks
								? `${quizData?.quest?.tasks.length} Questions`
								: ""}
						</h3>

						{/* <h3> Host Name : <span className='font-bold'> {quizData?.quiz?.user.full_name} </span> </h3> */}
					</div>
				</div>

				<div className="md:h-[200px]"></div>

				<div className=" flex  bg-[#fff] w-full md:w-[500px] rounded-[5px] mt-[30px] ">
					<div className="flex gap-3 justify-between w-full p-[15px]">
						{/* <input
                        type="text"
                        // onChange={(e) => setUserName(e.target.value)}
                        onChange={(e) => setCurrentUserName(e.target.value)}
                        placeholder="Enter nickname"
                        className="flex-1 px-3 py-3 border rounded-lg w-[60%]"
                    /> */}

						<InputGroup
							onChange={(e) => setCurrentUserName(e.target.value)}
							className=" font-bold text-[#333] w-[90%] "
							type="text"
							label=""
							placeholder="Enter Name"
							iconPosition="left"
							height="sm"
						/>

						<button
							onClick={dataSubmit}
							className="bg-primary mt-3 font-bold px-[20px] rounded-[10px] text-[#fff] shadow-3 "
						>
							{" "}
							Okay
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default QuestAttemptForm;
