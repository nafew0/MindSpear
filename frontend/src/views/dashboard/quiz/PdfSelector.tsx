"use client";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import moment from "@/lib/dayjs";
type Page = { id: number; thumbnail: string; text: string };

export default function PageSelector({
	pages,
	onGenerate,
}: {
	pages: Page[];
	onGenerate: (
		selectedPages: number[],
		topic: string,
		questionCount: string,
		questionType: string[],
		difficulty: string,
		audienceLevel: string,
		focusArea: string
	) => void;
}) {
	const [selectionMode, setSelectionMode] = useState<"all" | "range">(
		pages.length > 30 ? "range" : "all"
	);
	const params = useParams();
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [topic, setTopic] = useState("");
	const [questionCount, setQuestionCount] = useState("");
	const [difficulty, setDifficulty] = useState("Medium");
	const [audienceLevel, setAudienceLevel] = useState("Graduate");
	const [focusArea, setFocusArea] = useState("");
	const [questionType, setQuestionType] = useState<string[]>([
		"multiple_choice",
		"single_choice",
		"true_false",
		"fill_in_the_blanks",
		"short_answer",
	]);
	const [error, setError] = useState<string>("");

	const MAX_SELECTION = 30;

	const handleToggle = (id: number) => {
		setSelectedIds((prev) => {
			if (prev.includes(id)) {
				return prev.filter((x) => x !== id);
			} else {
				if (prev.length >= MAX_SELECTION) {
					setError(
						`You can select a maximum of ${MAX_SELECTION} pages.`
					);
					return prev;
				}
				setError("");
				return [...prev, id];
			}
		});
	};

	// Handle toggling checkbox selections
	const handleCheckboxChange = (value: string) => {
		setQuestionType((prev) => {
			if (prev.includes(value)) {
				return prev.filter((item) => item !== value); // Remove from array
			} else {
				return [...prev, value]; // Add to array
			}
		});
	};
	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const handleGenerate = async () => {
		if (!topic.trim()) {
			setError("Topic is required.");
			return;
		}
		if (!questionCount.trim() || parseInt(questionCount) <= 0) {
			setError("Please enter a valid number of questions.");
			return;
		}
		if (parseInt(questionCount) > 30) {
			setError("You can select a maximum of 30 questions.");
			return;
		}
		if (questionType.length === 0) {
			setError("Please select at least one question type.");
			return;
		}
		if (parseInt(questionCount) > 30) {
			setError("You can select a maximum of 30 questions.");
			return;
		}
		if (selectionMode === "range" && selectedIds.length > MAX_SELECTION) {
			setError(
				`You can select a maximum of ${MAX_SELECTION} specific pages. Currently selected: ${selectedIds.length}.`
			);
			return;
		}
		if (selectionMode === "all" && pages.length > MAX_SELECTION) {
			setError(
				`Total pages exceed ${MAX_SELECTION}. Please select specific pages instead.`
			);
			return;
		}

		const selectedPages =
			selectionMode === "all" ? pages.map((p) => p.id) : selectedIds;
		// const selectedText = pages
		// 	.filter((p) => selectedPages.includes(p.id))
		// 	.map((p) => p.text)
		// 	.join("\n");

		await onGenerate(
			selectedPages,
			topic,
			questionCount,
			questionType,
			difficulty,
			audienceLevel,
			focusArea
		);
		try {
			const formattedData = {
				title: topic,
				open_datetime: moment(new Date()).format(
					"YYYY-MM-DD HH:mm:ss"
				),
				close_datetime: moment(new Date(Date.now() + 24 * 60 * 60 * 1000)).format(
					"YYYY-MM-DD HH:mm:ss"
				),
				timezone: `${currentTimeZone}`,
				is_published: true
			};
			await axiosInstance.post(
				`/quizes/update/${params?.quizId}`,
				formattedData
			);
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

			if (axiosError.response) {
				console.error(
					"Error verifying token:",
					axiosError.response.data
				);
			} else {
				console.error("Unexpected error:", axiosError.message);
			}
		}

		setError("");
	};

	return (
		<div className="p-3">
			<div className="flex">
				<div className="w-2/3 h-96 overflow-y-auto px-2">
					<div className="flex justify-center gap-6 mb-6">
						<label
							className={`flex items-center gap-2 ${
								pages.length > 30
									? "opacity-50 cursor-not-allowed"
									: ""
							}`}
						>
							<input
								type="radio"
								name="mode"
								checked={selectionMode === "all"}
								onChange={() =>
									pages.length <= 30 &&
									setSelectionMode("all")
								}
								className="accent-primary"
								disabled={pages.length > 30}
							/>
							<span className="text-sm font-medium">
								All Pages
							</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								name="mode"
								checked={selectionMode === "range"}
								onChange={() => setSelectionMode("range")}
								className="accent-primary border border-primary"
							/>
							<span className="text-sm font-medium">
								Select Specific Pages
							</span>
						</label>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{pages.map((p) => {
							const isSelected =
								selectionMode === "all" ||
								selectedIds.includes(p.id);
							return (
								<div
									key={p.id}
									onClick={() =>
										selectionMode === "range" &&
										handleToggle(p.id)
									}
									className={`relative rounded-lg overflow-hidden shadow-sm transition border-2 ${
										isSelected
											? "border-primary shadow-md scale-105"
											: "border-gray-200"
									} cursor-pointer hover:shadow-lg`}
								>
									<img
										src={p.thumbnail}
										alt={`Page ${p.id}`}
										className="w-full h-auto object-cover"
									/>
									<div className="absolute top-2 left-2 text-xs font-semibold bg-white px-2 py-1 rounded shadow">
										Page {p.id}
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className="w-1/3">
					<div className=" h-96 overflow-y-auto">
						<div className="ml-3">
							<div className="bg-gray-50 p-6 rounded-lg">
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Topic
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={topic}
										onChange={(e) =>
											setTopic(e.target.value)
										}
										required
										className="w-full p-3 border border-primary outline-none focus:border-primary rounded-lg"
										placeholder="Enter topic name"
									/>
									{error.includes("Topic") && (
										<p className="text-red-500 text-sm mt-1">
											{error}
										</p>
									)}
								</div>

								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Number of Questions (max 30){" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="number"
										value={questionCount}
										onChange={(e) =>
											setQuestionCount(e.target.value)
										}
										className="w-full p-3 border border-primary outline-none focus:border-primary rounded-lg"
										max="30"
										placeholder="Enter number of questions"
									/>
									{error.includes("number of questions") ||
									error.includes("maximum of 30") ? (
										<p className="text-red-500 text-sm mt-1">
											{error}
										</p>
									) : null}
								</div>
								{/* Question Type (Checkboxes) */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Question Type{" "}
										<span className="text-red-500">*</span>
									</label>
									<div className="flex flex-col gap-2">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												name="questionType"
												value="multiple_choice"
												checked={questionType.includes(
													"multiple_choice"
												)}
												onChange={() =>
													handleCheckboxChange(
														"multiple_choice"
													)
												}
												className="accent-primary"
											/>
											<span className="text-sm font-medium">
												Multiple Choice
											</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												name="questionType"
												value="single_choice"
												checked={questionType.includes(
													"single_choice"
												)}
												onChange={() =>
													handleCheckboxChange(
														"single_choice"
													)
												}
												className="accent-primary"
											/>
											<span className="text-sm font-medium">
												Single Choice
											</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												name="questionType"
												value="true_false"
												checked={questionType.includes(
													"true_false"
												)}
												onChange={() =>
													handleCheckboxChange(
														"true_false"
													)
												}
												className="accent-primary"
											/>
											<span className="text-sm font-medium">
												True/False
											</span>
										</label>

										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												name="questionType"
												value="short_answer"
												checked={questionType.includes(
													"short_answer"
												)}
												onChange={() =>
													handleCheckboxChange(
														"short_answer"
													)
												}
												className="accent-primary"
											/>
											<span className="text-sm font-medium">
												Short Answer
											</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												name="questionType"
												value="fill_in_the_blanks"
												checked={questionType.includes(
													"fill_in_the_blanks"
												)}
												onChange={() =>
													handleCheckboxChange(
														"fill_in_the_blanks"
													)
												}
												className="accent-primary"
											/>
											<span className="text-sm font-medium">
												Fill in the Blanks
											</span>
										</label>
										{error.includes("question type") && (
											<p className="text-red-500 text-sm mt-1">
												{error}
											</p>
										)}
									</div>
								</div>
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Difficulty Level{" "}
										<span className="text-red-500">*</span>
									</label>
									<select
										value={difficulty}
										onChange={(e) =>
											setDifficulty(e.target.value)
										}
										className="w-full p-3 border border-primary outline-none focus:border-primary rounded-lg"
									>
										<option value="Easy">Easy</option>
										<option value="Medium">Medium</option>
										<option value="Hard">Hard</option>
										<option value="Hard">Very Hard</option>
									</select>
								</div>

								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Audience Level{" "}
										<span className="text-red-500">*</span>
									</label>
									<select
										value={audienceLevel}
										onChange={(e) =>
											setAudienceLevel(e.target.value)
										}
										className="w-full p-3 border border-primary outline-none focus:border-primary rounded-lg"
									>
										<option value="Generic">Generic</option>
										<option value="School">School</option>
										<option value="College">College</option>
										<option value="Graduate">
											Graduate
										</option>
										<option value="PhD">Ph.D</option>
									</select>
								</div>

								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Specific Focus Area
									</label>
									<input
										type="text"
										value={focusArea}
										onChange={(e) =>
											setFocusArea(e.target.value)
										}
										className="w-full p-3 border border-primary outline-none focus:border-primary rounded-lg"
										placeholder="Enter specific focus area (optional)"
									/>
								</div>
							</div>
						</div>
					</div>
					{/* Error Display */}
					{error && (
						<div className="text-red-500 text-sm px-4 py-2 mt-3 rounded border border-red-300 bg-red-50">
							{error}
						</div>
					)}
					<div className="text-center mt-6 flex justify-end">
						<button
							onClick={handleGenerate}
							className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary transition"
						>
							Generate Quiz
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
