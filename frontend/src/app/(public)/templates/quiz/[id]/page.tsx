/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import {
	ChevronLeft,
	ChevronRight,
	Share2,
	Bookmark,
	Download,
	Calendar,
	Clock,
	CheckCircle,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Import chart components
import GlobalBarChart from "@/components/Chart/GlobalBarChart";
import GlobalHorizantalBarChart from "@/components/Chart/GlobalHorizantalBarChart";
import D3WordCloud from "@/components/Chart/D3WordCloud";

// -------------------------------- Types --------------------------------
interface User {
	id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	email: string;
	profile_picture?: string;
	designation?: string;
	institution_name?: string;
}

interface QuestionOptions {
	color?: string[];
	choices?: string[];
	correct_answer?: number | boolean | string;
	correct_answers?: number[];
}

interface Question {
	id: number;
	quiz_id: number;
	serial_number: number;
	question_text: string;
	question_type:
		| "multiple_choice"
		| "true_false"
		| "text_line"
		| "paragraph"
		| "single_choice";
	time_limit_seconds: number | null;
	points: number | null;
	is_ai_generated: boolean;
	source_content_url: string | null;
	options: QuestionOptions;
	visibility: string;
	created_at: string;
	updated_at: string;
}

interface Quiz {
	id: number;
	title: string;
	description: string | null;
	category_id: number | null;
	is_published: boolean;
	is_live: boolean;
	open_datetime: string;
	close_datetime: string;
	quiztime_mode: boolean;
	duration: number | null;
	logged_in_users_only: boolean;
	safe_browser_mode: boolean;
	visibility: string;
	quiz_mode: string;
	timezone: string;
	join_link: string;
	join_code: string;
	user_id: number;
	created_at: string;
	updated_at: string;
	open_datetime_local: string;
	close_datetime_local: string;
	questions: Question[];
	user: User;
	quiz_origin: null;
}

interface CopyQuizResponse {
	status: boolean;
	message: string;
	data?: {
		quiz: Quiz;
	};
}

// Question type configuration with icons
const questionTypes = {
	multiple_choice: {
		label: "Multiple Choice",
		icon: "/images/icons/Icon-01.svg",
	},
	single_choice: {
		label: "Single Choice",
		icon: "/images/icons/Icon-01.svg",
	},
	true_false: {
		label: "True / False",
		icon: "/images/icons/yes-no.svg",
	},
	text_line: {
		label: "Text Answer",
		icon: "/images/icons/Icon-03.svg",
	},
	paragraph: {
		label: "Paragraph",
		icon: "/images/icons/long-answer.svg",
	},
};

const FALLBACK_COLORS = [
	"#3b82f6",
	"#ef4444",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#06b6d4",
	"#f97316",
];

// Chart Panel Component for Quiz Questions
function ChartPanel({ question }: { question: Question }) {
	const options = question.options || ({} as QuestionOptions);

	const generateChartData = () => {
		const choices = options.choices ?? [
			"Option A",
			"Option B",
			"Option C",
			"Option D",
		];
		const colors = options.color || FALLBACK_COLORS;

		const data = choices.map(
			(_, index) => Math.floor(Math.random() * 100) + 20,
		);

		return {
			categories: choices,
			colors: colors.slice(0, choices.length),
			data: data,
		};
	};

	const { categories, colors, data } = generateChartData();

	const renderChart = () => {
		switch (question.question_type) {
			case "multiple_choice":
			case "single_choice":
				return (
					<div className="w-full h-64">
						<GlobalBarChart
							data={data}
							categories={categories}
							colors={colors}
						/>
					</div>
				);

			case "true_false":
				const trueFalseData = [65, 35];
				const trueFalseColors = ["#10b981", "#ef4444"];
				return (
					<div className="w-full h-64">
						<GlobalBarChart
							data={trueFalseData}
							categories={["True", "False"]}
							colors={trueFalseColors}
						/>
					</div>
				);

			case "text_line":
			case "paragraph":
				const wordCloudData = [
					{ text: "Excellent", value: 10 },
					{ text: "Good", value: 8 },
					{ text: "Average", value: 6 },
					{ text: "Poor", value: 4 },
					{ text: "Needs", value: 7 },
					{ text: "Improvement", value: 5 },
					{ text: "Great", value: 9 },
					{ text: "Satisfactory", value: 6 },
				];
				return (
					<div className="w-full h-64">
						<D3WordCloud
							words={wordCloudData}
							width={500}
							height={250}
							minFont={14}
							maxFont={40}
							rotate={() => (Math.random() > 0.85 ? 90 : 0)}
							// onWordClick={(word: { text: string; value: number }) => console.log("Clicked:", word)}
							className=""
						/>
					</div>
				);

			default:
				return (
					<div className="text-center text-gray-500 py-8">
						<p>No chart preview available for this question type</p>
					</div>
				);
		}
	};

	return (
		<div className="w-full h-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
			<div className="h-64 flex items-center justify-center">
				{renderChart()}
			</div>
		</div>
	);
}

export default function DiscoverQuizPage() {
	const params = useParams();
	const router = useRouter();
	const quizId = params.id;

	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [copied, setCopied] = useState(false);
	const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
	const [toast, setToast] = useState<{
		show: boolean;
		message: string;
		type: "success" | "error";
	}>({
		show: false,
		message: "",
		type: "success",
	});

	const showToast = (message: string, type: "success" | "error") => {
		setToast({ show: true, message, type });
		setTimeout(
			() => setToast({ show: false, message: "", type: "success" }),
			3000,
		);
	};

	const fetchQuizDetails = async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get(
				`/quizes-public/show/${quizId}`,
			);

			if (response.data.status) {
				setQuiz(response.data.data.quiz);
			} else {
				setError("Failed to fetch quiz details");
			}
		} catch (err) {
			console.error("Error fetching quiz:", err);
			setError("Error loading quiz details");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (quizId) {
			fetchQuizDetails();
		}
	}, [quizId]);

	const handleAddToLibrary = async () => {
		if (!quiz) return;

		try {
			setIsAddingToLibrary(true);

			const response = await axiosInstance.post<CopyQuizResponse>(
				`/quizes/copy-with-questions/${quizId}`,
				{
					title: `${quiz.title} (Copy)`,
					description: quiz.description,
					is_published: false,
					visibility: "private",
					quiztime_mode: quiz.quiztime_mode,
					timezone: quiz.timezone,
					open_datetime: quiz.open_datetime,
					close_datetime: quiz.close_datetime,
					duration: quiz.duration,
					logged_in_users_only: quiz.logged_in_users_only,
					safe_browser_mode: quiz.safe_browser_mode,
					quiz_mode: quiz.quiz_mode,
				},
			);

			if (response.data.status) {
				showToast(
					"Quiz successfully added to your library!",
					"success",
				);
				setTimeout(() => {
					router.push("/my-library/quiz-page");
				}, 1500);
			} else {
				showToast(
					`Failed to add quiz: ${response.data.message}`,
					"error",
				);
			}
		} catch (error: any) {
			console.error("Error adding to library:", error);

			if (error.response?.data?.message) {
				showToast(
					`Failed to add quiz: ${error.response.data.message}`,
					"error",
				);
			} else if (error.response?.status === 401) {
				showToast(
					"Please log in to add quizzes to your library",
					"error",
				);
			} else if (error.response?.status === 403) {
				showToast(
					"You do not have permission to copy this quiz",
					"error",
				);
			} else {
				showToast(
					"Failed to add quiz to library. Please try again.",
					"error",
				);
			}
		} finally {
			setIsAddingToLibrary(false);
		}
	};

	const copyJoinCode = () => {
		navigator.clipboard.writeText(quiz?.join_code || "");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const nextSlide = () => {
		if (quiz && currentSlide < quiz.questions.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
	};

	const prevSlide = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
	};

	const getQuestionTypeConfig = (questionType: string) => {
		return (
			questionTypes[questionType as keyof typeof questionTypes] || {
				label: questionType,
				icon: "/images/icons/content.svg",
			}
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getDurationText = (duration: number | null) => {
		if (!duration) return "No time limit";
		return `${duration} minute${duration !== 1 ? "s" : ""}`;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-7xl mx-auto animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-2 h-96 bg-gray-200 rounded-xl"></div>
						<div className="col-span-8 h-96 bg-gray-200 rounded-xl"></div>
						<div className="col-span-2 h-96 bg-gray-200 rounded-xl"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !quiz) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-4xl mx-auto text-center py-20">
					<div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
						<span className="text-2xl">⚠️</span>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-3">
						Quiz Not Found
					</h2>
					<p className="text-gray-600 mb-6">
						{error ||
							"The quiz you are looking for does not exist."}
					</p>
					<Link
						href="/discover"
						className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
					>
						Back to Discover
					</Link>
				</div>
			</div>
		);
	}

	const currentQuestion = quiz.questions[currentSlide];
	const questionConfig = getQuestionTypeConfig(currentQuestion.question_type);

	return (
		<div className="bg-gray-50">
			{/* Toast Notification */}
			<AnimatePresence>
				{toast.show && (
					<motion.div
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -50 }}
						className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg border ${
							toast.type === "success"
								? "bg-green-50 border-green-200 text-green-800"
								: "bg-red-50 border-red-200 text-red-800"
						}`}
					>
						<div className="flex items-center gap-2">
							{toast.type === "success" ? (
								<CheckCircle className="w-5 h-5" />
							) : (
								<XCircle className="w-5 h-5" />
							)}
							<span className="font-medium">{toast.message}</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Header */}
			<div className="">
				<div className="mx-auto px-6 py-4 border-t">
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-bold text-gray-900">
							{quiz.title}
						</h1>
						<div className="w-6"></div>
						<Link
							href="/discover/discover-quiz"
							className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
						>
							← Back to Discover
						</Link>
					</div>
				</div>
			</div>

			{/* Main Content - 3 Column Layout */}
			<div className="mx-auto">
				<div className="grid grid-cols-12 gap-6">
					{/* Left Panel - Questions List */}
					<div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-gray-900 text-sm">
								Questions
							</h2>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
								{quiz.questions.length}
							</span>
						</div>

						<div className="space-y-2 overflow-y-auto h-screen">
							{quiz.questions.map((question, index) => {
								const questionTypeConfig =
									getQuestionTypeConfig(
										question.question_type,
									);
								return (
									<div
										key={question.id}
										className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
											index === currentSlide
												? "border-primary bg-primary/5"
												: "border-gray-200 hover:border-gray-300"
										}`}
										onClick={() => setCurrentSlide(index)}
									>
										<div className="flex flex-col items-center text-center">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
													index === currentSlide
														? "bg-primary"
														: "bg-gray-100"
												}`}
											>
												<Image
													src={
														questionTypeConfig.icon
													}
													alt={
														questionTypeConfig.label
													}
													width={20}
													height={20}
													className={
														index === currentSlide
															? "invert"
															: ""
													}
												/>
											</div>
											<span
												className={`text-xs font-medium ${
													index === currentSlide
														? "text-primary"
														: "text-gray-600"
												}`}
											>
												{index + 1}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Middle Panel - Current Question Preview */}
					<div className="col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
						<div className="flex items-center justify-between mb-8">
							<button
								onClick={prevSlide}
								disabled={currentSlide === 0}
								className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
							>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</button>

							<div className="flex items-center gap-4">
								<span className="text-sm text-gray-600">
									Question {currentSlide + 1} of{" "}
									{quiz.questions.length}
								</span>
								<div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
									<Image
										src={questionConfig.icon}
										alt={questionConfig.label}
										width={16}
										height={16}
									/>
									<span className="text-sm font-medium text-gray-700">
										{questionConfig.label}
									</span>
								</div>
							</div>

							<button
								onClick={nextSlide}
								disabled={
									currentSlide === quiz.questions.length - 1
								}
								className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
							>
								Next
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>

						<div className="flex-1 flex flex-col">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentQuestion.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.2 }}
									className="flex-1 flex flex-col"
								>
									<div className="text-center mb-8">
										<h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
											{currentQuestion.question_text}
										</h2>
										{quiz.description && (
											<p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
												{quiz.description}
											</p>
										)}
									</div>

									<div className="flex-1">
										<ChartPanel
											question={currentQuestion}
										/>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>

					{/* Right Panel - Quiz Details */}
					<div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
						<h2 className="font-semibold text-gray-900 mb-4 text-sm">
							Details
						</h2>

						<div className="space-y-4 text-xs">
							<div>
								<h3 className="font-semibold text-gray-700 mb-2">
									Schedule
								</h3>
								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<Calendar className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
										<div>
											<p className="font-medium">Opens</p>
											<p className="text-gray-600">
												{formatDate(quiz.open_datetime)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Clock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
										<div>
											<p className="font-medium">
												Closes
											</p>
											<p className="text-gray-600">
												{formatDate(
													quiz.close_datetime,
												)}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Clock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
										<div>
											<p className="font-medium">
												Duration
											</p>
											<p className="text-gray-600">
												{getDurationText(quiz.duration)}
											</p>
										</div>
									</div>
								</div>
							</div>

							<div>
								<h3 className="font-semibold text-gray-700 mb-2">
									Settings
								</h3>
								<div className="space-y-1 text-gray-600">
									<p>
										•{" "}
										{quiz.quiztime_mode
											? "Quiz Time Mode"
											: "Normal Mode"}
									</p>
									<p>
										•{" "}
										{quiz.safe_browser_mode
											? "Safe Browser"
											: "Normal Browser"}
									</p>
									<p>
										•{" "}
										{quiz.logged_in_users_only
											? "Login Required"
											: "Open Access"}
									</p>
									<p>
										•{" "}
										{quiz.visibility === "public"
											? "Public"
											: "Private"}
									</p>
								</div>
							</div>

							<div>
								<h3 className="font-semibold text-gray-700 mb-2">
									Creator
								</h3>
								<div className="flex items-center gap-2">
									{quiz.user.profile_picture ? (
										<Image
											src={quiz.user.profile_picture}
											alt={quiz.user.full_name}
											width={24}
											height={24}
											className="rounded-full"
										/>
									) : (
										<div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
											{quiz.user.full_name.charAt(0)}
										</div>
									)}
									<p className="text-gray-600">
										{quiz.user.full_name}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-2 mt-6">
							<button
								onClick={handleAddToLibrary}
								disabled={isAddingToLibrary}
								className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/70 disabled:cursor-not-allowed text-white py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
							>
								{isAddingToLibrary ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Adding...
									</>
								) : (
									<>
										<Download className="w-3 h-3" />
										Add to My Library
									</>
								)}
							</button>

							<div className="grid grid-cols-2 gap-2">
								<button className="flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xs">
									<Share2 className="w-3 h-3" />
									Share
								</button>
								<button className="flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xs">
									<Bookmark className="w-3 h-3" />
									Save
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
