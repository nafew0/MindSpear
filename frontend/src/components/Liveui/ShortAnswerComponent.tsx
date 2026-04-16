"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectSocket, getSocket, submitAnswer } from "@/socket/socket";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { upsertAnswer } from "@/stores/features/leaderboardAnswersSlice";
import { useDispatch } from "react-redux";
import moment from "moment";
import axiosInstance from "@/utils/axiosInstance";
import { GlobalCountdown } from "../GlobalTimeManage";
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
	time_limit_seconds?: number | string;
	source_content_url?: string | null;
};

type Props = {
	task?: TaskItem;
	value?: string | null;
	onChange?: (val: string) => void;
};

const ShortAnswerComponent: React.FC<Props> = ({ task, value, onChange }) => {
	const dispatch = useDispatch();
	const [answer, setAnswer] = useState(value ?? "");
	const [answersList, setAnswersList] = useState<string[]>([]);

	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const searchParams = useSearchParams();
	const userId = searchParams.get("ujid");
	const attempId = searchParams.get("aid");
	const joinid = searchParams.get("jid");

	const [watingData, setwatingData] = useState(true);
	const [chalangeData, setchalangeData] = useState<any>({});
	const [currentTimeGet, setcurrentTimeGet] = useState<any>(0);

	const maxWords = 5;

	const startRef = useRef<number>(Date.now());
	useEffect(() => {
		setAnswer("");
		setAnswersList([]);
		setSubmitted(false);
		setError("");
		startRef.current = Date.now();
	}, [task?.id]);

	useEffect(() => {
		if (value !== undefined && value !== null) {
			setAnswer(value);
			setSubmitted(false);
			setError("");
		}
	}, [value]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setAnswer(e.target.value);
		setError("");
		setSubmitted(false);
	};

	const wordCount = answer.trim()
		? answer.trim().split(/\s+/).filter(Boolean).length
		: 0;

	const dataNew: any = task;

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

	// ✅ Debounced live upsert while the user types (also sets selected_time)
	useEffect(() => {
		const t = setTimeout(() => {
			if (!task?.id) return;
			const trimmed = answer.trim();
			const elapsedSec = Math.max(
				0,
				Math.round((Date.now() - startRef.current) / 1000)
			);

			dispatch(
				upsertAnswer({
					id: (task?.id as number | string) ?? 0,
					quiz_id: (task as any)?.quiz_id ?? null,
					serial_number: (task as any)?.serial_number ?? null,
					title: (task as any)?.title ?? null,
					question_type:
						(task as any)?.question_type ??
						(task as any)?.task_type ??
						null,
					selected_time: elapsedSec,
					source_content_url:
						(task as any)?.source_content_url ?? null,
					questions: trimmed ? [{ id: 0, text: trimmed }] : [],
				})
			);
		}, 300); // 300ms debounce

		return () => clearTimeout(t);
	}, [answer, task?.id, dispatch]);

	const reqSoketData = () => {
		submitAnswer({
			userid: userId,
			questionId: dataNew?.id,
			userName: `${userId}`,
			questionTitle: (dataNew as any)?.title,
			questionType: (dataNew as any)?.question_type,
			selectedOption: `${answer}`,
			option: "text",
		});
		setwatingData(true);
	};

	const saveAnswer = async (nextList: any) => {
		try {
			const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

			// const rankIndexList = ranked.map((_, i) => i + 1);
			const payload = {
				question_id: task?.id,
				answer_data: {
					start_time: currentTime,
					selected_option: nextList,
				},
				time_taken_seconds: currentTimeGet,
			};
			await axiosInstance.post(
				`/quiz-attempts/${attempId}/answer`,
				payload
			);
		} catch (error) {
			console.error("Error saving answer:", error);
		}
	};

	const handleSubmit = async () => {
		const trimmed = answer.trim();
		if (!trimmed) {
			setError("Please write your answer.");
			return;
		}

		const nextList = [...answersList, trimmed];
		setAnswersList(nextList);
		setAnswer("");
		// (Optional) Upsert again on submit to be absolutely sure
		const elapsedSec = Math.max(
			0,
			Math.round((Date.now() - startRef.current) / 1000)
		);
		await saveAnswer(nextList);
		dispatch(
			upsertAnswer({
				id: (task?.id as number | string) ?? 0,
				quiz_id: (task as any)?.quiz_id ?? null,
				serial_number: (task as any)?.serial_number ?? null,
				title: (task as any)?.title ?? null,
				question_type:
					(task as any)?.question_type ??
					(task as any)?.task_type ??
					null,
				selected_time: elapsedSec,
				source_content_url: (task as any)?.source_content_url ?? null,
				questions: [{ id: 0, text: trimmed }],
			})
		);

		const existing = getSocket();
		if (existing?.connected) {
			reqSoketData();
		} else {
			connectSocket().then(() => reqSoketData());
		}

		setError("");
		setSubmitted(true);
		onChange?.(trimmed);
	};

	const handleTimeUpdate = (s: any) => {
		setcurrentTimeGet(s);
		console.log(s, "loging");
	};

	const handleExpire = () => {
		//console.log("Expired -> submit response for quest");
	};

	return (
		<div className="flex flex-col justify-center items-center px-4">
			{watingData ? (
				<div className="max-w-xl w-full space-y-6">
					<h2 className="text-2xl font-semibold text-gray-900 text-center">
						{task?.title || "Short Answer"}
					</h2>
					{/* <div className="text-center text-sm text-gray-500">
            {task?.task_type} {task?.id !== undefined && <>• ID: {task.id}</>}
          </div> */}

					<GlobalCountdown
						source={{
							id: dataNew?.id,
							open_datetime: chalangeData?.open_datetime,
							close_datetime: chalangeData?.close_datetime,
							quiztime_mode: chalangeData?.quiztime_mode,
							time_limit: task?.time_limit_seconds as any,
							duration: chalangeData?.duration,
						}}
						autoStart={true}
						onExpire={handleExpire}
						onTimeUpdate={handleTimeUpdate}
					/>

					<p className="text-sm text-gray-500 text-center">
						Please briefly describe what you found most valuable in
						the training.
					</p>

					<div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
						<textarea
							value={answer}
							onChange={handleChange}
							placeholder="Type your answer here..."
							rows={1}
							className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
						/>

						<div className="flex justify-between text-sm text-gray-500">
							<span>
								{wordCount}/{maxWords} words
							</span>
							{error && (
								<span className="text-red-500">{error}</span>
							)}
						</div>

						{submitted && (
							<p className="text-sm text-green-600">
								Answer submitted successfully!
							</p>
						)}

						<div className="text-center">
							<button
								onClick={handleSubmit}
								disabled={!answer.trim()}
								className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50"
							>
								Submit
							</button>
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

export default ShortAnswerComponent;
