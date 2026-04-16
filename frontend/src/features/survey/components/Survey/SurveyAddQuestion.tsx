/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { Tooltip } from "antd";
import { AiOutlineQuestion } from "react-icons/ai";
import SurveyQsenListShow from "./SurveyQsenListShow";
import {
	Dropdown,
	DropdownContent,
	DropdownTrigger,
} from "@/components/ui/Dropdown";
import { useSurvey } from "@/contexts/SurveyContext";
import { setDropdownOpen } from "@/features/dashboard/store/dropdownSlice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import PdfModal from "@/features/quiz/components/PdfQuiz/PdfModal";
import { useParams } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { SurveyQuestion } from "@/types/surveyTypes";
import { SurveyQuestionRequest } from "@/features/survey/services/surveyService";
import { toast } from "react-toastify";

interface MenuItem {
	key: string;
	id: string;
	label: string;
	icon: React.ReactNode;
}

const SurveyAddQuestion: React.FC = () => {
	const params = useParams();
	const qId = params?.id as string;
	const [isDropDownOpen, setIsDropDownOpen] = useState(false);
	const [showPdfModal, setShowPdfModal] = useState(false);

	const { state, actions, api } = useSurvey();
	const activePageId = state.activePageId;
	const dispatch = useDispatch();

	const items = [
		{
			key: "qsenchoice",
			id: "1",
			label: "Multiple Choice",
			icon: (
				<Image
					src="/images/icons/Icon-01.svg"
					alt="Multiple Choice"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "truefalse",
			id: "2",
			label: "Yes / No",
			icon: (
				<Image
					src="/images/icons/yes-no.svg"
					alt="Yes / No"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "wordcloud",
			id: "3",
			label: "Word Cloud",
			icon: (
				<Image
					src="/images/icons/word-cloud.svg"
					alt="Word Cloud"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "scales",
			id: "4",
			label: "Scales",
			icon: (
				<Image
					src="/images/icons/scales.svg"
					alt="Scales"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "ranking",
			id: "5",
			label: "Ranking",
			icon: (
				<Image
					src="/images/icons/ranking.svg"
					alt="Ranking"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "shortanswer",
			id: "6",
			label: "Short Answer",
			icon: (
				<Image
					src="/images/icons/Icon-03.svg"
					alt="Short Answer"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},

		{
			key: "longanswer",
			id: "7",
			label: "Long Answer",
			icon: (
				<Image
					src="/images/icons/long-answer.svg"
					alt="Long Answer"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "sorting",
			id: "8",
			label: "Sorting",
			icon: (
				<Image
					src="/images/icons/sorting.svg"
					alt="Sorting"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "quick_form",
			id: "9",
			label: "Quick Form",
			icon: (
				<Image
					src="/images/icons/quick-form.svg"
					alt="Quick Form"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},

		{
			key: "content",
			id: "10",
			label: "Content",
			icon: (
				<Image
					src="/images/icons/content.svg"
					alt="Content"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
	];

	const handleDropdownToggle = (
		value: boolean | ((prev: boolean) => boolean),
	) => {
		if (typeof value === "function") {
			setIsDropDownOpen((prev) => {
				const next = value(prev);
				dispatch(setDropdownOpen(next));
				return next;
			});
		} else {
			setIsDropDownOpen(value);
			dispatch(setDropdownOpen(value));
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			dispatch(setDropdownOpen(false));
			setIsDropDownOpen(false);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [dispatch]);

	const handleMouseEnter = (item: MenuItem) => {
		actions.setHoveredItem({
			key: item.key,
			id: item.id,
			title: "",
			options: [],
			maxOptions: 0,
			minOptions: 0,
			allowDuplicates: false,
			isMultipleSelection: false,
			timeLimit: "",
			position: 1,
			quiz_id: `${qId}`,
			survey_id: `${qId}`,
			page_id: activePageId || 0,
			question_text: ".",
			question_type: item.key,
			serial_number: 1,
			is_required: false,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	};

	// Get the current count of questions for the active page to determine the position
	const questionsForActivePage = activePageId
		? state.questionsByPage[activePageId] || []
		: [];

	const handleItemClick = async (item: MenuItem) => {
		if (!activePageId) {
			alert("Please select a page first");
			return;
		}

		const normalizeOptions = (rawOptions: any) => {
			let options: any[] = [];
			if (!rawOptions) return options;
			try {
				if (typeof rawOptions === "string") {
					options = JSON.parse(rawOptions);
				} else if (Array.isArray(rawOptions)) {
					options = rawOptions;
				}
			} catch (error) {
				console.error("Error parsing options:", error);
				options = [];
			}

			return options.map((opt: any, index: number) => {
				if (typeof opt === "string") {
					return {
						id: `option-${Date.now()}-${index}`,
						text: opt,
						label: opt,
						placeholder: "",
						color:
							"#" +
							Math.floor(Math.random() * 16777215).toString(16),
						isSelected: false,
					};
				}
				return opt;
			});
		};

		const refreshQuestionsForPage = async (
			pageId: number,
			focusQuestionId?: string,
		) => {
			try {
				const pageResponse = await api.fetchQuestionsByPage(pageId);
				const rawQuestions =
					pageResponse.data?.data?.questions ||
					pageResponse.data?.data ||
					pageResponse.data ||
					[];

				if (!Array.isArray(rawQuestions)) return;

				const transformedQuestions = rawQuestions
					.map((q: any) => {
						return {
							key: q.question_type,
							id: q.id.toString(),
							title: q.question_text || "",
							options: normalizeOptions(q.options),
							maxOptions: 0,
							minOptions: 0,
							allowDuplicates: false,
							isMultipleSelection: false,
							timeLimit: "",
							position: q.serial_number || 1,
							quiz_id: q.survey_id?.toString(),
							survey_id: q.survey_id?.toString() || "",
							page_id: q.page_id,
							question_text: q.question_text || "",
							question_type: q.question_type,
							serial_number: q.serial_number || 1,
							is_required: q.is_required || false,
							created_at:
								q.created_at || new Date().toISOString(),
							updated_at:
								q.updated_at || new Date().toISOString(),
						};
					})
					.sort((a: SurveyQuestion, b: SurveyQuestion) => {
						const aPos = a.serial_number ?? 0;
						const bPos = b.serial_number ?? 0;
						if (aPos !== bPos) return aPos - bPos;
						return a.id.localeCompare(b.id);
					});

				actions.setQuestionsForPage(pageId, transformedQuestions);
				actions.setMultipleSelectedItems(transformedQuestions);

				if (focusQuestionId) {
					const focused = transformedQuestions.find(
						(q: SurveyQuestion) => q.id === focusQuestionId,
					);
					if (focused) {
						actions.setSelectedItem(focused);
					}
				}
			} catch (error) {
				console.error("Failed to refresh questions:", error);
			}
		};

		// Prepare options based on question type
		const getOptionsForType = (questionType: string) => {
			const optionsMap: { [key: string]: string[] } = {
				qsenchoice: ["Option 1", "Option 2", "Option 3"],
				truefalse: ["Yes", "No"],
				scales: ["1", "2", "3", "4", "5"],
				ranking: ["Item 1", "Item 2", "Item 3"],
				wordcloud: [],
				shortanswer: [],
				longanswer: [],
				sorting: ["Item 1", "Item 2", "Item 3"],
				quick_form: [],
				content: [],
			};
			return optionsMap[questionType] || [];
		};

		let currentCount = questionsForActivePage.length;
		if (currentCount === 0 && activePageId) {
			try {
				const pageResponse =
					await api.fetchQuestionsByPage(activePageId);
				const rawQuestions =
					pageResponse.data?.data?.questions ||
					pageResponse.data?.data ||
					pageResponse.data ||
					[];
				if (Array.isArray(rawQuestions)) {
					currentCount = rawQuestions.length;
				}
			} catch (error) {
				console.error("Failed to fetch question count:", error);
			}
		}

		const questionData: SurveyQuestionRequest = {
			survey_id: parseInt(qId),
			page_id: activePageId || 1,
			serial_number: currentCount + 1,
			question_text: ".",
			question_type: `${item?.key}`,
			options: getOptionsForType(item?.key),
			is_required: false,
			has_conditional_logic: false,
			conditional_parent_type: null,
			conditional_question_id: null,
			conditional_page_id: null,
			conditional_value: null,
			conditional_operator: "equals",
			display_type: "default",
			display_conditions: null,
		};

		// If creating a scales question, send options as a single {minNumber,maxNumber}
		if (item?.key === "scales") {
			const sourceItem = state.selectedItem || state.hoveredItem;
			const minNumberVal =
				(sourceItem as any)?.minNumber ??
				(sourceItem as any)?.task_data?.minNumber ??
				1;
			const maxNumberVal =
				(sourceItem as any)?.maxNumber ??
				(sourceItem as any)?.task_data?.maxNumber ??
				5;

			questionData.options = [
				{
					minNumber: minNumberVal,
					maxNumber: maxNumberVal,
				},
			];
		}

		const response = await api.createQuestion(questionData);

		// Check if the response has the expected structure
		if (
			!response.data ||
			!response.data.data ||
			!response.data.data.question
		) {
			toast.error(
				"Failed to create question: Invalid response from server",
			);
			return;
		}

		const questionFromServer = response.data.data.question;

		// Convert string options to OptionItem objects with unique IDs
		const convertedOptions = (questionFromServer.options || []).map(
			(opt: string | any, index: number) => ({
				id: `option-${Date.now()}-${index}`,
				text: typeof opt === "string" ? opt : opt.text || "",
				label: typeof opt === "string" ? opt : opt.label || "",
				placeholder: "",
				color: "#000",
				isSelected: false,
			}),
		);

		// Create the question object
		const newSerialNumber =
			questionFromServer.serial_number || currentCount + 1;

		const newQuestion: SurveyQuestion = {
			key: item.key,
			id: questionFromServer.id.toString(),
			title: questionFromServer.question_text || "",
			options: convertedOptions,
			maxOptions: 0,
			minOptions: 0,
			allowDuplicates: false,
			isMultipleSelection: false,
			timeLimit: "",
			position: newSerialNumber,
			survey_id: `${qId}`,
			page_id: activePageId || 0,
			question_text: questionFromServer.question_text || ".",
			question_type: questionFromServer.question_type,
			serial_number: newSerialNumber,
			is_required: questionFromServer.is_required,
			created_at: questionFromServer.created_at,
			updated_at: questionFromServer.updated_at,
		};

		// Add to the active page in Redux store
		actions.addQuestionToPage(activePageId, newQuestion);

		// Also add to the global survey store for compatibility
		actions.addNewSurveyItem(newQuestion);

		// Select the newly created question to show the editor
		actions.setSelectedItem(newQuestion);

		await refreshQuestionsForPage(activePageId, newQuestion.id);

		toast.success("Question created successfully!");
		setIsDropDownOpen(false);
	};

	const handleMouseLeave = () => {
		actions.clearHoveredItem();
	};

	return (
		<div className="w-full flex flex-col min-h-0">
			<Dropdown isOpen={isDropDownOpen} setIsOpen={handleDropdownToggle}>
				<DropdownTrigger className="w-full">
					<div className="flex justify-center items-center w-full">
						<div className="flex  text-sm w-full mb-[20px] px-4 mt-[5px] cursor-pointer items-center justify-center gap-2 rounded-md bg-primary p-2 font-medium text-white transition hover:bg-opacity-90">
							<FilePlus2 size={15} /> <span>Add Question</span>
						</div>
					</div>
				</DropdownTrigger>

				<DropdownContent className="w-[365px] absolute z-9999 left-[190px] ">
					<div className=" bg-[#fff] shadow-default p-[15px] rounded-md">
						<p className="flex items-center justify-between">
							<span className="flex items-center">
								{" "}
								Interactive questions
								<Tooltip
									placement="top"
									title="Get real-time input from your audience with these question formats.Get real-time input from your audience with these question formats."
								>
									<AiOutlineQuestion className="ml-2 cursor-pointer" />
								</Tooltip>
							</span>
							<IoIosClose
								onClick={() => setIsDropDownOpen(false)}
								className="cursor-pointer"
								size={30}
							/>{" "}
						</p>
						<div className="grid grid-cols-2 gap-2 mt-[10px] ">
							{items.map((item) => (
								<div
									key={item.id}
									onMouseEnter={() => handleMouseEnter(item)}
									onMouseLeave={handleMouseLeave}
									onClick={() => handleItemClick(item)}
									className="group flex cursor-pointer px-4 py-3 rounded-lg hover:bg-gray-100 transition"
								>
									<span> {item.icon} </span>
									{}
									<span className="text-sm font-medium text-gray-800">
										{item.label}
									</span>
								</div>
							))}
						</div>
					</div>
				</DropdownContent>
			</Dropdown>

			<div className="w-full flex-1 overflow-y-auto scrollbar-hidden">
				<SurveyQsenListShow />
				{/* Show PDF Modal */}
				{showPdfModal && (
					<PdfModal onClose={() => setShowPdfModal(false)} />
				)}
			</div>
		</div>
	);
};

export default SurveyAddQuestion;
