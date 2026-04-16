"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useSelector } from "react-redux";
// import { RootState } from "@/services/redux/store";

import { AxiosError } from "axios";
// import { GlobalCountdown } from "../GlobalTimeManage";
// import QuizTimer, { getCurrentTime } from "../GlobalTimer";
import { TimerCacheManager } from "@/utils/timerCacheUtils";
import SharedQuestTimer from "../SharedQuestTimer";
import { IoMdHappy } from "react-icons/io";

type TaskQuestion = {
	id: number | string;
	text?: string;
	label?: string;
	color?: string;
};

type TaskItem = {
	id?: number | string;
	quiz_id?: number | string;
	serial_number?: number;
	title?: string;
	question_type?: string;
	task_type?: string;
	description?: string | null;
	questions?: TaskQuestion[];
	time_limit_seconds?: number | string;
	source_content_url?: string | null;
};

type Props = {
	task?: TaskItem | any;
	value?: string | null; // kept for backward compat on single-select
	onChange?: (val: string) => void;
};

const QuestContantComponent: React.FC<Props> = ({ task, value }) => {
	console.log(task, "tasktasktasktasktask");

	//   const answers = useSelector((state: RootState) => state.answers);
	const searchParams = useSearchParams();
	const joinid = searchParams.get("jid");

	const [watingData, setwatingData] = useState(true);
	const [chalangeData, setchalangeData] = useState<any>({});

	const questTimeData = useSelector((state: any) => state.questTime);
	console.log(questTimeData, "questId");

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
				setchalangeData(response?.data?.data?.quest);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				console.error("Unexpected error:", axiosError.message);
			}
		};
		dataFetch();
	}, [joinid]);

	console.log(
		task?.id,
		chalangeData,
		"task?.idtask?.idtask?.idtask?.idtask?.id"
	);

	const isMulti =
		(task?.task_type || task?.question_type) === "multiple_choice";

	// ---------- Selection State ----------
	// single-select legacy
	const [selectedOption, setSelectedOption] = useState<string | "">(
		(value as string) ?? ""
	);

	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const startRef = useRef<number>(Date.now());

	useEffect(() => {
		startRef.current = Date.now();
		setSelectedOption((value as string) ?? "");
		setSelectedOptions([]);
	}, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

	const dataNew: any = task;

	useEffect(() => {
		if (!task?.id) return;
		const key = `timeExpired_${task.id}`;
		const userStatus: any = localStorage.getItem(key);
		console.log(userStatus, "dataNew?.id");
		if (userStatus !== null) {
			console.log(dataNew?.id, "dataNew?.id");
			const savedState = JSON.parse(userStatus);
			console.log(savedState, "dataNew?.id 0");
			if (
				savedState?.status === "completed" ||
				(savedState?.submitStatus === "completed" &&
					task.id === savedState?.taskId)
			) {
				console.log(dataNew?.id, "dataNew?.id 1");
				setwatingData(false);
			}
		} else {
			console.log(dataNew?.id, "dataNew?.id 3");
			setwatingData(true);
		}
	}, [dataNew?.id]);

	const handleExpire = () => {
		if (!questTimeData?.questionId) return;

		const key = `timeExpired_${questTimeData.questionId}`;
		const raw = localStorage.getItem(key);
		console.log(raw, "rawrawrawrawrawrawrawraw");

		const saved = setTaskExpired(questTimeData.questionId);
		const ok =
			saved?.status === "completed" &&
			String(saved?.taskId ?? questTimeData.questionId) ===
				String(questTimeData.questionId);
		if (ok) {
			setwatingData(false);
		}
	};

	const setTaskExpired = (questionId: string | number) => {
		const key = `timeExpired_${questionId}`;
		const payload = {
			status: "completed",
			submitStatus: "complited",
			taskId: questionId,
			ts: Date.now(),
		};
		localStorage.setItem(key, JSON.stringify(payload));
		setwatingData(false);
		return payload;
	};

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === `timeExpired_${questTimeData?.questionId}`) {
				// re-run your same logic
				try {
					const parsed = e.newValue ? JSON.parse(e.newValue) : null;
					const ok =
						parsed?.status === "completed" &&
						String(parsed?.taskId ?? questTimeData?.questionId) ===
							String(questTimeData?.questionId);
					setwatingData(!!ok);
				} catch {
					setwatingData(e.newValue === "completed");
				}
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [questTimeData?.questionId]);

	// 4) when the timer truly finishes, mark completed to freeze state forever
	const onExpireWrapped = useCallback(() => {
		if (dataNew?.id != null) TimerCacheManager.markCompleted(dataNew.id);
		if (typeof handleExpire === "function") handleExpire();
	}, [dataNew?.id, handleExpire]);

	const htmlToText = (html?: string) => {
		if (!html) return "";
		const stripped = html.replace(/<[^>]*>/g, " ");
		if (typeof window !== "undefined") {
			const div = document.createElement("div");
			div.innerHTML = stripped;
			const text = div.textContent || div.innerText || "";
			return text
				.replace(/\u00a0/g, " ")
				.replace(/\s+/g, " ")
				.trim();
		}
		return stripped
			.replace(/\u00a0/g, " ")
			.replace(/\s+/g, " ")
			.trim();
	};

	const selectionText = isMulti
		? selectedOptions.length
			? `You selected: ${selectedOptions.join(", ")}`
			: "No selection yet"
		: selectedOption
		? `You selected: ${selectedOption}`
		: "No selection yet";

	const handleTimeUpdate = (
		remaining: number,
		elapsed: number,
		total: number
	) => {
		console.log(total, "total");
		console.log(elapsed, "total");
		console.log(remaining, "total");
	};

	console.log(questTimeData, "questTimeDataquestTimeDataquestTimeData");

	return (
		<div className="">
			{watingData ? (
				<div
					className="min-h-screen overflow-auto flex flex-col justify-center items-center px-4"
					style={{
						backgroundImage: `url('${task?.image_url.path}')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				>
					<div className="max-w-xl w-full space-y-6">
						<h2 className="text-2xl font-semibold text-gray-900 text-center">
							{htmlToText(task?.title)}
						</h2>

						<button
							className="hidden"
							onClick={() => onExpireWrapped()}
						>
							{" "}
							All QuizTimer Clear{" "}
						</button>

						<div className="flex justify-center items-center text-white!">
							<SharedQuestTimer
								attemptId={`attempt-${dataNew?.id}`}
								onTimeUpdate={handleTimeUpdate}
								onExpire={handleExpire}
							/>
							{/* <QuizTimer
							data={timerData}
							onTimeUpdate={handleTimeUpdate}
							onExpire={handleExpire}
							persistKey={`attempt-${dataNew?.id}`}
						/> */}
						</div>

						<div className="text-center text-sm text-gray-500">
							{selectionText}
						</div>
						<div className="bg-white p-3 shadow-3 rounded-[10px]">
							<div 
        dangerouslySetInnerHTML={{ __html: task?.contant_title }} 
        className="prose max-w-none" 
      />
						</div>
						
					</div>
				</div>
			) : (
				<div className="flex justify-center items-center">
									<h3 className="md:text-[30px] font-bold text-[18px] flex flex-col justify-center items-center pt-30">
										<IoMdHappy className="mb-[30px] text-[100px]" />
										Please wait for the presenter to change slides.
									</h3>
								</div>
			)}
		</div>
	);
};

export default QuestContantComponent;
