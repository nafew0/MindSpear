/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef } from "react";

import Summary from "@/components/QuestReports/Summary";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { setQuest } from "@/stores/features/questInformationSlice";
import { RootState } from "@/stores/store";

import { clearCache } from "@/stores/features/leaderboardSlice";
import { clearAppStorage } from "@/utils/storageCleaner";
import {
	connectSocket,
	emitChangeQuestionQuest,
	emitCreateQuest,
	emitStartQuest,
	getSocket,
	setCurrentQuest,
	waitForParticipantJoinedQuest,
	waitForQuestJoinedOnce,
	waitForQuestStartedOnce,
	waitForQuestionChangedQuestAll,
	waitForQuestionChangedQuestSingle,
} from "@/socket/quest-socket";

import {
	setQuestData,
	// clearQuestData,
} from "@/stores/features/questQsenTimeSlice";

import { CirclePlay, Users } from "lucide-react";
import moment from "moment";
import { toast } from "react-toastify";

interface ActiveUser {
	userName: string;
	userId: string;
}

function QuizReport() {
	const params = useParams();
	const router = useRouter();
	const dispatch = useDispatch();
	const user = useSelector((state: RootState) => state.auth.user) as any;
	const questSession = useSelector(
		(state: RootState) => state.questSession.questSession,
	);

	const [response, setresponse] = useState<any | null>(null);
	const [participantsData, setParticipantsData] = useState([]);
	console.log(participantsData);

	const [activeUsersData, setActiveUsersData] = useState<ActiveUser[]>([]);
	const [participantsActive, setparticipantsActive] = useState(0);
	const [participantsActiveData, setparticipantsActiveData] = useState<any>(
		{},
	);
	const [quizCreated, setQuizCreated] = useState(false);
	const [titleInput, setTitleInput] = useState("");

	const [connected, setConnected] = useState(false);
	const questId = `${params?.id}`;
	const userId = `${user?.id}`;
	const questTitle = "quiz Title";
	const userName = `${user?.full_name}`;

	useEffect(() => {
		if (typeof window !== "undefined") {
			dispatch(clearCache());
			// Clear Local stores
			clearAppStorage();
		}
	}, [params?.id]);

	useEffect(() => {
		const questJoined = async () => {
			waitForParticipantJoinedQuest((payload) => {
				setparticipantsActiveData(payload);
				setActiveUsersData(payload?.activeUsers);
				//console.log("Participant Joined:", payload);
				//console.log("Participant Joined:", participantsActive);
			});
		};
		questJoined();
	}, []);
	console.log(
		participantsActiveData?.participantCount,
		quizCreated,
		"Participant Joined:",
	);

	useEffect(() => {
		// if (existing?.connected) {
		reloadSocketConnection();
		const questJoined = async () => {
			const joined = await waitForQuestJoinedOnce();
			setparticipantsActive(joined?.activeCount);
		};
		questJoined();
		setConnected(true);
		setQuizCreated(true);
	}, [response?.quest?.title, params?.id]);

	const reloadSocketConnection = () => {
		connectSocket()
			.then(async () => {
				await emitCreateQuest({
					questId,
					questTitle,
					userId,
					userName,
				});
			})
			.catch((err: any) => {
				console.error("Socket Connection failed:", err);
			});
	};

	// const reConnectFunction = () => {
	// 	connectSocket()
	// 		.then(async (s) => {
	// 			//console.log("Socket Connected:", s.id);
	// 			setConnected(true);

	// 			// await emitCreateQuest({
	// 			// 	questId,
	// 			// 	userId,
	// 			// 	questTitle,
	// 			// 	userName,
	// 			// });
	// 			setQuizCreated(true);
	// 			s.off("disconnect").on("disconnect", () => {
	// 				if (mountedRef.current) {
	// 					//console.log("Disconnected");
	// 					setConnected(false);
	// 				}
	// 			});
	// 		})
	// 		.catch((err) => {
	// 			console.error("Socket Connection failed:", err);
	// 			// alert("Socket connection failed");
	// 		});
	// };

	// const existing = getSocket();

	// setInterval(() => {
	// 	if (existing?.connected) {
	// 	} else {
	// 		reConnectFunction ()
	// 	}
	// }, 3000);

	useEffect(() => {
		const dataFetch = async () => {
			const responseData = await axiosInstance.get(
				`/quests/show/${params?.id}`,
			);
			setresponse(responseData?.data?.data?.quest);
			dispatch(setQuest(responseData?.data?.data?.quest));
		};
		dataFetch();
	}, [params?.id]);

	useEffect(() => {
		const datafetch = async () => {
			try {
				const response = await axiosInstance.get(`/quiz-participants`);
				setParticipantsData(
					response?.data?.data?.quiz_participants?.data,
				);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				if (axiosError.response) {
					console.error(
						"Error verifying token:",
						axiosError.response.data,
					);
				} else {
					console.error("Unexpected error:", axiosError.message);
				}
			}
		};
		datafetch();
	}, []);

	// reConnectFunction
	const quizeStartFunction = async () => {
		try {
			const existing = getSocket();
			if (existing?.connected) {
				setCurrentQuest({
					questId,
					userId,
					questTitle,
					userName,
					isCreator: true,
				});

				const startedPromise = waitForQuestStartedOnce();
				await emitStartQuest({ questId, userId, userName, questTitle });

				const joined = await startedPromise;

				updateHostLiveSession();

				if (joined) {
					handleChangeQuestion();
				} else {
					toast.error("Quest start failed");
				}
			}
		} catch (e) {
			console.error("Failed to create quiz:", e);
		}
	};

	const handleChangeQuestion = async () => {
		const question = response?.tasks.find(
			(item: { serial_number: number }) =>
				Number(item.serial_number) === 1,
		);
		const questionId = question?.id || "20";
		const questionTitle = question?.question_text || "New Text";

		const questiQsenStartTime = moment().format("MMMM Do YYYY, h:mm:ss");
		const questiQsenTime = `${question?.task_data?.time_limit}`;
		const questiQsenLateStartTime = false;

		await emitChangeQuestionQuest({
			questId,
			questionId,
			questTitle,
			questionTitle,
			questiQsenStartTime,
			questiQsenTime,
			questiQsenLateStartTime,
		});

		const changeQsen = await waitForQuestionChangedQuestSingle();
		console.log(changeQsen, "changeQsenchangeQsenchangeQsen");

		if (changeQsen) {
			router.push(
				`/live/quests?jlk=${response?.join_link}&qid=${questId}`,
			);
		}

		waitForQuestionChangedQuestAll((payload) => {
			//console.log("Question Changed:", payload);
			dispatch(
				setQuestData({
					questId: `${payload?.questId}`,
					questionId: `${payload?.questionId}`,
					questiQsenStartTime: `${payload?.questiQsenStartTime}`,
					questiQsenTime: `${payload?.questiQsenTime}`,
					questiQsenLateStartTime: false,
				}),
			);
		});
	};

	useEffect(() => {
		if (questSession?.title) {
			setTitleInput(questSession.title);
		}
	}, [questSession?.title]);

	console.log(
		questSession,
		"questSessionquestSessionquestSessionquestSession",
	);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitleInput(e.target.value);
	};

	// Keep track of last-saved title to avoid calling API on initial set
	const lastSavedTitleRef = useRef<string | null>(null);

	useEffect(() => {
		if (lastSavedTitleRef.current === null) {
			lastSavedTitleRef.current = questSession?.title || "";
		}
	}, [questSession?.title]);

	// Debounce title updates: wait 3s after user stops typing, then call API
	useEffect(() => {
		if (titleInput === undefined) return;
		if (titleInput === lastSavedTitleRef.current) return;

		const timer = setTimeout(async () => {
			try {
				await updateHostLiveSession();
				lastSavedTitleRef.current = titleInput;
			} catch (err) {
				console.error("Failed to auto-update title:", err);
			}
		}, 3000);

		return () => clearTimeout(timer);
	}, [titleInput]);

	const updateHostLiveSession = async () => {
		try {
			const payload = {
				title: titleInput,
			};
			const response = await axiosInstance.post(
				`/quests/update-host-live/${questSession?.id}`,
				payload,
			);
			//console.log("Update successful:", response.data);
			return response.data;
		} catch (error) {
			console.error("Update failed:", error);
			throw error;
		}
	};

	return (
		<div className="h-min-screen overflow-auto scrollbar-hidden">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-5 ">
				<div className="md:col-span-7 p-6 bg-white rounded-lg border">
					{/* Status Bar */}
					<div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
						<div className="flex items-center gap-2">
							<div
								className={`w-4 h-4 rounded-full ${
									connected
										? "bg-green-500 animate-pulse"
										: "bg-red-500"
								}`}
							/>
							<span className="text-sm font-medium text-gray-700">
								{connected
									? "Live - Ready to start"
									: "Offline - Check connection"}
							</span>
						</div>
						<span className="text-sm text-gray-600">
							{participantsActiveData?.participantCount || 0}{" "}
							joined
						</span>
					</div>

					{/* Quick Start */}
					<div className="space-y-4">
						<input
							type="text"
							value={titleInput}
							onChange={handleTitleChange}
							placeholder="Session title..."
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-primary disabled:bg-gray-100"
							disabled={!connected}
						/>

						<button
							onClick={quizeStartFunction}
							disabled={!connected}
							className="w-full bg-primary disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
						>
							{connected ? (
								<>
									<CirclePlay size={18} />
									Start Session
								</>
							) : (
								"Waiting for Connection..."
							)}
						</button>
					</div>
				</div>
				<div className="md:col-span-5 p-4 bg-white rounded-lg border h-auto">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-lg font-semibold text-gray-800">
							Active Participants
						</h4>
						<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
							{activeUsersData?.length || 0} Online
						</span>
					</div>

					<div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
						{activeUsersData?.map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
							>
								<div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
									{item?.userName?.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-gray-900 truncate">
										{item.userName.toUpperCase()}
									</p>
									<p className="text-xs text-gray-500 truncate">
										ID: {item.userId}
									</p>
								</div>
								<div
									className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
									title="Online"
								></div>
							</div>
						))}

						{(!activeUsersData || activeUsersData.length === 0) && (
							<div className="text-center py-6 text-gray-500">
								<div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
									<Users
										className="text-gray-500"
										size={14}
									/>
								</div>
								<p>No active participants</p>
								<p className="text-sm">
									Waiting for users to join...
								</p>
							</div>
						)}
					</div>
				</div>

				{/*
				<div className="md:col-span-5 p-4 bg-[#fff] rounded-[8px] border h-auto ">
					<h4 className="text-[#333333] border-[#2222] border-b-2 pb-[20px] text-[0.875rem]">
						Active participants{" "}
						<span className="border border-[#fa9b47] hidden p-2 rounded-[10px] font-bold text-[#fa9b47] ml-[5px]">
							{" "}
							Ends in {daysLeft} days{" "}
						</span>
					</h4>

					<div className="scrollbar-hidden h-[110px] flex-1 overflow-y-auto scrollbar-hidden">
						{activeUsersData?.map((item: any, i) => (
							<div key={i} className="">
								<div className="flex justify-between pt-3">
									<span className="">
										User Name :
										<span className="font-bold">
											{item?.userName}
										</span>
									</span>
									<span className="">
										User Id :
										<span className="font-bold">
											{item?.userId}
										</span>
									</span>
								</div>
							</div>
						))}
					</div>

					{/* <h4 className="text-[#333333] border-[#2222] border-b-2 pt-[10px] pb-[10px] text-[0.875rem]">
						Start date: {start.format("YYYY-MM-DD")}
					</h4>
					<h4 className="text-[#333333] border-[#2222] border-b-2 pt-[10px] pb-[10px] text-[0.875rem]">
						End date: {end.format("YYYY-MM-DD")}
					</h4>
					<h4 className="text-[#333333] pt-[6px] pb-[10px] text-[0.875rem]">
						Hosted by {response?.user?.full_name}
					</h4> 
				</div>
					*/}
				<div className="md:col-span-12 p-4 bg-[#fff] rounded-[8px] border shadow-3">
					<Summary
						participantsNumber={
							participantsActiveData?.participantCount
						}
						urlnamelive="quest-live/"
					/>
				</div>
			</div>
		</div>
	);
}

export default QuizReport;
