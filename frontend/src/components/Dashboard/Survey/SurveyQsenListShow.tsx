/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useSurvey } from "@/contexts/SurveyContext";
import { useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { RiDeleteBin5Line } from "react-icons/ri";
import { HiOutlineDuplicate } from "react-icons/hi";

import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// import SafeHTMLRenderer from "@/components/SafeHTMLRendererProps";
import ConfirmDialog from "@/utils/showConfirmDialog";
import { AxiosError } from "axios";
import Image from "next/image";
import { removeTask } from "@/stores/features/quickFormSlice";
import { toast } from "react-toastify";
import { SurveyQuestion } from "@/types/surveyTypes";
import axiosInstance from "@/utils/axiosInstance";
import {
	deleteSurveyQuestion,
	createSurveyQuestion,
} from "@/services/surveyService";

interface MenuItem {
	key: string;
	id: string;
	title?: string;
	quiz_id?: string;
	position?: number;
}

interface SortableItemProps {
	currentActiveItem: MenuItem | null;
	item: MenuItem;
	multypleselectedItem: MenuItem[];
	index: number;
	onMouseEnter: (item: MenuItem) => void;
	onMouseLeave: () => void;
	onClick: (item: MenuItem) => void;
	onDelete: (key: string) => void;
	onDuplicate: (key: string) => void;
}

function SortableItem({
	currentActiveItem,
	item,
	multypleselectedItem,
	index,
	onMouseEnter,
	onMouseLeave,
	onClick,
	onDelete,
	onDuplicate,
}: SortableItemProps) {
	const dispatch = useDispatch();
	const { state, actions } = useSurvey();
	const activePageId = state.activePageId;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	console.log("Renderable Item:", index);

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const itemList = multypleselectedItem.find((i) => i.id === item.id);
	const isActive = itemList?.id === currentActiveItem?.id;
	const displayPosition =
		itemList?.position ??
		(item as SurveyQuestion).serial_number ??
		index + 1;

	const questionsRemove = async (id: string) => {
		if (!activePageId) {
			alert("Please select a page first");
			return;
		}

		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this question?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				try {
					const response = await deleteSurveyQuestion(id);
					if (id) {
						// Remove from the active page in context
						actions.removeQuestionFromPage(activePageId, id);
						// Also remove from the survey list
						actions.removeSelectedItem({ id });
					}
				} catch (error) {
					const axiosError = error as AxiosError<{
						message?: string;
					}>;
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
						toast.error(
							"Unexpected error occurred. Please try again.",
						);
					}
				} finally {
				}
			},
		);
	};

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
	const truncateChars = (text: string, limit = 10) => {
		const plain = htmlToText(text || "").trim();
		return plain.length > limit ? plain.slice(0, limit) + "..." : plain;
	};

	return (
		<div className="relative">
			<div
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
				onMouseEnter={() => onMouseEnter(item)}
				onMouseLeave={onMouseLeave}
				className=""
			>
				<div
					className={`flex  bg-white justify-center group w-full items-center px-5 py-3 mb-3 flex-col rounded-[10px] h-[132px] cursor-grab active:cursor-grabbing
      border-2 ${isActive ? "border-[#BC5EB3]" : "border-[#2222] py-2"}
      hover:border-[#BC5EB3] transition`}
					onClick={() => onClick(item)}
				>
					{item.key === "qsenchoice" && (
						<>
							<Image
								src="/images/icons/Icon-01.svg"
								alt="Yes / No"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}
					{item.key === "sorting" && (
						<>
							<Image
								src="/images/icons/sorting.svg"
								alt="True / False"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "truefalse" && (
						<>
							<Image
								src="/images/icons/yes-no.svg"
								alt="Yes / No"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "wordcloud" && (
						<>
							<Image
								src="/images/icons/word-cloud.svg"
								alt="Word Cloud"
								width={60}
								height={60}
								className="mr-2"
							/>

							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "scales" && (
						<>
							<Image
								src="/images/icons/scales.svg"
								alt="Scales"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "ranking" && (
						<>
							<Image
								src="/images/icons/ranking.svg"
								alt="Ranking"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "shortanswer" && (
						<>
							<Image
								src="/images/icons/Icon-03.svg"
								alt="Short Answer"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "longanswer" && (
						<>
							<Image
								src="/images/icons/long-answer.svg"
								alt="Fill In The Blanks"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "quick_form" && (
						<>
							<Image
								src="/images/icons/quick-form.svg"
								alt="Quick Form"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					{item.key === "content" && (
						<>
							<Image
								src="/images/icons/content.svg"
								alt="Quick Form"
								width={60}
								height={60}
								className="mr-2"
							/>
							{truncateChars(`${item?.title}`, 15)}
						</>
					)}

					<div
						className={` absolute left-0 w-[20px] h-5 top-0 rounded-tl-[7px] rounded-br-[7px] text-[12px] items-center flex text-[#fff] justify-center group-hover:bg-[#BC5EB3] bg-[#BC5EB3] ${
							isActive ? "" : ""
						}`}
					>
						{displayPosition}
					</div>
				</div>
			</div>
			<div className="absolute z-10 right-3 bottom-3 space-y-14">
				<div className="w-[25px] mb-[3px] h-[25px] bg-orange-500 rounded-full justify-center flex items-center invisible">
					<HiOutlineDuplicate
						className=" hover:text-[#333] cursor-pointer text-[#fff]"
						size={12}
						onClick={(e) => {
							e.stopPropagation();

							onDuplicate(item.id);
						}}
					/>
				</div>
				<div className="w-[25px] h-[25px] bg-red-500 hover:bg-red-600 rounded-full justify-center flex items-center ">
					<RiDeleteBin5Line
						className=" hover:text-[#333] cursor-pointer text-[#fff]"
						size={12}
						onClick={(e) => {
							e.stopPropagation();
							questionsRemove(item.id);
							if (item.key === "quick_form" && item.quiz_id) {
								actions.removeSelectedItem({ id: item.id });
								dispatch(
									removeTask({
										quest_id: String(item.quiz_id),
										taskId: item.id,
									}),
								);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}

function SurveyQsenListShow() {
	const dispatch = useDispatch();
	const { state, actions, api } = useSurvey();
	const params = useParams();
	const qId = params?.id as string;

	// Get the active page ID and questions for that page
	const activePageId = state.activePageId;
	const questionsByPage = state.questionsByPage;
	const questionsForActivePage = activePageId
		? (questionsByPage[activePageId] as SurveyQuestion[]) || []
		: [];
	const listContainerRef = useRef<HTMLDivElement | null>(null);

	// Also get survey-specific questions for fallback
	const surveyQuestions = state.multypleselectedItem;

	// Filter survey-specific questions for the current survey
	const surveyFiltered = surveyQuestions?.filter(
		(list) => `${list?.quiz_id}` === `${qId}`,
	);

	const selectedItem = state.selectedItem;
	const orderedQuestions = useMemo(() => {
		return [...questionsForActivePage].sort((a, b) => {
			const aPos = a.position ?? (a as SurveyQuestion).serial_number ?? 0;
			const bPos = b.position ?? (b as SurveyQuestion).serial_number ?? 0;
			if (aPos !== bPos) return aPos - bPos;
			return a.id.localeCompare(b.id);
		});
	}, [questionsForActivePage]);

	useEffect(() => {
		if (listContainerRef.current) {
			listContainerRef.current.scrollTop =
				listContainerRef.current.scrollHeight;
		}
	}, [questionsForActivePage.length, activePageId]);

	const handleItemClick = (item: MenuItem) => {
		// Find the actual question from the questions for this page
		const actualQuestion = questionsForActivePage.find(
			(q) => q.id === item.id,
		);

		if (actualQuestion) {
			actions.setSelectedItem(actualQuestion);
		}
	};

	const handleMouseLeave = () => {
		actions.clearHoveredItem();
	};

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
			quiz_id: qId,
			survey_id: qId,
			page_id: activePageId || 0,
			question_text: "",
			question_type: item.key,
			serial_number: 1,
			is_required: false,
			position: 1,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!activePageId) {
			alert("Please select a page first");
			return;
		}

		const currentActive = orderedQuestions.find(
			(item) => item.id === active.id,
		);
		if (currentActive) actions.setSelectedItem(currentActive);
		if (!over || active.id === over.id) return;

		const oldIndex = orderedQuestions.findIndex(
			(item) => item.id === active.id,
		);
		const newIndex = orderedQuestions.findIndex(
			(item) => item.id === over.id,
		);

		if (oldIndex !== -1 && newIndex !== -1) {
			const newItems = arrayMove(
				orderedQuestions,
				oldIndex,
				newIndex,
			);
			const itemsWithUpdatedPositions = newItems.map((item, index) => ({
				...item,
				position: index + 1,
			}));

			// Update the page-specific questions in Redux store
			actions.setMultipleSelectedItems(itemsWithUpdatedPositions); // For survey-specific compatibility
			actions.reorderQuestionsOnPage(
				activePageId,
				itemsWithUpdatedPositions.map((item) => item.id),
			);

			const droppedItem = itemsWithUpdatedPositions[newIndex];
			actions.setSelectedItem(droppedItem);

			try {
				const questionsPayload = itemsWithUpdatedPositions.map(
					(item, index) => ({
						id: item.id,
						survey_id: item.survey_id
							? Number(item.survey_id)
							: Number(qId),
						serial_number: index + 1,
						is_required: item.is_required ?? false,
					}),
				);

				await axiosInstance.post(
					"/survey-questions/update-multiple",
					{
						questions: questionsPayload,
					},
				);
			} catch (error) {
				console.error("Failed to save reordered questions:", error);
				toast.error("Failed to save question order.");
			}
		}
	};

	const duplicateFunctionCall = async (id: string) => {
		if (!selectedItem || !activePageId) return;

		const questionData = {
			survey_id: parseInt(qId),
			page_id: activePageId,
			serial_number: questionsForActivePage.length + 1,
			question_text: selectedItem.title || ".",
			question_type: selectedItem.key,
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

		const response = await api.createQuestion(questionData);

		// Check if the response has the expected structure
		if (!response.data || !response.data.data || !response.data.data.id) {
			console.error("Invalid response structure:", response);
			toast.error(
				"Failed to duplicate question: Invalid response from server",
			);
			return;
		}

		// Add the duplicated question to the active page
		const duplicatedQuestion: SurveyQuestion = {
			key: selectedItem.key,
			id: response.data.data.id.toString(),
			title: selectedItem.title || "Untitled question",
			options: selectedItem.options,
			maxOptions: selectedItem.maxOptions,
			minOptions: selectedItem.minOptions,
			allowDuplicates: selectedItem.allowDuplicates,
			isMultipleSelection: selectedItem.isMultipleSelection,
			timeLimit: selectedItem.timeLimit,
			position: questionsForActivePage.length + 1,
			quiz_id: qId,
			survey_id: qId,
			page_id: activePageId,
			question_text: selectedItem.title || ".",
			question_type: selectedItem.key,
			serial_number: questionsForActivePage.length + 1,
			is_required: false,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		// Add to the page-specific store
		actions.addQuestionToPage(activePageId, duplicatedQuestion);

		// Also add to the global store for compatibility
		actions.duplicateItem({
			id: id,
			qid: response.data.data.id.toString(),
		});
	};

	return (
		<div
			ref={listContainerRef}
			className="h-[calc(90vh-80px)]  overflow-y-auto scrollbar-hidden"
		>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis]}
			>
				<SortableContext
					items={orderedQuestions.map((q) => q.id)}
					strategy={verticalListSortingStrategy}
				>
					<div>
						{orderedQuestions.map((item, index) => (
								<SortableItem
									key={item.id}
									item={item}
									index={index}
									multypleselectedItem={
										questionsForActivePage
									}
									onMouseEnter={handleMouseEnter}
									onMouseLeave={handleMouseLeave}
									onClick={handleItemClick}
									currentActiveItem={selectedItem}
									onDelete={() =>
										actions.removeSelectedItem({
											id: item.id,
										})
									}
									onDuplicate={() =>
										duplicateFunctionCall(item.id)
									}
								/>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default SurveyQsenListShow;
