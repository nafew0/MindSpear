/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useRef } from "react";

import Summary from "@/features/quest/components/QuestReports/Summary";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { setQuest } from "@/features/quest/store/questInformationSlice";
import { RootState } from "@/stores/store";

import { clearCache } from "@/features/live/store/leaderboardSlice";
import { clearAppStorage } from "@/utils/storageCleaner";
import { changeQuestTask } from "@/features/live/services/liveSessionApi";
import { useHostChannel } from "@/features/live/hooks/useHostChannel";

import {
	setQuestData,
	// clearQuestData,
} from "@/features/quest/store/questQuestionTimeSlice";

import { CirclePlay, Users } from "lucide-react";
import moment from "@/lib/dayjs";
import { toast } from "react-toastify";
import type { TimerState } from "@/features/live/types";

interface ActiveUser {
	userName: string;
	userId: string;
}

function QuizReport() {
	const params = useParams();
	const router = useRouter();
	const dispatch = useDispatch();
	const questSession = useSelector(
		(state: RootState) => state.questSession.questSession,
	);

	const [response, setresponse] = useState<any | null>(null);
	const [activeUsersData, setActiveUsersData] = useState<ActiveUser[]>([]);
	const [participantsActive, setparticipantsActive] = useState(0);
	const [titleInput, setTitleInput] = useState("");

	const [connected, setConnected] = useState(false);
	const questId = `${params?.id}`;

	useEffect(() => {
		if (typeof window !== "undefined") {
			dispatch(clearCache());
			// Clear Local stores
			clearAppStorage();
		}
	}, [params?.id]);

	useEffect(() => {
		setConnected(true);
	}, []);

	useHostChannel("quest", questSession?.id, {
		onParticipantJoined: (payload) => {
			setparticipantsActive(payload?.participant_count ?? 0);
			if (!payload?.participant_id) return;

			setActiveUsersData((previous) => {
				const userId = `${payload.participant_id}`;
				if (previous.some((item) => item.userId === userId)) {
					return previous;
				}

				return [
					...previous,
					{
						userId,
						userName: `Participant ${payload.participant_id}`,
					},
				];
			});
		},
		onParticipantCountUpdated: (payload) => {
			setparticipantsActive(payload?.participant_count ?? 0);
		},
	});

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

	const quizeStartFunction = async () => {
		try {
			await updateHostLiveSession();
			await handleChangeQuestion();
		} catch (e) {
			console.error("Failed to start quest:", e);
			toast.error("Quest start failed");
		}
	};

	const handleChangeQuestion = async () => {
		if (!questSession?.id) {
			toast.error("No live quest session was found.");
			return;
		}

		const question = response?.tasks.find(
			(item: { serial_number: number }) =>
				Number(item.serial_number) === 1,
		);
		const questionId = question?.id || "20";

		const questiQsenStartTime = moment().format("MMMM Do YYYY, h:mm:ss");
		const timeLimit = Number(
			question?.task_data?.time_limit ??
				question?.time_limit_seconds ??
				question?.time_limit ??
				0,
		);
		const timerState: TimerState = {
			status: "running",
			start_time: questiQsenStartTime,
			duration_seconds: Number.isFinite(timeLimit) ? timeLimit : 0,
			remaining_seconds: Number.isFinite(timeLimit) ? timeLimit : 0,
		};

		const liveState = await changeQuestTask(
			questSession.id,
			questionId,
			timerState,
		);

		dispatch(
			setQuestData({
				questId,
				questionId: `${liveState.current_task_id ?? questionId}`,
				questiQsenStartTime,
				questiQsenTime: `${timeLimit || ""}`,
				questiQsenLateStartTime: false,
			}),
		);

		router.push(
			`/live/quests?jlk=${response?.join_link}&qid=${questId}&sid=${questSession.id}&pck=${liveState.public_channel_key}`,
		);
	};

	useEffect(() => {
		if (questSession?.title) {
			setTitleInput(questSession.title);
		}
	}, [questSession?.title]);

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
							{participantsActive} joined
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
							{participantsActive} Online
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

				<div className="md:col-span-12 p-4 bg-[#fff] rounded-[8px] border shadow-3">
					<Summary
						participantsNumber={participantsActive}
						urlnamelive="quest-live/"
					/>
				</div>
			</div>
		</div>
	);
}

export default QuizReport;
