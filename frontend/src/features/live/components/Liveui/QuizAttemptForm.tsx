/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import QuizDateClose from "@/components/ErrorComponent/QuizDateClose";
import InputGroup from "@/components/FormElements/InputGroup";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import moment from "@/lib/dayjs";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { HiUserGroup } from "react-icons/hi";

import {
	connectSocket,
	emitJoinQuiz,
	getSocket,
	waitForQuizJoinedOnce,
	// waitForQuizStartedAll,
	// waitForQuizJoineOnce,
	// waitForQuizStartedAllOnce,
	setCurrentQuiz,
} from "@/socket/socket";
import { toast } from "react-toastify";

interface QuizOption {
	color: string[];
	choices: (string | null)[];
	correct_answer: number;
}

interface Question {
	id: number;
	quiz_id: number;
	serial_number: number | null;
	question_text: string;
	question_type: string | null;
	time_limit_seconds: number | null;
	points: number | null;
	is_ai_generated: boolean;
	source_content_url: string | null;
	options: QuizOption | null;
	visibility: string;
	deleted_at: string | null;
	deleted_by: number | null;
	created_at: string;
	updated_at: string;
}

interface User {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	email_verified_at: string;
	email_verification_token: string | null;
	is_verified: boolean;
	profile_picture: string;
	account_type: string;
	institution_id: number | null;
	institution_name: string;
	designation: string;
	department: string;
	provider: string | null;
	provider_id: string | null;
	created_at: string;
	updated_at: string;
	full_name: string;
	institution: string | null;
}

interface Quiz {
	id: number;
	title: string;
	description: string | null;
	category_id: number | null;
	is_published: boolean;
	open_datetime: string;
	close_datetime: string;
	quiztime_mode: boolean;
	duration: number;
	logged_in_users_only: boolean;
	safe_browser_mode: boolean;
	visibility: string;
	quiz_mode: string;
	timezone: string;
	join_link: string;
	join_code: string;
	deleted_at: string | null;
	user_id: number;
	deleted_by: number | null;
	created_at: string;
	updated_at: string;
	questions: Question[];
	user: User;
}

interface QuizResponse {
	quiz: Quiz;
}

function QuizAttemptForm() {
	const searchParams = useSearchParams();
	// const pathname = usePathname();
	// const isLivePagesStatus = pathname.includes("live");
	const router = useRouter();
	// const id = params?.id;
	const joinid = searchParams.get("jid");
	const sessionId = searchParams.get("sid");
	const qid = searchParams.get("qid");
	console.log(sessionId);

	const mountedRef = useRef(true);
	const [currentUserName, setCurrentUserName] = useState("");
	const [quizData, setQuizData] = useState<QuizResponse | null>(null);
	const [connected, setConnected] = useState(false);

	const [quizErrorMessage, setQuizErrorMessage] = useState<
		string | undefined
	>();
	const [quizErrorStatus, setQuizErrorStatus] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
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
		localStorage.clear();
	}, []);

	useEffect(() => {
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get<{
					data: QuizResponse;
				}>(`/quiz-attempts-url/show/${joinid}`);
				setQuizData(response?.data.data);
				console.log(
					response?.data.data,
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

	console.log(quizData?.quiz, "quizData");
	const open = moment.utc(quizData?.quiz?.open_datetime);
	const close = moment.utc(quizData?.quiz?.close_datetime);

	const duration = moment.duration(close.diff(open));

	const days = Math.floor(duration.asDays());
	const hours = duration.hours();
	const minutes = duration.minutes();

	const timeParts = [];

	if (days > 0) timeParts.push(`${days} day${days > 1 ? "s" : ""}`);
	if (hours > 0) timeParts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
	if (minutes > 0)
		timeParts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

	const result = timeParts.join(", ") || "0 minute";

	useEffect(() => {
		mountedRef.current = true;

		const existing = getSocket();
		if (existing?.connected) {
			setConnected(true);

			existing.off("disconnect").on("disconnect", () => {
				if (mountedRef.current) setConnected(false);
			});
		} else {
			connectSocket()
				.then((s) => {
					if (!mountedRef.current) return;
					//console.log("Socket Connected:", s.id);
					setConnected(true);
					s.off("disconnect").on("disconnect", () => {
						if (mountedRef.current) {
							//console.log("Disconnected");
							setConnected(false);
							// if you want to auto-recreate on reconnect, you can reset:
							// createdOnceRef.current = false;
						}
					});
				})
				.catch((err) => {
					console.error("Socket Connection failed:", err);
					toast.error("Socket connection failed");
				});
		}

		return () => {
			mountedRef.current = false;
		};
	}, []);

	const userId = Math.floor(Math.random() * 10000).toString();
	const soketRequestFunction = () => {
		const quizId = `${qid}`;
		const userId = Math.floor(Math.random() * 10000).toString();
		const userName = `${currentUserName}`;
		const quizTitle = `${quizData?.quiz?.title}`;
		setCurrentQuiz({
			quizId,
			userId,
			quizTitle,
			userName,
			isCreator: false,
		});
		connectSocket()
			.then(async (s) => {
				//console.log("Socket Connected:", s.id);

				try {
					await emitJoinQuiz({ quizId, userId, userName });
					const joined = await waitForQuizJoinedOnce(quizId, 15000);
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
		setIsSubmitting(true);
		try {
			const formattedDate = quizData?.quiz?.open_datetime
				? moment
						.utc(quizData?.quiz?.open_datetime)
						.format("YYYY-MM-DD HH:mm:ss")
				: null;
			const obj = {
				anonymous_name: `${currentUserName}`,
				start_time: `${formattedDate}`,
			};
			const response = await axiosInstance.post(
				`/quiz-attempts-url/join/${joinid}`,
				obj
			);
			console.log(response, "responseresponseresponseresponseresponse");

			soketRequestFunction();
			const currentTime = moment().format("MMMM Do YYYY, h:mm:ss");
			const joined = await waitForQuizJoinedOnce();
			if (joined) {
				console.log(joined, "11111");
				if (typeof window === "undefined") return;
				const userJoinData: any = {
					questId: joined?.quizId,
					questionId: `${joined?.currentQuestion?.questionId}`,
					questiQsenStartTime: `${joined?.currentQuestion?.quizQsenStartTime}`,
					questiQsenTime: `${joined?.currentQuestion?.quizQsenTime}`,
					questiQsenLateStartTime: `${currentTime}`,
				};
				localStorage.setItem(
					"userTimeSet",
					JSON.stringify(userJoinData)
				);
				setIsSubmitting(true);
				router.push(
					`/attempt/quize/play/${response?.data?.data.session?.join_code}?jid=${response?.data?.data.session.join_link}&qid=${response?.data?.data.quiz.id}&aid=${response?.data?.data?.attempt.id}&sid=${response?.data?.data?.session.id}&connected=${connected}&ujid=${userId}&title=${quizData?.quiz?.title}&uname=${currentUserName}`
				);
			}

			// console.log(response, "response?.data.dataresponse?.data.data");
			// 	const quizId = `${qid}`
			// 	const userId = Math.floor(Math.random() * 10000).toString();
			// 	const userName = `${currentUserName}`;
			// try {
			// 	await emitJoinQuiz({ quizId, userId, userName });
			// 	const joined = await waitForQuizJoineOnce();
			// 	// const startedStatus = await waitForQuizStartedAll();
			// 	//console.log("✅ quizJoined:", joined);
			// 	// //console.log("✅ quizJoined:", startedStatus);

			// } catch (e) {
			// 	console.error("Failed to create quiz:", e);
			// }
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;
			setIsSubmitting(false);
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
	if (quizData === null) return;
	const qsenList = quizData.quiz.questions.filter(
		(question) => question.options !== null
	);

	return (
		<div className="quiz_play_bg ">
			<div className="flex flex-col justify-center items-center h-screen w-full">
				<div className=" flex flex-col justify-center items-center bg-[#fff] w-full md:w-[500px] rounded-[5px] ">
					<div className="w-[80px] h-[80px] rounded-full bg-[#fff] items-center flex justify-center mt-[-40px] shadow-2">
						<HiUserGroup className="text-[30px] text-[#222]" />
					</div>
					<h3 className="text-[24px] font-bold py-[10px] text-[#222]">
						{" "}
						{quizData?.quiz?.title}{" "}
					</h3>
					<h3 className="bg-[#123396] text-[#fff] px-[30px] py-[10px] rounded-[5px] font-bold my-[10px]">
						{" "}
						Open for: {result}{" "}
					</h3>

					<div className="flex justify-between w-full bg-[#2222] mt-[10px] px-[10px] py-[10px]">
						<h3>
							{quizData?.quiz?.questions?.length
								? `${qsenList.length} Questions`
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
							disabled={isSubmitting}
							className="bg-primary mt-3 font-bold px-[20px] rounded-[10px] text-[#fff] shadow-3"
						>
							{isSubmitting ? (
								<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
							) : (
								"Okay"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default QuizAttemptForm;
