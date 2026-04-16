/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import GlobalHorizantalBarChart from "@/components/Chart/GlobalHorizantalBarChart";
import D3WordCloud from "@/components/Chart/D3WordCloud";
import GlobalBarChart from "@/components/Chart/GlobalBarChart";
import QuickFromAnswerView from "@/components/Liveui/QuickFromAnswerView";
import QuickShortAndLongAnswer from "@/components/Liveui/QuickShortAndLongAnswer";
import { ScalesChart } from "@/components/Chart/ScalesChart";

type Question = { id: number; text: string; color?: string };
type TaskData = {
	maxNumber?: number | undefined;
	questions: Question[];
	time_limit?: number;
	time_limit_seconds?: number;
};
type Task = {
	id: number;
	quest_id: number;
	title: string;
	description: string | null;
	task_type:
		| "single_choice"
		| "multiple_choice"
		| "truefalse"
		| "fill_in_the_blanks_choice"
		| "sorting"
		| "scales"
		| "ranking"
		| "wordcloud"
		| "longanswer"
		| "shortanswer"
		| string;
	serial_number: number;
	task_data: TaskData;
	is_required: boolean;
	created_at: string;
	updated_at: string;
};

interface Creator {
	id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	email: string;
	profile_picture?: string;
}

interface Quest {
	id: number;
	title: string;
	description: string | null;
	creator_id: number;
	is_published: boolean;
	start_datetime: string;
	end_datetime: string;
	timezone: string;
	visibility: string;
	join_link: string;
	join_code: string;
	sequential_progression: boolean;
	created_at: string;
	updated_at: string;
	tasks: Task[];
	creator: Creator;
}

interface CopyQuestResponse {
	status: boolean;
	message: string;
	data?: {
		quest: Quest;
	};
}

const FALLBACK_COLORS = [
	"#3b82f6",
	"#ef4444",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#06b6d4",
	"#f97316",
];

type ViewProps = {
	currentView:
		| "single_choice"
		| "multiple_choice"
		| "truefalse"
		| "fill_in_the_blanks_choice"
		| "sorting"
		| "scales"
		| "ranking"
		| "wordcloud"
		| "quick_form"
		| "shortanswer"
		| "longanswer";
	categories: string[];
	colors: string[];
	uniqueColors: string[];
	data: number[];
	rankinData: { text: string; count: number; color?: string }[];
	values: { text: string; value: number }[];
};

function buildViewProps(task: Task): ViewProps {
	const type = (
		task.task_type || ""
	).toLowerCase() as ViewProps["currentView"];
	const questions = task.task_data?.questions ?? [];
	const categories = questions.map((q) => q.text);
	const colors = questions.map(
		(q, i) => q.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
	);
	const uniqueColors = Array.from(new Set(colors));

	const data = Array(Math.max(questions.length, 1))
		.fill(0)
		.map(() => Math.floor(Math.random() * 100) + 20);

	let rankinData: { text: string; count: number; color?: string }[] = [];
	if (type === "ranking" || type === "sorting") {
		rankinData = questions.map((q, i) => ({
			text: q.text,
			count: questions.length - i,
			color: q.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
		}));
	}

	const values: { text: string; value: number }[] =
		type === "wordcloud"
			? questions.map((q, i) => ({
					text: q.text,
					value: Math.floor(Math.random() * 10) + 1,
				}))
			: [];

	const currentView: ViewProps["currentView"] = [
		"single_choice",
		"multiple_choice",
		"truefalse",
		"fill_in_the_blanks_choice",
		"sorting",
		"scales",
		"ranking",
		"shortanswer",
		"longanswer",
		"quick_form",
		"wordcloud",
	].includes(type)
		? (type as ViewProps["currentView"])
		: "single_choice";

	return {
		currentView,
		categories,
		colors,
		uniqueColors,
		data,
		rankinData,
		values,
	};
}

function transformTaskData(task: Task) {
	if (task.task_type !== "scales") {
		return [];
	}

	const questions = task?.task_data?.questions || [];
	const result = questions.map((q, i) => ({
		text: q.text,
		value: Math.floor(Math.random() * (task.task_data?.maxNumber || 5)) + 1,
	}));

	return result;
}

function ChartPanel({ task }: { task: Task }) {
	const { currentView, categories, colors, data, rankinData, values } =
		useMemo(() => buildViewProps(task), [task]);

	const scaleItems = transformTaskData(task);

	return (
		<div className="w-full h-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
			<div className="text-center mb-4">
				<h3
					className="text-lg font-semibold text-gray-900"
					dangerouslySetInnerHTML={{ __html: task.title }}
				/>
			</div>

			<div className="h-64 flex items-center justify-center">
				{currentView === "single_choice" ||
				currentView === "multiple_choice" ||
				currentView === "truefalse" ||
				currentView === "fill_in_the_blanks_choice" ? (
					<div className="w-full h-full">
						<GlobalBarChart data={data} categories={categories} />
					</div>
				) : currentView === "scales" ? (
					<div className="w-full h-full">
						<ScalesChart
							title=""
							items={scaleItems}
							full={task?.task_data?.maxNumber}
						/>
					</div>
				) : currentView === "ranking" ? (
					<div className="w-full h-full">
						<GlobalHorizantalBarChart
							data={
								rankinData?.length > 0
									? rankinData.map((opt) => opt.count)
									: [1, 2, 3, 4]
							}
							categories={rankinData.map((opt) => opt.text)}
							colors={rankinData
								.map(
									(opt, i) =>
										opt.color || colors[i % colors.length],
								)
								.filter(Boolean)}
						/>
					</div>
				) : currentView === "sorting" ? (
					<div className="w-full h-full">
						<GlobalHorizantalBarChart
							data={
								rankinData?.length > 0
									? rankinData.map((opt) => opt.count)
									: [1, 2, 3, 4]
							}
							categories={rankinData.map((opt) => opt.text)}
							colors={rankinData
								.map(
									(opt, i) =>
										opt.color || colors[i % colors.length],
								)
								.filter(Boolean)}
						/>
					</div>
				) : currentView === "quick_form" ? (
					<div className="w-full">
						<QuickFromAnswerView
							data={{
								id: "",
								time: 120,
								user_name: "Sample User",
								answer_data: {},
							}}
						/>
					</div>
				) : currentView === "wordcloud" ? (
					<div className="w-full h-full">
						<D3WordCloud
							words={values}
							width={400}
							height={250}
							minFont={12}
							maxFont={36}
							rotate={() => (Math.random() > 0.85 ? 90 : 0)}
							// onWordClick={(w: any) => console.log("Clicked:", w)}
							className=""
						/>
					</div>
				) : currentView === "longanswer" ||
				  currentView === "shortanswer" ? (
					<div className="w-full">
						<QuickShortAndLongAnswer
							answerData={[
								"This is a sample answer for demonstration purposes.",
							]}
						/>
					</div>
				) : (
					<div className="text-center text-gray-500">
						<p>No chart preview available for this task type</p>
					</div>
				)}
			</div>
		</div>
	);
}

const taskTypes = {
	single_choice: {
		label: "Multiple Choice",
		icon: "/images/icons/Icon-01.svg",
	},
	multiple_choice: {
		label: "Multiple Choice",
		icon: "/images/icons/Icon-01.svg",
	},
	truefalse: {
		label: "Yes / No",
		icon: "/images/icons/yes-no.svg",
	},
	wordcloud: {
		label: "Word Cloud",
		icon: "/images/icons/word-cloud.svg",
	},
	scales: {
		label: "Scales",
		icon: "/images/icons/scales.svg",
	},
	ranking: {
		label: "Ranking",
		icon: "/images/icons/ranking.svg",
	},
	shortanswer: {
		label: "Short Answer",
		icon: "/images/icons/Icon-03.svg",
	},
	longanswer: {
		label: "Long Answer",
		icon: "/images/icons/long-answer.svg",
	},
	sorting: {
		label: "Sorting",
		icon: "/images/icons/sorting.svg",
	},
	quick_form: {
		label: "Quick Form",
		icon: "/images/icons/quick-form.svg",
	},
	content: {
		label: "Content",
		icon: "/images/icons/content.svg",
	},
};

export default function DiscoverQuestPage() {
	const params = useParams();
	const router = useRouter();
	const questId = params.id;

	const [quest, setQuest] = useState<Quest | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [showChart, setShowChart] = useState(true);
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

	const fetchQuestDetails = async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get(
				`/quests-public/show/${questId}`,
			);

			if (response.data.status) {
				setQuest(response.data.data.quest);
			} else {
				setError("Failed to fetch quest details");
			}
		} catch (error) {
			console.error("Error fetching quest:", error);
			setError("Error loading quest details");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (questId) {
			fetchQuestDetails();
		}
	}, [questId]);

	const handleAddToLibrary = async () => {
		if (!quest) return;

		try {
			setIsAddingToLibrary(true);

			const response = await axiosInstance.post<CopyQuestResponse>(
				`/quests/copy-with-tasks/${questId}`,
				{
					title: `${quest.title} (Copy)`,
					description: quest.description,
					is_published: false,
					visibility: "private",
					sequential_progression: quest.sequential_progression,
					timezone: quest.timezone,
					start_datetime: quest.start_datetime,
					end_datetime: quest.end_datetime,
				},
			);

			if (response.data.status) {
				showToast(
					"Quest successfully added to your library!",
					"success",
				);
				setTimeout(() => {
					router.push("/my-library/quest-page");
				}, 1500);
			} else {
				showToast(
					`Failed to add quest: ${response.data.message}`,
					"error",
				);
			}
		} catch (error: any) {
			console.error("Error adding to library:", error);

			if (error.response?.data?.message) {
				showToast(
					`Failed to add quest: ${error.response.data.message}`,
					"error",
				);
			} else if (error.response?.status === 401) {
				showToast(
					"Please log in to add quests to your library",
					"error",
				);
			} else if (error.response?.status === 403) {
				showToast(
					"You do not have permission to copy this quest",
					"error",
				);
			} else {
				showToast(
					"Failed to add quest to library. Please try again.",
					"error",
				);
			}
		} finally {
			setIsAddingToLibrary(false);
		}
	};

	const nextSlide = () => {
		if (quest && currentSlide < quest.tasks.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
	};

	const prevSlide = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
	};

	const getTaskTypeConfig = (taskType: string) => {
		return (
			taskTypes[taskType as keyof typeof taskTypes] || {
				label: taskType,
				icon: "/images/icons/content.svg",
			}
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
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

	if (error || !quest) {
		return (
			<div className="min-h-screen bg-gray-50 p-4">
				<div className="max-w-4xl mx-auto text-center py-20">
					<div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
						<span className="text-2xl"></span>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-3">
						Quest Not Found
					</h2>
					<p className="text-gray-600 mb-6">
						{error ||
							"The quest you are looking for does not exist."}
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

	const currentTask = quest.tasks[currentSlide];
	const taskConfig = getTaskTypeConfig(currentTask.task_type);

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
								<div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
									<span className="text-white text-xs">
										!
									</span>
								</div>
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
							{quest.title}
						</h1>
						<div className="w-6"></div>
						<Link
							href="/discover/discover-quest"
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
					{/* Left Panel - Quests List */}
					<div className="col-span-2 bg-white rounded-xl shadow-sm border-gray-200 p-4 overflow-hidden">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-gray-900 text-sm">
								Quests
							</h2>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
								{quest.tasks.length}
							</span>
						</div>

						<div className="space-y-2 overflow-y-auto h-screen">
							{quest.tasks.map((task, index) => {
								const taskTypeConfig = getTaskTypeConfig(
									task.task_type,
								);
								return (
									<div
										key={task.id}
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
													src={taskTypeConfig.icon}
													alt={taskTypeConfig.label}
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

					{/* Middle Panel - Current Slide Preview */}
					<div className="col-span-8 bg-white rounded-xl shadow-sm border-gray-200 p-8 flex flex-col">
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
									Quest {currentSlide + 1} of{" "}
									{quest.tasks.length}
								</span>
								<div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
									<Image
										src={taskConfig.icon}
										alt={taskConfig.label}
										width={16}
										height={16}
									/>
									<span className="text-sm font-medium text-gray-700">
										{taskConfig.label}
									</span>
								</div>
							</div>

							<button
								onClick={nextSlide}
								disabled={
									currentSlide === quest.tasks.length - 1
								}
								className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
							>
								Next
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>

						<div className="flex-1 flex flex-col">
							<AnimatePresence mode="wait">
								{!showChart ? (
									<motion.div
										key="question-view"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.2 }}
										className="flex-1 flex flex-col items-center justify-center"
									>
										<div className="text-center mb-8 max-w-3xl">
											<h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
												{currentTask.title ||
													`Task ${currentTask.serial_number}`}
											</h2>
											{currentTask.description && (
												<p className="text-xl text-gray-600 leading-relaxed">
													{currentTask.description}
												</p>
											)}
										</div>

										<div className="w-full max-w-4xl">
											{currentTask.task_data
												?.questions ? (
												<div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
													<div className="grid gap-4">
														{currentTask.task_data.questions.map(
															(
																question: any,
																index: number,
															) => (
																<div
																	key={
																		question.id
																	}
																	className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
																	style={{
																		borderLeft: `6px solid ${
																			question.color ||
																			FALLBACK_COLORS[
																				index %
																					FALLBACK_COLORS.length
																			]
																		}`,
																	}}
																>
																	<div className="flex items-center justify-between">
																		<span className="text-lg font-semibold text-gray-900">
																			{
																				question.text
																			}
																		</span>
																		{currentTask.task_type ===
																			"scales" && (
																			<div className="flex gap-2">
																				{[
																					1,
																					2,
																					3,
																					4,
																					5,
																				].map(
																					(
																						star,
																					) => (
																						<div
																							key={
																								star
																							}
																							className="w-8 h-8 bg-gray-100 rounded-lg border border-gray-200"
																						/>
																					),
																				)}
																			</div>
																		)}
																	</div>

																	{currentTask.task_type ===
																		"single_choice" && (
																		<div className="mt-4 grid gap-2">
																			{currentTask.task_data.questions.map(
																				(
																					option: any,
																					optIndex: number,
																				) => (
																					<div
																						key={
																							optIndex
																						}
																						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
																					>
																						<div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
																						<span className="text-gray-700">
																							{
																								option.text
																							}
																						</span>
																					</div>
																				),
																			)}
																		</div>
																	)}

																	{currentTask.task_type ===
																		"multiple_choice" && (
																		<div className="mt-4 grid gap-2">
																			{currentTask.task_data.questions.map(
																				(
																					option: any,
																					optIndex: number,
																				) => (
																					<div
																						key={
																							optIndex
																						}
																						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
																					>
																						<div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
																						<span className="text-gray-700">
																							{
																								option.text
																							}
																						</span>
																					</div>
																				),
																			)}
																		</div>
																	)}

																	{currentTask.task_type ===
																		"truefalse" && (
																		<div className="mt-4 flex gap-4 justify-center">
																			<button className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
																				Yes
																			</button>
																			<button className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold">
																				No
																			</button>
																		</div>
																	)}
																</div>
															),
														)}
													</div>
												</div>
											) : (
												<div className="text-center py-16">
													<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
														<Image
															src={
																taskConfig.icon
															}
															alt={
																taskConfig.label
															}
															width={40}
															height={40}
															className="text-gray-400"
														/>
													</div>
													<h3 className="text-2xl font-semibold text-gray-900 mb-2">
														{taskConfig.label} Task
													</h3>
													<p className="text-gray-600 text-lg">
														This task will be
														interactive when the
														quest starts
													</p>
												</div>
											)}
										</div>
									</motion.div>
								) : (
									<motion.div
										key="chart-view"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.2 }}
										className="flex-1"
									>
										<ChartPanel task={currentTask} />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Right Panel - Quest Details */}
					<div className="col-span-2 bg-white rounded-xl shadow-sm border-gray-200 p-4">
						<h2 className="font-semibold text-gray-900 mb-4 text-sm">
							Details
						</h2>
						<div className="space-y-3 text-xs">
							<div>
								<h3 className="font-semibold text-gray-700 mb-1">
									Schedule
								</h3>
								<div className="space-y-1">
									<div className="flex items-center gap-1">
										<Calendar className="w-3 h-3 text-gray-400" />
										<span>
											Starts{" "}
											{formatDate(quest.start_datetime)}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="w-3 h-3 text-gray-400" />
										<span>
											Ends{" "}
											{formatDate(quest.end_datetime)}
										</span>
									</div>
								</div>
							</div>

							<div>
								<h3 className="font-semibold text-gray-700 mb-1">
									Creator
								</h3>
								<p className="text-gray-600">
									{quest.creator.full_name}
								</p>
							</div>
						</div>
						<div className="space-y-2 my-4">
							<button
								onClick={handleAddToLibrary}
								disabled={isAddingToLibrary}
								className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/70 disabled:cursor-not-allowed text-white py-1.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm"
							>
								{isAddingToLibrary ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Adding...
									</>
								) : (
									<>
										<Download className="w-3 h-3" />
										Add My Library
									</>
								)}
							</button>

							<div className="grid grid-cols-2 gap-1">
								<button className="flex items-center justify-center gap-1 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xs">
									<Share2 className="w-3 h-3" />
									Share
								</button>
								<button className="flex items-center justify-center gap-1 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xs">
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
