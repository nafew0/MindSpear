"use client";
import React, { useState, useEffect, useCallback } from "react";
import QuizComponent from "../QuizComponent";
import TrueFalseComponent from "../TrueFalseComponent";
import { QuizData, QuizQuestion } from "@/types/public";
import axiosInstance from "@/utils/axiosInstance";
import { useParams, useSearchParams } from "next/navigation";
import { transformQuestionData } from "@/utils/quizUtils";
import FillInTheBlanksComponent from "../FillInTheBlanksComponent";
import SortAnswerBlanksComponent from "../SortAnswerBlanksComponent";
import moment from "moment";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import ThankYouComponent from "../ThankYouComponent";
import QuizDateClose from "@/components/ErrorComponent/QuizDateClose";
import { toast } from "react-toastify";


interface QuizOption {
	id: string;
	text: string;
	placeholder: string;
	color: string;
	isSelected: boolean;
	label: string;
}

interface SingleSelectionResult extends QuizOption {
	indexNumber: string;
	questionId: string;
}

type MultiSelectionResult = string[];
type SelectionResult = SingleSelectionResult | MultiSelectionResult;

const QuizPlayPage = () => {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const preview = searchParams.get("preview");
	const quizid = params.id || searchParams.get("qid");
	const attempId = searchParams.get("aid");
	const joinid = searchParams.get("jid");
	const jCod = params.id;
	const qId = searchParams.get("qid");

	const [quizData, setQuizData] = useState<QuizData>({
		quiztime: "1m",
		quiztimeStatus: false,
		questions: [],
	});

	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [questionTimeLeft, setQuestionTimeLeft] = useState(0);
	const [totalTimeLeft, setTotalTimeLeft] = useState<number>(0);
	const [quizCompleted, setQuizCompleted] = useState(false);
	const [isDisabled, setIsDisabled] = useState(true);
	const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
	const [hasSelectedAnswer, setHasSelectedAnswer] = useState(false);
	const [questionTimes, setQuestionTimes] = useState<Record<number, number>>(
		{}
	);
	const [userQuizAnswers, setUserQuizAnswers] = useState([]);
	const [userScore, setUserScore] = useState("");
	const [userTotalScore, setUserTotalScore] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [newItemText, setNewItemText] = useState("");

	const [quizErrorMessage, setQuizErrorMessage] = useState<
		string | undefined
	>();
	const [quizErrorStatus, setQuizErrorStatus] = useState<boolean>(false);

	const parseTime = useCallback((timeString: string) => {
		const minutes = parseInt(timeString.replace("m", ""));
		return minutes * 60;
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	const loadSavedState = useCallback(() => {
		if (!quizid) return null;
		const savedState = localStorage.getItem(`quizState_${quizid}`);
		return savedState ? JSON.parse(savedState) : null;
	}, [quizid]);

	const saveState = useCallback(() => {
		if (!quizid || questions.length === 0) return;
		const stateToSave = {
			currentIndex: currentQuestionIndex,
			answeredQuestions,
			questions,
			questionTimes,
			totalTimeLeft,
			quizData,
		};
		localStorage.setItem(
			`quizState_${quizid}`,
			JSON.stringify(stateToSave)
		);
	}, [
		quizid,
		currentQuestionIndex,
		answeredQuestions,
		questions,
		questionTimes,
		totalTimeLeft,
		quizData,
	]);

	const clearSavedState = useCallback(() => {
		if (!quizid) return;
		localStorage.removeItem(`quizState_${quizid}`);
	}, [quizid]);

	useEffect(() => {
		const dataFetch = async () => {
			try {
				setIsLoading(true);
				const responselist = await axiosInstance.get(
					`/quiz-attempts-url/show/${joinid}`
				);
				const datalist = await transformQuestionData(
					responselist?.data?.data?.quiz?.questions
				);

				const savedState = loadSavedState();
				const savedQuestions = savedState?.questions;

				const apiQuizData: QuizData = {
					quiztime:
						`${responselist?.data?.data?.quiz?.duration}` || "10m",
					quiztimeStatus: responselist?.data?.data?.quiz
						?.quiztime_mode
						? true
						: false,
					open_datetime:
						responselist?.data?.data?.quiz?.open_datetime,
					close_datetime:
						responselist?.data?.data?.quiz?.close_datetime,
					questions: datalist.map((question, index) => ({
						...question,
						timeLimit: question.timeLimit || "30",
						options: question.options.map((option) => ({
							...option,
							isSelected:
								savedQuestions?.[index]?.options?.find(
									(o: { id: string }) => o.id === option.id
								)?.isSelected || false,
							placeholder: option.placeholder ?? "",
							color: option.color ?? "#000000",
							label: option?.text,
						})),
					})),
				};
				setQuizData(apiQuizData);
				setQuestions(apiQuizData.questions);

				if (savedState) {
					setCurrentQuestionIndex(savedState.currentIndex);
					setAnsweredQuestions(savedState.answeredQuestions);
					setQuestionTimes(savedState.questionTimes);
					setTotalTimeLeft(savedState.totalTimeLeft);
				}

				setIsLoading(false);
			} catch (error) {
				setIsLoading(false);
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
			}
		};
		dataFetch();
	}, [quizid, loadSavedState, joinid]);



	useEffect(() => {
		saveState();
	}, [saveState]);

	useEffect(() => {
		if (questions.length > 0 && currentQuestionIndex < questions.length) {
			const currentQuestion = questions[currentQuestionIndex];
			const hasSelection = currentQuestion.options.some(
				(option) => option.isSelected
			);
			setHasSelectedAnswer(hasSelection);
		}
	}, [questions, currentQuestionIndex]);

	useEffect(() => {
		if (questions.length === 0) return;

		if (quizData.quiztimeStatus) {
			setTotalTimeLeft((prev) => prev || parseTime(quizData.quiztime));
		} else {
			const currentTime =
				questionTimes[currentQuestionIndex] ||
				parseInt(questions[currentQuestionIndex]?.timeLimit || "0");
			setQuestionTimeLeft(currentTime);
		}
		setIsDisabled(false);
	}, [
		quizData.quiztimeStatus,
		quizData.quiztime,
		questions.length,
		currentQuestionIndex,
		parseTime,
		questionTimes,
	]);

	useEffect(() => {
		if (!quizData.quiztimeStatus || quizCompleted) return;

		const timer = setInterval(() => {
			setTotalTimeLeft((prev) => {
				if (prev <= 1) {
					completeQuiz();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [quizData.quiztimeStatus, quizCompleted]);

	useEffect(() => {
		if (quizData.quiztimeStatus || quizCompleted || questions.length === 0)
			return;

		const initialTime =
			questionTimes[currentQuestionIndex] ??
			parseInt(questions[currentQuestionIndex]?.timeLimit || "0");
		setQuestionTimeLeft(initialTime);

		const questionTimer = setInterval(() => {
			setQuestionTimeLeft((prev) => {
				if (prev <= 1) {
					if (!answeredQuestions.includes(currentQuestionIndex)) {
						setAnsweredQuestions((prev) => [
							...prev,
							currentQuestionIndex,
						]);
					}

					if (currentQuestionIndex < questions.length - 1) {
						setTimeout(() => {
							const nextIndex = currentQuestionIndex + 1;
							setCurrentQuestionIndex(nextIndex);
							setHasSelectedAnswer(false);
						}, 1000);
					} else {
						completeQuiz();
					}
					return 0;
				}

				const newTime = prev - 1;
				setQuestionTimes((prevTimes) => ({
					...prevTimes,
					[currentQuestionIndex]: newTime,
				}));

				return newTime;
			});
		}, 1000);

		return () => clearInterval(questionTimer);
	}, [
		currentQuestionIndex,
		quizData.quiztimeStatus,
		quizCompleted,
		questions.length,
		answeredQuestions,
		questionTimes,
	]);

	const handleNextQuestion = async () => {
		const currentQuestion = questions[currentQuestionIndex];

		if (preview !== "true") {
			if (hasSelectedAnswer) {
				await saveAnswer(currentQuestion);
			}
		}

		if (currentQuestionIndex < questions.length - 1) {
			if (
				!quizData.quiztimeStatus &&
				!answeredQuestions.includes(currentQuestionIndex)
			) {
				setAnsweredQuestions((prev) => [...prev, currentQuestionIndex]);
			}
			setCurrentQuestionIndex((prev) => prev + 1);
			setHasSelectedAnswer(false);
		} else {
			completeQuiz();
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
			const prevQuestion = questions[currentQuestionIndex - 1];
			const wasAnswered = prevQuestion.options.some(
				(opt) => opt.isSelected
			);
			setHasSelectedAnswer(wasAnswered);
		}
	};

	const handleClearQuizData = () => {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith("quiz")) {
				localStorage.removeItem(key);
				i = -1;
			}
		}
	};

	const completeQuiz = useCallback(() => {
		localStorage.setItem(`rediract_pages`, "true");
		clearSavedState();
		handleClearQuizData();
		setQuizCompleted(true);
		complitedApiCall();
		setIsDisabled(true);
	}, [clearSavedState]);

	const complitedApiCall = async () => {
		if (preview !== "true") {
			try {
				const payload = { status: "Completed" };
				const response = await axiosInstance.put(
					`/quiz-attempts/${attempId}/status`,
					payload
				);
				setUserQuizAnswers(
					response?.data?.data?.attempt?.user_quiz_answers
				);
				setUserScore(response?.data?.data?.attempt?.score);
				setUserTotalScore(response?.data?.data?.attempt?.total_score);
				clearSavedState();
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
			}
		}
	};

	const handleOptionSelect = (questionId: string, optionId: string) => {
		if (quizCompleted) return;

		setQuestions((prev) =>
			prev.map((question) => {
				if (question.id !== questionId) return question;

				const updatedOptions = question.options.map((option) => {
					if (!question.isMultipleSelection) {
						return {
							...option,
							isSelected: option.id === optionId,
						};
					}
					return option.id === optionId
						? { ...option, isSelected: !option.isSelected }
						: option;
				});

				const hasSelection = updatedOptions.some(
					(opt) => opt.isSelected
				);
				setHasSelectedAnswer(hasSelection);

				if (
					!quizData.quiztimeStatus &&
					!answeredQuestions.includes(currentQuestionIndex)
				) {
					setAnsweredQuestions((prev) => [
						...prev,
						currentQuestionIndex,
					]);
				}

				return { ...question, options: updatedOptions };
			})
		);
	};

	function getSelectedData(
		question: QuizQuestion
	): SingleSelectionResult | MultiSelectionResult | null {
		const { options, isMultipleSelection, id, key } = question;

		if (!options || options.length === 0) return null;

		if (key === "sortanswer") {
			if (options.length === 0) return null;
			return {
				...options[0],
				indexNumber: "0",
				questionId: id,
			};
		}

		if (isMultipleSelection) {
			const selectedOptions = options
				.filter((opt) => opt.isSelected)
				.map((opt) => ({
					...opt,
					indexNumber: options.indexOf(opt).toString(),
					questionId: id,
				}));

			if (selectedOptions.length === 0) return null;

			const combinedResult = {
				...selectedOptions[0],
				indexNumber: selectedOptions
					.map((opt) => opt.indexNumber)
					.join(","),
				questionId: id,
			};

			return combinedResult;
		} else {
			let selectedIndex = -1;

			if (key === "fillintheblanks") {
				selectedIndex = options.findIndex((opt) => opt.isSelected);
				if (selectedIndex === -1 && options.length > 0) {
					selectedIndex = 0;
				}
			} else {
				selectedIndex = options.findIndex((opt) => opt.isSelected);
			}

			if (selectedIndex === -1) return null;

			const selectedOption = options[selectedIndex];
			return {
				...selectedOption,
				indexNumber: selectedIndex.toString(),
				questionId: id,
			};
		}
	}

	function isSingleSelection(
		result: SelectionResult
	): result is SingleSelectionResult {
		return (
			typeof result === "object" &&
			!Array.isArray(result) &&
			"indexNumber" in result
		);
	}

	useEffect(() => {
		const ldata = localStorage.getItem(`rediract_pages`);
		if (ldata === "true") {
			localStorage.removeItem("rediract_pages");
			router.push(
				`/attempt/${jCod}?jid=${joinid}&qid=${qId}&aid=${attempId}`
			);
		}
	}, [jCod, joinid, qId, attempId, router]);

	const saveAnswer = async (question: QuizQuestion) => {
		if (!quizid) return;
		try {
			const result = getSelectedData(question);
			if (!result || !isSingleSelection(result)) return;
			console.log(result, "questionquestionquestionquestionquestion");

			const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");

			const payload = {
				...(question.key === "quiz" && {
					question_id: result.questionId,
					answer_data: {
						start_time: currentTime,
						selected_option: result.indexNumber,
					},
					time_taken_seconds: totalTimeLeft,
				}),
				...(question.key === "truefalse" && {
					question_id: result.questionId,
					answer_data: {
						start_time: currentTime,
						selected_option: result.indexNumber,
					},
					time_taken_seconds: totalTimeLeft,
				}),
				...(question.key === "fillintheblanks" && {
					question_id: result.questionId,
					answer_data: {
						start_time: currentTime,
						selected_option: result.indexNumber,
					},
					time_taken_seconds: totalTimeLeft,
				}),
				...(question.key === "sortanswer" && {
					question_id: result.questionId,
					answer_data: {
						start_time: currentTime,
						selected_option: newItemText,
					},
					time_taken_seconds: totalTimeLeft,
				}),
			};

			await axiosInstance.post(
				`/quiz-attempts/${attempId}/answer`,
				payload
			);
		} catch (error) {
			console.error("Error saving answer:", error);
		}
	};

	const currentQuestion = questions[currentQuestionIndex];

	if (isLoading) {
		return (
			<div className="container mx-auto p-4 max-w-3xl text-center">
				<h1 className="text-2xl font-bold mb-4">Loading Quiz...</h1>
			</div>
		);
	}

	if (quizCompleted) {
		return (
			<div
				className={`thankyou-page ${
					quizCompleted ? "thankyou_show" : ""
				}`}
			>
				<ThankYouComponent
					userQuizAnswersData={userQuizAnswers}
					userScore={userScore}
					total_score={userTotalScore}
				/>
			</div>
		);
	}

	if (questions.length === 0) {
		return (
			<div className="container mx-auto p-4 max-w-3xl text-center">
				{quizErrorStatus && (
  <QuizDateClose
    errorTest={quizErrorMessage}
    errorStatus={quizErrorStatus}
  />
)}

				<h1 className="text-2xl font-bold mb-4 hidden">
					No Questions Available
				</h1>
			</div>
		);
	}

	return (
		<div className="quiz_play_bg w-full bg-[#fff]">

				

			<div className="w-full mb-4">
				<div className="flex overflow-x-auto whitespace-nowrap gap-1">
					{Array.from({ length: questions.length }).map(
						(_, index) => (
							<div
								key={index}
								className={`
                w-full h-2 border rounded flex items-center justify-center text-sm
                ${
					index < currentQuestionIndex ||
					answeredQuestions.includes(index)
						? "bg-primary text-white border-primary"
						: index === currentQuestionIndex
						? "bg-primary border-primary text-white font-bold"
						: "bg-gray-100 border-gray-300"
				}
              `}
							></div>
						)
					)}
				</div>
			</div>
			<div className="p-4">
				{currentQuestion.key === "quiz" && (
					<QuizComponent
						question={currentQuestion}
						onOptionSelect={(optionId) =>
							handleOptionSelect(currentQuestion.id, optionId)
						}
						disabled={
							isDisabled ||
							(!quizData.quiztimeStatus && questionTimeLeft <= 0)
						}
						timeLeft={
							quizData.quiztimeStatus
								? totalTimeLeft
								: questionTimeLeft
						}
					/>
				)}
				{currentQuestion.key === "truefalse" && (
					<TrueFalseComponent
						question={currentQuestion}
						onOptionSelect={(optionId) =>
							handleOptionSelect(currentQuestion.id, optionId)
						}
						disabled={
							isDisabled ||
							(!quizData.quiztimeStatus && questionTimeLeft <= 0)
						}
						timeLeft={
							quizData.quiztimeStatus
								? totalTimeLeft
								: questionTimeLeft
						}
					/>
				)}
				{currentQuestion.key === "fillintheblanks" && (
					<FillInTheBlanksComponent
						question={currentQuestion}
						onOptionSelect={(optionId) =>
							handleOptionSelect(currentQuestion.id, optionId)
						}
						disabled={
							isDisabled ||
							(!quizData.quiztimeStatus && questionTimeLeft <= 0)
						}
						timeLeft={
							quizData.quiztimeStatus
								? totalTimeLeft
								: questionTimeLeft
						}
					/>
				)}
				{currentQuestion.key === "sortanswer" && (
					<SortAnswerBlanksComponent
						question={currentQuestion}
						onOptionSelect={(optionId) =>
							handleOptionSelect(currentQuestion.id, optionId)
						}
						disabled={
							isDisabled ||
							(!quizData.quiztimeStatus && questionTimeLeft <= 0)
						}
						timeLeft={
							quizData.quiztimeStatus
								? totalTimeLeft
								: questionTimeLeft
						}
						onAnswerChange={(hasAnswer) =>
							setHasSelectedAnswer(hasAnswer)
						}
						onTextChange={(text) => setNewItemText(text)}
					/>
				)}

				<div className="flex justify-between">
					<button
						onClick={handlePreviousQuestion}
						disabled={currentQuestionIndex === 0}
						className={`bg-gray-500 text-white font-bold py-2 px-4 rounded ${
							currentQuestionIndex === 0
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-gray-700"
						}`}
					>
						Previous
					</button>

					<button
						onClick={handleNextQuestion}
						disabled={!hasSelectedAnswer}
						className={`bg-purple-600 text-white font-bold py-2 px-4 rounded ${
							!hasSelectedAnswer
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-purple-700"
						}`}
					>
						{currentQuestionIndex < questions.length - 1
							? "Next"
							: "Finish Quiz"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default QuizPlayPage;
