"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
	connectSocket,
	submitAnswer,
	waitForAnswerProcessedQuizOnce,
} from "@/socket/socket";

import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { upsertAnswer } from "@/features/live/store/leaderboardAnswersSlice";
import { useDispatch, useSelector } from "react-redux";

import moment from "@/lib/dayjs";
import SharedQuestTimer from "../SharedQuestTimer";
import { AxiosError } from "axios";
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
	time_limit_seconds?: number | any;
	source_content_url?: string | null;
};

type Props = {
	task?: TaskItem;
	value?: string | null;
	onChange?: (val: string) => void;
};

const ChoiceComponent: React.FC<Props> = ({ task, value, onChange }) => {
	const dispatch = useDispatch();
	// const answers = useSelector((state: RootState) => state.answers);
	const searchParams = useSearchParams();
	const joinid = searchParams.get("jid");
	const userId = searchParams.get("ujid");
	const attempId = searchParams.get("aid");

	const [watingData, setwatingData] = useState(true);
	const [chalangeData, setchalangeData] = useState<any>({});
	const [currentTimeGet, setcurrentTimeGet] = useState<any>(0);

	const questTimeData = useSelector((state: any) => state.questTime);
	console.log(questTimeData, "questTimeDataquestTimeDataquestTimeData");

	useEffect(() => {
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quiz-attempts-url/show/${joinid}`
				);
				setchalangeData(response?.data?.data?.quiz);
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

	const options = useMemo(
		() =>
			task?.questions
				?.map((q) => q.text ?? q.label ?? "")
				.filter(Boolean) ?? [],
		[task?.questions]
	);

	const [selectedOption, setSelectedOption] = useState<string | "">(
		(value as string) ?? ""
	);
	const [selectedIndex, setSelectedIndex] = useState<number>(
		Math.max(
			0,
			options.findIndex((o) => o === (value as string))
		)
	);

	const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const startRef = useRef<number>(Date.now());

	useEffect(() => {
		startRef.current = Date.now();
		setSelectedOption((value as string) ?? "");
		setSelectedIndex(options.findIndex((o) => o === (value as string)));
		setSelectedIndices([]);
		setSelectedOptions([]);
		setwatingData(true);
	}, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!isMulti) {
			setSelectedOption((value as string) ?? "");
			setSelectedIndex(options.findIndex((o) => o === (value as string)));
		}
	}, [value, options, isMulti]);

	const handleSelect = (option: string, index: number) => {
		const elapsedSec = Math.max(
			0,
			Math.round((Date.now() - startRef.current) / 1000)
		);

		if (isMulti) {
			// toggle in/out
			setSelectedIndices((prev) => {
				const exists = prev.includes(index);
				const next = exists
					? prev.filter((i) => i !== index)
					: [...prev, index];
				// keep an aligned options list (not strictly required, but nice for UI)
				setSelectedOptions(next.map((i) => options[i]));
				// Build selectedAnswer array for Redux
				const selectedAnswer =
					next.length > 0
						? next
							.map((i) => task?.questions?.[i])
							.filter(Boolean)
							.map((q) => ({
								id: q!.id,
								text: q!.text ?? q!.label ?? "",
								color: q!.color ?? null,
							}))
						: [];

				dispatch(
					upsertAnswer({
						id: (task?.id as number | string) ?? index,
						quiz_id: (task as any)?.quiz_id ?? null,
						serial_number: (task as any)?.serial_number ?? null,
						title: task?.title ?? null,
						question_type:
							(task as any)?.question_type ??
							task?.task_type ??
							null,
						selected_time: elapsedSec,
						source_content_url:
							(task as any)?.source_content_url ?? null,
						questions: selectedAnswer, // array of selected options
					})
				);
				return next;
			});
		} else {
			// single-select
			setSelectedOption(option);
			setSelectedIndex(index);
			onChange?.(option);

			const picked = task?.questions?.[index];
			const selectedAnswer = picked
				? [
					{
						id: picked.id,
						text: picked.text ?? picked.label ?? "",
						color: picked.color ?? null,
					},
				]
				: [{ id: index, text: option }];

			dispatch(
				upsertAnswer({
					id: (task?.id as number | string) ?? index,
					quiz_id: (task as any)?.quiz_id ?? null,
					serial_number: (task as any)?.serial_number ?? null,
					title: task?.title ?? null,
					question_type:
						(task as any)?.question_type ?? task?.task_type ?? null,
					selected_time: elapsedSec,
					source_content_url:
						(task as any)?.source_content_url ?? null,
					questions: selectedAnswer,
				})
			);
		}
	};

	// const handleSelect = (option: string, index: number) => {

	// 	setSelectedOption(option);
	// 	setSelectedIndex(index);
	// 	onChange?.(option);

	// 	// compute selected_time in seconds
	// 	const elapsedSec = Math.max(
	// 		0,
	// 		Math.round((Date.now() - startRef.current) / 1000)
	// 	);

	// 	// selected answer object
	// 	const picked = task?.questions?.[index];
	// 	const selectedAnswer = picked
	// 		? [
	// 				{
	// 					id: picked.id,
	// 					text: picked.text ?? picked.label ?? "",
	// 					color: picked.color ?? null,
	// 				},
	// 		  ]
	// 		: [{ id: index, text: option }];

	// 	// upsert into Redux
	// 	dispatch(
	// 		upsertAnswer({
	// 			id: (task?.id as number | string) ?? index,
	// 			quiz_id: (task as any)?.quiz_id ?? null,
	// 			serial_number: (task as any)?.serial_number ?? null,
	// 			title: task?.title ?? null,
	// 			question_type:
	// 				(task as any)?.question_type ?? task?.task_type ?? null,
	// 			selected_time: elapsedSec,
	// 			source_content_url: (task as any)?.source_content_url ?? null,
	// 			questions: selectedAnswer,
	// 		})
	// 	);
	// };

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

	// const dataSubmit = async () => {
	// 	const existing = getSocket();
	// 	if (existing?.connected) {
	// 		reqSoketData();
	// 		saveAnswer();
	// 	} else {
	// 		connectSocket().then(() => {
	// 			reqSoketData();
	// 			saveAnswer();
	// 		});
	// 	}
	// };

	const dataSubmit = async () => {
		reqSoketData();
		saveAnswer();
		const submitStatusCheck = await waitForAnswerProcessedQuizOnce();
		if (!submitStatusCheck) {
			connectSocket().then(() => {
				reqSoketData();
				saveAnswer();
				if (typeof window !== "undefined") {
					localStorage.setItem("currentId", `${task?.id}`);
				}
			});
		}

		if (typeof window !== "undefined") {
			localStorage.setItem("currentId", `${task?.id}`);
		}
	};

	const saveAnswer = async () => {
		try {
			const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
			// task?.time_limit_seconds
			// const currentData = await waitForQuestionChangedAll();
			// const getSecend = task?.time_limit_seconds - currentTimeGet;
			const diffSeconds = moment(currentTime).diff(
				moment(quizStartTimeTime),
				"seconds"
			);
			const payload = {
				question_id: task?.id,
				answer_data: {
					start_time: quizStartTimeTime,
					end_time: currentTime,
					selected_option: selectedIndex,
				},
				time_taken_seconds: diffSeconds,
			};
			await axiosInstance.post(
				`/quiz-attempts/${attempId}/answer`,
				payload
			);
		} catch (error) {
			console.error("Error saving answer:", error);
		}
	};

	const reqSoketData = () => {
		submitAnswer({
			userid: userId,
			questionId: dataNew?.id,
			userName: `${userId}`,
			questionTitle: task?.title,
			questionType: dataNew?.question_type,
			selectedOption: selectedIndex,
			option: "option",
		});
		setwatingData(false);
	};

	console.log(currentTimeGet, "rawrawrawrawrawrawrawraw");
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

	// const onExpireWrapped = useCallback(() => {
	// 	if (dataNew?.id != null) TimerCacheManager.markCompleted(dataNew.id);
	// 	if (typeof handleExpire === "function") handleExpire();
	// }, [dataNew?.id, handleExpire]);

	// const currentTime = moment(questTimeData?.questiQsenStartTime).format("YYYY-MM-DD HH:mm:ss");
	const date = questTimeData?.questiQsenStartTime;
	const cleanDate = date.replace(/(\d+)(st|nd|rd|th)/, "$1");
	const quizStartTimeTime = moment(
		cleanDate,
		"MMMM D YYYY, h:mm:ss",
		true
	).format("YYYY-MM-DD HH:mm:ss");

	// waitForQuestionChangedAll

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

	const isChosen = (option: string, i: number) =>
		isMulti ? selectedIndices.includes(i) : selectedOption === option;

	const hasSelection = isMulti
		? selectedIndices.length > 0
		: Boolean(selectedOption);

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
		setcurrentTimeGet(remaining);
	};

	return (
		<div className="min-h-screen overflow-auto flex flex-col justify-center items-center px-4">
			{watingData ? (
				<div className="max-w-xl w-full space-y-6">
					<h2 className="text-2xl font-semibold text-gray-900 text-center">
						{/* {task?.title || "Select an option"} */}
						{htmlToText(task?.title)}
					</h2>
					{/* <h2 className="text-2xl font-semibold text-gray-900 text-center">
						{task?.task_type || "Select an option"}
					</h2> */}

					<div className="flex justify-center items-center text-white!">
						<SharedQuestTimer
							attemptId={`attempt-${dataNew?.id}`}
							onTimeUpdate={handleTimeUpdate}
							onExpire={handleExpire}
						/>
					</div>

					<div className="space-y-4">
						{options.map((option, i) => (
							<button
								key={i}
								type="button"
								onClick={() => handleSelect(option, i)}
								className={clsx(
									"w-full flex justify-between items-center px-4 py-4 rounded-2xl border transition-all",
									isChosen(option, i)
										? "bg-orange-50 border-primary text-primary"
										: "bg-white border-gray-200 text-gray-800 hover:border-orange-400"
								)}
							>
								<span className="text-base">{option}</span>
								<span
									className={clsx(
										"w-5 h-5 rounded-md border flex items-center justify-center",
										isChosen(option, i)
											? "bg-primary border-primary text-white"
											: "border-gray-400"
									)}
								>
									{isChosen(option, i) && (
										<div className="w-2.5 h-2.5 rounded-[3px] bg-white" />
									)}
								</span>
							</button>
						))}
						{options.length === 0 && (
							<div className="text-sm text-gray-500 text-center border rounded-xl p-4">
								No options provided for this question.
							</div>
						)}
					</div>

					<div className="text-center text-sm text-gray-500">
						{selectionText}
					</div>

					<div className="flex items-center justify-center py-2">
						<button
							onClick={dataSubmit}
							className="bg-primary px-4 py-2 rounded-lg text-white disabled:opacity-50"
							disabled={!hasSelection}
						>
							Submit
						</button>
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

export default ChoiceComponent;
