/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Quiz } from "@/types/types";
import React, { useEffect, useState, useRef } from "react";

import Summary from "@/components/QuizReports/Summary";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { setQuiz } from "@/stores/features/quizInformationSlice";
import { useDispatch, useSelector } from "react-redux";
import {
	setQuestData,
	// clearQuestData,
} from "@/stores/features/questQsenTimeSlice";
import { Switch } from "antd";
import {
	connectSocket,
	getSocket,
	waitForQuizCreatedOnce,
	waitForParticipantJoined,
	emitQuizStart,
	emitChangeQuestion,
	waitForParticipantLeft,
	waitForParticipantLeftAll,
	emitCreateQuiz,
	setCurrentQuiz,
	waitForQuizStartedOnce,
	waitForQuestionChangedQuizSingle,
	waitForQuestionChangedQuizAll,
} from "@/socket/socket";
import { RootState } from "@/stores/store";
import { CirclePlay, Users } from "lucide-react";
import {
	setScope,
	userQuizCompletedLastSlider,
} from "@/stores/features/leaderboardSlice";
import { toast } from "react-toastify";

interface QuizResponse {
	quiz: Quiz;
}

function QuizReport() {
	const params = useParams();
	const router = useRouter();
	const dispatch = useDispatch();
	const [response, setresponse] = useState<QuizResponse | any>(null);
	const [sessionResponse, setSessionResponse] = useState<QuizResponse | any>(
		null
	);
	const user = useSelector((state: RootState) => state.auth.user) as any;
	const quizSession = useSelector(
		(state: any) => state.questSession.questSession
	);
	console.log(quizSession, "quizSessionquizSessionquizSession");
	const { scope } = useSelector((state: any) => state.leaderboard);
	console.log(scope, "ddddddddddddddddddddddddd");

	const [isQuizMode, setIsQuizMode] = useState(true);
	const [participants, setParticipants] = useState<any[]>([]);
	console.log(participants);

	const [participantsActiveNumber, setparticipantsActiveNumber] =
		useState<number>(0);

	const [activeUsersData, setActiveUsersData] = useState<any>([]);
	const [participantsActiveData, setparticipantsActiveData] = useState<any>(
		{}
	);

	const [quizCreated, setQuizCreated] = useState(false);
	const [titleInput, setTitleInput] = useState("");

	const [connected, setConnected] = useState(false);
	const mountedRef = useRef(true);

	const quizId = `${params?.id}`;
	const userId = `${user?.id}`;
	const userName = `${user?.full_name}`;
	const quizTitle = `${response?.quiz.title}` || "quiz Title";

	// 	useEffect(() => {
	// const existing = getSocket();
	// console.log(existing?.connected, "existingexistingexistingexistingexistingexisting");

	// 	}, [])

	const handleQuizCompletion = (payload: any) => {
		// Your existing code...
		//console.log("000000000", payload);
		dispatch(userQuizCompletedLastSlider());
	};

	useEffect(() => {
		handleQuizCompletion("payload");
		mountedRef.current = true;
		connectSocket()
			.then(async (s) => {
				//console.log("Socket Connected:", s.id);
				setConnected(true);

				socketDataGet();
				await emitCreateQuiz({
					quizId,
					userId,
					quizTitle,
					userName,
				});
				setQuizCreated(true);
				s.off("disconnect").on("disconnect", () => {
					if (mountedRef.current) {
						//console.log("Disconnected");
						setConnected(false);
					}
				});
			})
			.catch((err) => {
				console.error("Socket Connection failed:", err);
				// alert("Socket connection failed");
			});
	}, [response?.quiz.title, params?.id]);

	const socketDataGet = async () => {
		const existing = getSocket();
		console.log(existing?.connected);
		if (!existing?.connected) {
			router.back();
		}

		const created = await waitForQuizCreatedOnce();
		//console.log("✅ Quiz Created:", created);

		waitForParticipantJoined((payload) => {
			//console.log("🎉 participantJoined:", payload);
			//console.log("🎉 participantJoined:", payload?.activeUsers);
			setparticipantsActiveData(payload);
			setActiveUsersData(payload?.activeUsers);
			setparticipantsActiveNumber(payload?.participantCount);
			const newUsers = payload?.participantUsers || [];
			setParticipants((prev) => {
				const existingIds = prev.map((p) => p.userId);
				const merged = [...prev];
				newUsers.forEach((u: any) => {
					if (!existingIds.includes(u.userId)) merged.push(u);
				});
				return merged;
			});
		});

		waitForParticipantLeft((payload: { userId: string }) => {
			//console.log("✅ Left quiz confirmation:", payload);
		});

		waitForParticipantLeftAll((payload: { userId: string }) => {
			//console.log("🚪 User left:", payload);
		});
	};

	useEffect(() => {
		const questJoined = async () => {
			waitForParticipantJoined((payload) => {
				setparticipantsActiveData(payload);
				setActiveUsersData(payload?.activeUsers);
				//console.log("Participant Joined:", payload);
				// //console.log("Participant Joined:", participantsActive);
			});
		};
		questJoined();
	}, []);

	useEffect(() => {
		if (!connected) return;

		const s = getSocket();
		if (!s) return;

		// Clean first to prevent duplicates
		s.off("room:joined").on("room:joined", (payload) => {
			//console.log("[room:joined]", payload);
		});

		s.off("quiz:created").on("quiz:created", (payload) => {
			//console.log("[quiz:created]", payload);
		});

		s.off("room:broadcast").on("room:broadcast", (payload) => {
			//console.log("[room:broadcast]", payload);
		});

		return () => {
			s.off("room:joined");
			s.off("quiz:created");
			s.off("room:broadcast");
		};
	}, [connected]);

	const start = moment.utc(response?.quiz?.open_datetime).startOf("day");
	const end = moment.utc(response?.quiz?.close_datetime).startOf("day");
	const daysLeft = end.diff(start, "days");

	useEffect(() => {
		const dataFetch = async () => {
			const responseData = await axiosInstance.get(
				`/quizes/show/${params?.id}`
			);
			const responseQuizSessionData = await axiosInstance.get(
				`/quizes/show-with-sessions/${quizSession?.id}`
			);
			setSessionResponse(responseQuizSessionData?.data.data);
			setresponse(responseData?.data?.data);
			dispatch(setQuiz(responseData?.data?.data));
		};
		dataFetch();
	}, [params?.id, quizSession?.id]);

	const handleQuizChange = (checked: boolean) => {
		setIsQuizMode(checked);
		dispatch(setScope("entire"));
	};

	const handleGamesChange = (checked: boolean) => {
		setIsQuizMode(!checked);
		dispatch(setScope("slide"));
	};

	// quizeStart
	const quizeStartFunction = async () => {
		try {
			setCurrentQuiz({
				quizId,
				userId,
				quizTitle,
				userName,
				isCreator: true,
			});

			const startedPromise = waitForQuizStartedOnce();
			await emitQuizStart({
				quizId,
				userId,
				userName,
				quizTitle,
			});

			const joined: any = await startedPromise;
			updateHostLiveSession();
			console.log(joined, "joinedjoinedjoined");

			if (joined) {
				handleChangeQuestion();
			} else {
				toast.error("Quest start failed");
			}

			// await emitQuizStart({ quizId, quizTitle });
			// handleChangeQuestion();
		} catch (e) {
			console.error("Failed to create quiz:", e);
		}
	};
	useEffect(() => {
		if (quizSession?.title) {
			setTitleInput(quizSession.title);
		}
	}, [quizSession?.title]);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTitleInput(e.target.value);
	};

	const updateHostLiveSession = async () => {
		try {
			const payload = {
				title: titleInput,
				quiz_mode: scope === "slide" ? "game" : "quiz",
			};
			const response = await axiosInstance.post(
				`/quizes/update-host-live/${quizSession?.id}`,
				payload
			);
			return response.data;
		} catch (error) {
			console.error("Update failed:", error);
			throw error;
		}
	};

	console.log(
		sessionResponse,
		"responseresponseresponseresponseresponseresponse"
	);

	const handleChangeQuestion = async () => {
		const question = response?.quiz?.questions.find(
			(item: { serial_number: number }) =>
				Number(item.serial_number) === 1
		);

		const questionId = question?.id || "20";
		const questionTitle = question?.question_text || "New Text";

		const quizQsenStartTime = moment().format("MMMM Do YYYY, h:mm:ss");
		const quizQsenTime = `${question?.task_data?.time_limit}`;
		const quizQsenLateStartTime = false;

		await emitChangeQuestion({
			quizId,
			questionId,
			quizTitle,
			questionTitle,
			quizQsenStartTime,
			quizQsenTime,
			quizQsenLateStartTime,
		});
		const changeQsen = await waitForQuestionChangedQuizSingle();
		if (changeQsen) {
			router.push(
				`/create-live/quize?jid=${sessionResponse?.session?.join_link}&qid=${quizId}&sid=${quizSession?.id}`
			);
		}

		waitForQuestionChangedQuizAll((payload) => {
			//console.log("Question Changed:", payload);
			dispatch(
				setQuestData({
					questId: `${payload?.quizId}`,
					questionId: `${payload?.questionId}`,
					questiQsenStartTime: `${payload?.quizQsenStartTime}`,
					questiQsenTime: `${payload?.quizQsenTime}`,
					questiQsenLateStartTime: false,
				})
			);
		});
	};

	console.log(
		activeUsersData,
		"activeUsersDataactiveUsersDataactiveUsersDataactiveUsersData"
	);

	return (
		<div className="h-screen overflow-auto scrollbar-hidden">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-5 ">
				<div className="md:col-span-7 p-6 bg-white rounded-lg border">
					<div className="flex flex-col justify-between h-full">
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

						<h3 className="text-xl font-bold">
							{" "}
							{response?.quiz.title}{" "}
						</h3>
						<div className="  w-full rounded-[10px] mt-4 ">
							<div className=" items-center font-bold gap-3 live_switch flex justify-between mb-5">
								<h2 className="border border-[#2222] p-3 rounded-[8px] w-full">
									Quiz Mode{" "}
									<Switch
										className="ml-[10px] rounded-[5px] font-bold"
										checkedChildren="Yes"
										unCheckedChildren="No"
										checked={isQuizMode}
										onChange={handleQuizChange}
									/>
								</h2>
								<h2 className="border border-[#2222] p-3 rounded-[8px] w-full">
									Games Mode{" "}
									<Switch
										className="ml-[10px] rounded-[5px] font-bold"
										checkedChildren="Yes"
										unCheckedChildren="No"
										checked={!isQuizMode}
										onChange={handleGamesChange}
									/>
								</h2>
							</div>
							{/* <button
								onClick={() => {
									quizeStartFunction();
								}}
								className="mr-[5px] border border-[#2222] px-[30px] rounded-[10px] bg-[#bc5eb3] text-white font-bold"
							>
								{" "}
								Start{" "}
							</button> */}

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
						{activeUsersData?.map(
							(
								item: {
									userName: string;
									userId:
										| string
										| number
										| bigint
										| boolean
										| null
										| undefined;
								},
								index: React.Key | null | undefined
							) => (
								<div
									key={index}
									className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
								>
									<div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
										{item?.userName
											?.charAt(0)
											.toUpperCase()}
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
							)
						)}

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

				<div className="md:col-span-8 p-4 bg-[#fff] rounded-[8px] border h-[200px] relative hidden">
					<h3
						// onClick={handleCreateQuiz}
						className="text-[1.5rem] text-[#222] font-bold mb-[5px]"
					>
						{" "}
						{response?.quiz.title} {connected ? "🟢" : "🔴"}
					</h3>

					<div
						// onClick={() => leaveQuizRoom}
						className="flex gap-3 live_switch"
					>
						<span className="bg-[#f3f4f6] px-6 py-2 rounded-[5px] text-[14px] font-bold">
							{quizCreated ? " Quiz Created" : "Create Quiz"}{" "}
							{participantsActiveNumber}
						</span>
						<span className="bg-[#f3f4f6] px-6 py-2 rounded-[5px] text-[14px] font-bold">
							{" "}
							Competition{" "}
						</span>
						<span className="bg-[#f3f4f6] px-6 py-2 rounded-[5px] text-[14px] font-bold">
							{" "}
							Engagement{" "}
						</span>
					</div>
				</div>
				<div className="md:col-span-4 p-4 bg-[#fff] rounded-[8px] border h-auto hidden ">
					<h4 className="text-[#333333] border-[#2222] border-b-2 pb-[20px] text-[0.875rem]">
						Assigned MindSpear{" "}
						<span className="border border-[#fa9b47] p-2 rounded-[10px] font-bold text-[#fa9b47] ml-[5px]">
							{" "}
							Ends in {daysLeft} days{" "}
						</span>
					</h4>
					<h4 className="text-[#333333] border-[#2222] border-b-2 pt-[10px] pb-[10px] text-[0.875rem]">
						Start date: {start.format("YYYY-MM-DD")}
					</h4>
					<h4 className="text-[#333333] border-[#2222] border-b-2 pt-[10px] pb-[10px] text-[0.875rem]">
						End date: {end.format("YYYY-MM-DD")}
					</h4>
					<h4 className="text-[#333333] pt-[6px] pb-[10px] text-[0.875rem]">
						Hosted by {response?.quiz.user.full_name}
					</h4>
				</div>

				<div className="md:col-span-12 p-4 bg-[#fff] rounded-[8px] border shadow-3">
					<Summary
						participantsNumber={participantsActiveNumber}
						urlnamelive="live/"
					/>
				</div>
			</div>
		</div>
	);
}

export default QuizReport;
