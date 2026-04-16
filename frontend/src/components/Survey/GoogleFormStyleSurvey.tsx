/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

interface SurveyQuestion {
	id: number;
	question_text: string;
	question_type: string;
	serial_number: number;
	is_required: boolean;
	minNumber?: number;
	maxNumber?: number;
	metadata?: Record<string, any>;
	options?: any[];
}

interface SurveyPage {
	id: number;
	title: string;
	page_number: number;
	description?: string;
	questions?: SurveyQuestion[];
}

interface SurveyData {
	id: number;
	title: string;
	description?: string | null;
	pages: SurveyPage[];
	creator: {
		full_name: string;
	};
	is_published: boolean;
}

interface SurveyFormStyleProps {
	surveyId: string | number;
	onSubmit?: (responses: any) => void;
	showProgressBar?: boolean;
	multiPageView?: boolean;
}

interface FormResponses {
	[questionId: number]: any;
}

const normalizeQuestionType = (type: string) =>
	String(type || "")
		.trim()
		.toLowerCase();

const stripHtml = (value: string) =>
	String(value || "")
		.replace(/<[^>]*>/g, "")
		.trim();

const GoogleFormStyleSurvey: React.FC<SurveyFormStyleProps> = ({
	surveyId,
	onSubmit,
	showProgressBar = true,
	multiPageView = true,
}) => {
	const [survey, setSurvey] = useState<SurveyData | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [responses, setResponses] = useState<FormResponses>({});

	// Fetch survey data
	useEffect(() => {
		const fetchSurvey = async () => {
			try {
				const response = await axiosInstance.get(
					`/surveys-public/show/${surveyId}`,
				);
				if (response.data.status) {
					setSurvey(response.data.data.survey);
				}
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				toast.error(
					axiosError.response?.data?.message ||
						"Failed to load survey",
				);
			} finally {
				setLoading(false);
			}
		};

		if (surveyId) {
			fetchSurvey();
		}
	}, [surveyId]);

	const handleResponse = useCallback((questionId: number, value: any) => {
		setResponses((prev) => ({
			...prev,
			[questionId]: value,
		}));
	}, []);

	const handleSubmit = async () => {
		// Validate required fields
		const allQuestions =
			survey?.pages
				?.flatMap((p) => p.questions || [])
				?.filter((q) => q) || [];
		const missingRequired = allQuestions.filter(
			(q) =>
				q?.is_required &&
				(responses[q?.id] === undefined ||
					responses[q?.id] === "" ||
					responses[q?.id] === null),
		);

		if (missingRequired.length > 0) {
			toast.error(
				`Please fill in ${missingRequired.length} required field(s)`,
			);
			return;
		}

		try {
			setSubmitting(true);
			// Format responses for submission
			const formattedResponses = Object.entries(responses).map(
				([qId, answer]) => ({
					question_id: parseInt(qId),
					answer: answer,
				}),
			);

			// Call onSubmit callback if provided
			if (onSubmit) {
				await onSubmit({
					survey_id: surveyId,
					responses: formattedResponses,
					answered_at: new Date().toISOString(),
				});
			}

			setSubmitted(true);
			toast.success("Survey submitted successfully!");

			// Reset after 2 seconds
			setTimeout(() => {
				setResponses({});
				setCurrentPage(0);
				setSubmitted(false);
			}, 2000);
		} catch (error) {
			toast.error("Failed to submit survey");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full dark:bg-dark-2">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-4 rounded w-3/4"></div>
						<div className="h-4 bg-gray-4 rounded w-full"></div>
						<div className="h-4 bg-gray-4 rounded w-5/6"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!survey) {
		return (
			<div className="min-h-screen bg-gray flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-lg p-8 text-center dark:bg-dark-2">
					<h2 className="text-xl font-semibold text-dark dark:text-white">
						Survey not found
					</h2>
				</div>
			</div>
		);
	}

	// Get current page content
	const pages = survey?.pages || [];
	const currentPageData = multiPageView ? pages[currentPage] : null;
	const allQuestions = pages
		.flatMap((p) => p?.questions || [])
		.filter((q) => q);
	const questionsToShow = multiPageView
		? (currentPageData?.questions || []).filter((q) => q)
		: allQuestions;

	const totalPages = multiPageView ? Math.max(1, pages.length) : 1;
	const totalQuestions = Math.max(1, allQuestions.length);
	const answeredQuestions = Object.keys(responses).length;

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray to-gray-2 py-8 px-4 dark:from-dark-2 dark:to-dark-1">
			{/* Submitted Success State */}
			<AnimatePresence>
				{submitted && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					>
						<div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-sm dark:bg-dark-2">
							<CheckCircle2 className="w-16 h-16 text-green mx-auto mb-4" />
							<h3 className="text-2xl font-bold text-dark dark:text-white mb-2">
								Thank You!
							</h3>
							<p className="text-dark-5 dark:text-dark-6">
								Your response has been recorded.
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="max-w-2xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-t-xl shadow-sm p-8 mb-1 dark:bg-dark-2"
				>
					<h1 className="text-4xl font-bold text-dark dark:text-white mb-2">
						{survey.title}
					</h1>
					{survey.description && (
						<p className="text-dark-5 dark:text-dark-6 text-lg leading-relaxed">
							{survey.description}
						</p>
					)}
					<div className="mt-4 text-sm text-dark-5 dark:text-dark-6">
						By {survey.creator?.full_name}
					</div>

					{/* Page Header (for multi-page view) */}
					{multiPageView && currentPageData && (
						<div className="mt-6 pt-6 border-t border-stroke dark:border-stroke-dark">
							<h2 className="text-2xl font-semibold text-dark dark:text-white mb-2">
								{currentPageData.title ||
									`Page ${currentPageData.page_number}`}
							</h2>
							{currentPageData.description && (
								<p className="text-dark-5 dark:text-dark-6">
									{currentPageData.description}
								</p>
							)}
						</div>
					)}
				</motion.div>

				{/* Progress Bar */}
				{showProgressBar && (
					<div className="bg-white px-8 pt-4 border-b border-stroke dark:border-stroke-dark dark:bg-dark-2">
						<div className="flex items-center justify-between text-sm text-dark-5 dark:text-dark-6 mb-2">
							<span>
								{answeredQuestions} of {totalQuestions} answered
							</span>
							{multiPageView && (
								<span>
									Page {currentPage + 1} of {totalPages}
								</span>
							)}
						</div>
						<div className="w-full h-2 bg-gray-4 rounded-full overflow-hidden mb-4 dark:bg-dark-3">
							<motion.div
								className="h-full bg-primary"
								initial={{ width: 0 }}
								animate={{
									width: `${(answeredQuestions / totalQuestions) * 100}%`,
								}}
								transition={{ duration: 0.3 }}
							/>
						</div>
					</div>
				)}

				{/* Questions Container */}
				<motion.div
					className="bg-white shadow-sm p-8 space-y-8 dark:bg-dark-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<AnimatePresence mode="wait">
						{questionsToShow.map((question, index) => (
							<QuestionCard
								key={question.id}
								question={question}
								index={index + 1}
								response={responses[question.id]}
								onResponse={(value) =>
									handleResponse(question.id, value)
								}
							/>
						))}
					</AnimatePresence>
				</motion.div>

				{/* Footer with Navigation and Submit */}
				<motion.div
					className="bg-white rounded-b-xl shadow-sm p-8 flex items-center justify-between gap-4 border-t border-stroke dark:border-stroke-dark dark:bg-dark-2"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="flex gap-3">
						{multiPageView && currentPage > 0 && (
							<button
								onClick={() => setCurrentPage(currentPage - 1)}
								className="px-6 py-2 border border-stroke dark:border-stroke-dark rounded-lg text-dark dark:text-white font-medium hover:bg-gray dark:hover:bg-dark-3 transition-colors"
							>
								← Previous
							</button>
						)}
					</div>

					<div className="flex-1" />

					<div className="flex gap-3">
						{multiPageView && currentPage < totalPages - 1 ? (
							<button
								onClick={() => setCurrentPage(currentPage + 1)}
								className="px-6 py-2 border border-stroke dark:border-stroke-dark rounded-lg text-dark dark:text-white font-medium hover:bg-gray dark:hover:bg-dark-3 transition-colors"
							>
								Next →
							</button>
						) : (
							<button
								onClick={handleSubmit}
								disabled={submitting}
								className="px-8 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:bg-opacity-50 transition-colors flex items-center gap-2"
							>
								{submitting ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Submitting...
									</>
								) : (
									<>
										<Send className="w-4 h-4" />
										Submit
									</>
								)}
							</button>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	);
};

// Question Card Component
interface QuestionCardProps {
	question: SurveyQuestion;
	index: number;
	response: any;
	onResponse: (value: any) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
	question,
	index,
	response,
	onResponse,
}) => {
	const handleOptionClick = (optionText: string) => {
		if (
			normalizeQuestionType(question.question_type) ===
				"multiple_choice" ||
			normalizeQuestionType(question.question_type) === "checkbox" ||
			normalizeQuestionType(question.question_type) === "qsenchoice"
		) {
			const current = Array.isArray(response) ? response : [];
			const updated = current.includes(optionText)
				? current.filter((item) => item !== optionText)
				: [...current, optionText];
			onResponse(updated);
		} else {
			onResponse(optionText);
		}
	};

	const options = question.options || [];

	return (
		<motion.div
			className="pb-6"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2 }}
		>
			<div className="mb-4">
				<label className="block text-lg font-medium text-gray-900 mb-2">
					{index}. {stripHtml(question.question_text)}
					{question.is_required && (
						<span className="text-red-500 ml-1">*</span>
					)}
				</label>
				{question.metadata?.description && (
					<p className="text-sm text-gray-600 mb-3">
						{question.metadata.description}
					</p>
				)}
			</div>

			<RenderQuestionInput
				question={question}
				response={response}
				onResponse={onResponse}
				onOptionClick={handleOptionClick}
				options={options}
			/>
		</motion.div>
	);
};

// Render Question Input based on type
interface RenderQuestionInputProps {
	question: SurveyQuestion;
	response: any;
	onResponse: (value: any) => void;
	onOptionClick: (option: string) => void;
	options: any[];
}

const RenderQuestionInput: React.FC<RenderQuestionInputProps> = ({
	question,
	response,
	onResponse,
	onOptionClick,
	options,
}) => {
	const questionType = normalizeQuestionType(question.question_type);

	switch (questionType) {
		case "multiple_choice":
		case "checkbox":
		case "qsenchoice":
			const checkboxOptions = options || [];
			return (
				<div className="space-y-3">
					{checkboxOptions.map((option, idx) => (
						<label
							key={idx}
							className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-white hover:border-blue-400 transition-all"
						>
							<input
								type="checkbox"
								checked={
									Array.isArray(response) &&
									response.includes(
										option?.text || String(option),
									)
								}
								onChange={() =>
									onOptionClick(
										option?.text || String(option),
									)
								}
								className="w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer"
							/>
							<span className="text-gray-700">
								{option?.text || String(option)}
							</span>
						</label>
					))}
				</div>
			);

		case "single_choice":
		case "radio":
			const radioOptions = options || [];
			return (
				<div className="space-y-3">
					{radioOptions.map((option, idx) => (
						<label
							key={idx}
							className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-white hover:border-blue-400 transition-all"
						>
							<input
								type="radio"
								name={`question-${question.id}`}
								id={`option-${idx}`}
								checked={
									response ===
									(option?.text || String(option))
								}
								onChange={() =>
									onOptionClick(
										option?.text || String(option),
									)
								}
								className="w-5 h-5 text-blue-600 border-gray-300 cursor-pointer"
							/>
							<span className="text-gray-700">
								{option?.text || String(option)}
							</span>
						</label>
					))}
				</div>
			);

		case "truefalse":
		case "yes_no":
			return (
				<div className="flex gap-3">
					{["Yes", "No"].map((option) => (
						<button
							key={option}
							onClick={() => onResponse(option)}
							className={`flex-1 py-3 rounded-lg font-medium transition-all border-2 ${
								response === option
									? "bg-blue-600 text-white border-blue-600"
									: "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
							}`}
						>
							{option}
						</button>
					))}
				</div>
			);

		case "short_text":
		case "text_line":
		case "shortanswer":
			return (
				<input
					type="text"
					value={response || ""}
					onChange={(e) => onResponse(e.target.value)}
					placeholder="Your answer..."
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
				/>
			);

		case "long_text":
		case "paragraph":
		case "longanswer":
			return (
				<textarea
					value={response || ""}
					onChange={(e) => onResponse(e.target.value)}
					placeholder="Your answer..."
					rows={5}
					className="w-full px-4 py-3 border border-stroke dark:border-stroke-dark rounded-lg focus:outline-none focus:border-primary transition-colors resize-none dark:bg-dark-3 dark:text-white"
				/>
			);

		case "scales":
		case "rating":
			// Prefer min/max defined in question.options[0] (new backend shape),
			// then metadata/task fields, then direct fields, then defaults.
			const optMin = question.options?.[0]?.minNumber;
			const optMax = question.options?.[0]?.maxNumber;
			const minNumber = Number(
				optMin ??
					question.metadata?.minNumber ??
					question.minNumber ??
					1,
			);
			const maxNumberRaw = Number(
				optMax ??
					question.metadata?.maxNumber ??
					question.maxNumber ??
					5,
			);
			// allow reasonable upper bound (e.g., 100) but respect provided min/max
			const validMaxNumber = Math.max(
				minNumber,
				Math.min(100, maxNumberRaw || 5),
			);
			const count = Math.max(1, validMaxNumber - minNumber + 1);
			return (
				<div className="flex flex-col gap-4">
					<div className="flex gap-3 justify-center flex-wrap">
						{Array.from({ length: count }, (_, i) => {
							const num = minNumber + i;
							return (
								<button
									key={num}
									onClick={() => onResponse(num)}
									className={`w-14 h-14 rounded-full font-bold text-lg transition-all border-2 flex items-center justify-center ${
										response === num
											? "bg-primary text-white border-primary shadow-lg scale-110"
											: "bg-white dark:bg-dark-3 text-dark dark:text-white border-stroke dark:border-stroke-dark hover:border-primary hover:bg-gray dark:hover:bg-dark-4"
									}`}
								>
									{num}
								</button>
							);
						})}
					</div>
					<div className="flex justify-between text-xs text-dark-5 dark:text-dark-6 px-4">
						<span>Not satisfied</span>
						<span>Very satisfied</span>
					</div>
				</div>
			);

		case "dropdown":
		case "select":
			const selectOptions = options || [];
			return (
				<select
					value={response || ""}
					onChange={(e) => onResponse(e.target.value)}
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
				>
					<option value="">Select an option...</option>
					{selectOptions.map((option, idx) => (
						<option
							key={idx}
							value={option?.text || String(option) || ""}
						>
							{option?.text || String(option) || ""}
						</option>
					))}
				</select>
			);

		case "ranking":
		case "sorting":
			const rankOptions = options || [];
			return (
				<div className="space-y-2">
					<p className="text-sm text-dark-5 dark:text-dark-6 mb-4">
						Drag to reorder items or click to rank them
					</p>
					{rankOptions.map((option, idx) => (
						<div
							key={idx}
							className="flex items-center gap-3 p-3 rounded-lg border-2 border-stroke dark:border-stroke-dark hover:border-primary transition-all bg-white dark:bg-dark-3"
						>
							<div className="flex items-center justify-center w-10 h-10 bg-gray-2 dark:bg-dark-4 rounded-lg text-sm font-semibold text-dark dark:text-white">
								{idx + 1}
							</div>
							<span className="flex-1 text-dark dark:text-white font-medium">
								{option?.text || String(option)}
							</span>
							<div className="flex gap-1">
								{rankOptions.map((_, rankIdx) => (
									<button
										key={rankIdx}
										onClick={() => {
											const next = Array.isArray(response)
												? [...response]
												: new Array(rankOptions.length);
											next[idx] = rankIdx + 1;
											onResponse(next);
										}}
										className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
											response?.[idx] === rankIdx + 1
												? "bg-primary text-white"
												: "bg-gray-2 dark:bg-dark-4 text-dark dark:text-white hover:bg-gray-3 dark:hover:bg-dark-3"
										}`}
									>
										{rankIdx + 1}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			);

		case "wordcloud":
			const [wordInput, setWordInput] = React.useState("");
			const words = Array.isArray(response) ? response : [];
			return (
				<div className="space-y-3">
					<div className="flex gap-2">
						<input
							type="text"
							value={wordInput}
							onChange={(e) => setWordInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && wordInput.trim()) {
									e.preventDefault();
									onResponse([...words, wordInput.trim()]);
									setWordInput("");
								}
							}}
							placeholder="Enter a word and press Enter"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
						/>
						<button
							onClick={() => {
								if (wordInput.trim()) {
									onResponse([...words, wordInput.trim()]);
									setWordInput("");
								}
							}}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
						>
							Add
						</button>
					</div>
					{words.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-2">
							{words.map((word, idx) => (
								<div
									key={idx}
									className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
								>
									{word}
									<button
										onClick={() => {
											onResponse(
												words.filter(
													(_, i) => i !== idx,
												),
											);
										}}
										className="text-blue-600 hover:text-blue-900 font-bold"
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			);

		case "quick_form":
			const qfOptions = question.options || [];
			return (
				<div className="space-y-3">
					{qfOptions.length > 0 ? (
						qfOptions.map((option, idx) => {
							const isSelected =
								response === option.id || response === idx;
							return (
								<button
									key={idx}
									onClick={() => onResponse(option.id || idx)}
									className={`w-full p-4 text-left rounded-lg border-2 transition-all font-medium ${
										isSelected
											? "border-blue-600 bg-blue-50 text-blue-800"
											: "border-gray-300 bg-white text-gray-800 hover:border-blue-500"
									}`}
								>
									<div className="flex items-start gap-3">
										<div
											className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
												isSelected
													? "border-blue-600 bg-blue-600"
													: "border-gray-400"
											}`}
										>
											{isSelected && (
												<div className="w-2 h-2 bg-white rounded-full" />
											)}
										</div>
										<div>
											<div>
												{option.option_text ||
													option.label ||
													option.title ||
													option}
											</div>
											{option.description && (
												<div className="text-xs text-gray-500 mt-1">
													{option.description}
												</div>
											)}
										</div>
									</div>
								</button>
							);
						})
					) : (
						<div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-center">
							This is a quick form block for live sessions.
						</div>
					)}
				</div>
			);

		default:
			return (
				<input
					type="text"
					value={response || ""}
					onChange={(e) => onResponse(e.target.value)}
					placeholder="Your answer..."
					className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
				/>
			);
	}
};

export default GoogleFormStyleSurvey;
