/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import { useSurvey } from "@/contexts/SurveyContext";

import SurveyChoiceCreatorPreview from "./SurveyChoiceCreatorPreview";
import SurveyTrueFalseCreatorPreview from "./SurveyTrueFalseCreatorPreview";
import SurveyWordCloudCreatorPreview from "./SurveyWordCloudCreatorPreview";
import SurveyQuickFormCreatorPreview from "./SurveyQuickFormCreatorPreview";
import SurveyRankingCreatorPreview from "./SurveyRankingCreatorPreview";
// import SurveyScalesCreatorPreview from "./SurveyScalesCreatorPreview";
import SurveyshortingCreatorPreview from "./SurveyshortingCreatorPreview";
import SurveyShortAnswerCreatorPreview from "./SurveyShortAnswerCreatorPreview";

import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useParams, usePathname } from "next/navigation";
import type { Quiz } from "@/types/types";
import { PiWarningCircle } from "react-icons/pi";
import SurveyContantCreatorPreview from "./SurveyContantCreatorPreview";
import { toast } from "react-toastify";
import { SurveyQuestion } from "@/types/surveyTypes";
import SurveyRatingCreatorPreview from "./SurveyScalesCreatorPreview";

interface QuizApiResponse {
	data: Quiz;
}

function SurveyContantView() {
	const params = useParams();
	const pathname = usePathname();
	const isQuestStatus =
		pathname.includes("survey/edit") || pathname.includes("survey/create");
	const { state, actions } = useSurvey();

	// Get the active page ID and questions for that page
	const activePageId = state.activePageId;
	const questionsByPage = state.questionsByPage;
	const questionsForActivePage = activePageId
		? questionsByPage[activePageId] || []
		: [];

	const hoveredItem = state.hoveredItem;
	const selectedItem = state.selectedItem;

	const renderPreview = (item: SurveyQuestion | null) => {
		if (!item)
			return (
				<div className="h-[calc(90vh-80px)] bg-[#fff] rounded-[10px] flex flex-col justify-center items-center">
					<PiWarningCircle className="text-[60px] text-[#fda14d]" />
					<h3 className="font-bold text-[#333] pt-[15px]">
						Please create your question
					</h3>
				</div>
			);

		switch (item.key) {
			case "qsenchoice":
				return <SurveyChoiceCreatorPreview id={item.id} />;
			case "sorting":
				return <SurveyshortingCreatorPreview id={item.id} />;
			case "truefalse":
				return <SurveyTrueFalseCreatorPreview id={item.id} />;
			case "wordcloud":
				return <SurveyWordCloudCreatorPreview id={item.id} />;
			case "scales":
				return <SurveyRatingCreatorPreview id={item.id} />;
			case "ranking":
				return <SurveyRankingCreatorPreview id={item.id} />;
			case "shortanswer":
				return <SurveyShortAnswerCreatorPreview id={item.id} />;
			case "longanswer":
				return <SurveyShortAnswerCreatorPreview id={item.id} />;
			case "quick_form":
				return <SurveyQuickFormCreatorPreview id={item.id} />;
			case "content":
				return <SurveyContantCreatorPreview id={item.id} />;

			default:
				return (
					<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-[10px] h-[calc(90vh-80px)] flex flex-col">
						Coming Soon
					</div>
				);
		}
	};

	const activeItem = hoveredItem ?? selectedItem;

	useEffect(() => {
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get<QuizApiResponse>(
					`/surveys/show/${params?.id}`,
				);

				if (isQuestStatus) {
					// Extract pages and questions from the survey response
					const surveyData = response?.data?.data?.survey;
					if (surveyData && surveyData.pages) {
						// Process each page and its questions
						surveyData.pages.forEach((page: any) => {
							if (page.questions && page.questions.length > 0) {
								// Transform the questions to match SurveyQuestion interface
								const transformedQuestions = page.questions
									.map((q: any) => {
										// Parse options properly - they might be a JSON string or already an array
										let options = [];
										if (q.options) {
											try {
												// If it's a string, parse it
												if (
													typeof q.options ===
													"string"
												) {
													options = JSON.parse(
														q.options,
													);
												} else if (
													Array.isArray(q.options)
												) {
													options = q.options;
												}

												// Ensure options are in the correct format (with text property)
												options = options.map(
													(opt: any) => {
														if (
															typeof opt ===
															"string"
														) {
															return {
																id: `option-${Math.random().toString(36).substr(2, 9)}`,
																text: opt,
																color:
																	"#" +
																	Math.floor(
																		Math.random() *
																			16777215,
																	).toString(
																		16,
																	),
																placeholder: "",
																isSelected: false,
															};
														}
														return opt;
													},
												);
											} catch (e) {
												console.error(
													"Error parsing options for question",
													q.id,
													e,
												);
												options = [];
											}
										}

										return {
											key: q.question_type,
											id: q.id.toString(),
											title:
												q.question_text ||
												"Untitled question",
											options: options,
											// For scales/rating questions the API may
											// store min/max inside options[0].
											// Mirror those values onto the top-level
											// question object for UI compatibility.
											minNumber:
												options?.[0]?.minNumber ??
												q.minNumber ??
												q.task_data?.minNumber ??
												undefined,
											maxNumber:
												options?.[0]?.maxNumber ??
												q.maxNumber ??
												q.task_data?.maxNumber ??
												undefined,
											maxOptions: 0,
											minOptions: 0,
											allowDuplicates: false,
											isMultipleSelection: false,
											timeLimit: "",
											position: q.serial_number || 1,
											quiz_id: q.survey_id?.toString(),
											survey_id:
												q.survey_id?.toString() || "",
											page_id: q.page_id,
											question_text:
												q.question_text || "",
											question_type: q.question_type,
											serial_number: q.serial_number || 1,
											is_required: q.is_required || false,
											created_at:
												q.created_at ||
												new Date().toISOString(),
											updated_at:
												q.updated_at ||
												new Date().toISOString(),
										};
									})
									.sort(
										(
											a: SurveyQuestion,
											b: SurveyQuestion,
										) => {
											const aPos = a.serial_number ?? 0;
											const bPos = b.serial_number ?? 0;
											if (aPos !== bPos)
												return aPos - bPos;
											return a.id.localeCompare(b.id);
										},
									);

								// Debug: log transformed questions coming from API
								if (process.env.NODE_ENV !== "production") {
									console.debug(
										`Transformed questions for page ${page.id}:`,
										transformedQuestions,
									);
								}

								// Update the context with questions for this page
								actions.setQuestionsForPage(
									page.id,
									transformedQuestions,
								);

								// Ensure the editor's multiple-selected items are populated
								// on initial load. If the active page matches, update
								// the store. Also populate if the multypleselectedItem
								// is empty (first load) so the editor shows current data.
								if (
									activePageId === page.id ||
									state.multypleselectedItem.length === 0
								) {
									actions.setMultipleSelectedItems(
										transformedQuestions,
									);
								}
							} else {
								// Initialize with empty array if no questions found
								actions.setQuestionsForPage(page.id, []);
							}
						});
					}

					actions.setSurveyInformation(surveyData);
				}

				const quizDataWithType = {
					...response?.data?.data?.survey,
					qseaneType: `${state.surveyInformation?.qseaneType ?? ""}`,
				};
				actions.setSurveyInformation(quizDataWithType);
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				if (axiosError.response) {
					console.error(
						"Error verifying token:",
						axiosError.response.data,
					);
					toast.error(
						`Error: ${
							axiosError.response.data?.message ||
							"Verification failed."
						}`,
					);
				} else {
					console.error("Unexpected error:", axiosError.message);
					toast.error("Unexpected error occurred. Please try again.");
				}
			}
		};
		// NOTE: you fetch with params.id, so depend on params.id (not params.quizId)
		// IMPORTANT: Only fetch on mount, not when activePageId changes
		// This prevents overwriting edited data when switching between pages
		dataFetch();
	}, [
		params?.id,
		actions,
		state.surveyInformation?.qseaneType,
		isQuestStatus,
	]);

	return (
		<div>
			{questionsForActivePage?.length > 0 ? (
				renderPreview(activeItem)
			) : (
				<div className="h-[calc(90vh-80px)] bg-[#fff] rounded-lg flex flex-col justify-center items-center">
					<PiWarningCircle className="text-[60px] text-[#fda14d]" />
					<h3 className="font-bold text-[#333] pt-[15px]">
						Please create your question
					</h3>
				</div>
			)}
		</div>
	);
}

export default SurveyContantView;
