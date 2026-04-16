"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { RootState } from "@/stores/store";
import { RiDeleteBin5Line } from "react-icons/ri";
import { HiOutlineDuplicate } from "react-icons/hi";
// import {
// 	MultypleQsenIcon,
// 	TrueFalseIcon,
// 	SortAnsIcon,
// 	FillInTheBlankIcon,
// } from "@/assets/icons";
import {
	clearHoveredItem,
	setHoveredItem,
	setSelectedItem,
	setMultipleSelectedItems,
	removeSelectedItem,
	duplicateItem,
} from "@/stores/features/quizItems/quizSlice";
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
import SafeHTMLRenderer from "@/components/SafeHTMLRendererProps";
import axiosInstance from "@/utils/axiosInstance";
import ConfirmDialog from "@/utils/showConfirmDialog";
import { AxiosError } from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
interface MenuItem {
	key: string;
	id: string;
	title?: string;
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
	onMouseEnter,
	onMouseLeave,
	onClick,
	onDelete,
	onDuplicate,
}: SortableItemProps) {
	console.log(item, "itemitemitemitemitemitem");

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const itemList = multypleselectedItem.find((i) => i.id === item.id);
	const isActive = itemList?.id === currentActiveItem?.id;

	console.log(item, "itemList");

	const questionsRemove = async (id: string) => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this questions?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				try {
					const response = await axiosInstance.delete(
						`/quiz/questions/delete/${id}`
					);
					if (id) {
						onDelete(id);
					}
					console.log(response, "transformedData");
				} catch (error) {
					const axiosError = error as AxiosError<{
						message?: string;
					}>;
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
						toast.error(
							"Unexpected error occurred. Please try again."
						);
					}
				} finally {
				}
			}
		);
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
			>
				<div
					className={`flex justify-center group mb-[15px] w-full items-center px-5 py-3  flex-col rounded-[10px] h-[132px] cursor-grab active:cursor-grabbing
          border-2 ${isActive ? "border-[#BC5EB3]" : "border-[#2222]"}
          hover:border-[#BC5EB3] transition`}
					onClick={() => onClick(item)}
				>
					{item.key === "quiz" && (
						<>
							<Image
								src="/images/icons/Icon-01.svg"
								alt="True / False"
								width={60}
								height={60}
								className="mr-2"
							/>
							<SafeHTMLRenderer
								html={`${item.title}`}
								wordLimit={10}
							/>
						</>
					)}

					{item.key === "truefalse" && (
						<>
							<Image
								src="/images/icons/Icon-02.svg"
								alt="True / False"
								width={60}
								height={60}
								className="mr-2"
							/>
							<SafeHTMLRenderer
								html={`${item.title}`}
								wordLimit={5}
							/>
						</>
					)}

					{item.key === "sortanswer" && (
						<>
							<Image
								src="/images/icons/Icon-03.svg"
								alt="Short Answer"
								width={60}
								height={60}
								className="mr-2"
							/>
							<SafeHTMLRenderer
								html={`${item.title}`}
								wordLimit={5}
							/>
						</>
					)}

					{item.key === "fillintheblanks" && (
						<>
							<Image
								src="/images/icons/Icon-04.svg"
								alt="Fill In The Blanks"
								width={60}
								height={60}
								className="mr-2"
							/>
							<SafeHTMLRenderer
								html={`${item.title}`}
								wordLimit={5}
							/>
						</>
					)}

					<div
						className={`bg-[#222] absolute left-0 w-[20px] h-5 top-0 rounded-tl-[7px] rounded-br-[7px] text-[12px] items-center flex text-[#fff] justify-center group-hover:bg-[#BC5EB3] ${
							isActive ? "bg-[#BC5EB3]" : ""
						}`}
					>
						{itemList?.position}
					</div>
				</div>
			</div>
			<div className="absolute z-10 right-2 bottom-3 space-y-14">
				<div className="w-[25px] mb-[3px] h-[25px] bg-orange-500 rounded-full justify-center flex items-center">
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
						}}
					/>
				</div>
			</div>
		</div>
	);
}

function SelectedQuizList() {
	const dispatch = useDispatch();
	const params = useParams();
	const qId = params?.quizId as string;
	const quesentList = useSelector(
		(state: RootState) => state.quiz.multypleselectedItem
	);
	const quesentList2222 = useSelector((state: RootState) => state.quiz);
	// console.log(quesentList, "quesentList quesentList ");

	const multypleselectedItem = quesentList?.filter(
		(list) => `${list?.quiz_id}` === `${qId}`
	);

	const selectedItem = useSelector(
		(state: RootState) => state.quiz.selectedItem
	);
	console.log(quesentList2222, "multypleselectedItem");

	const handleItemClick = (item: MenuItem) => {
		console.log(item, "itemmmmmmm");

		dispatch(
			setSelectedItem({
				key: item.key,
				id: item.id,
				title: "Untitled question",
				options: [],
				maxOptions: 0,
				minOptions: 0,
				allowDuplicates: false,
				isMultipleSelection: false,
				timeLimit: "",
			})
		);
	};

	const handleMouseLeave = () => {
		dispatch(clearHoveredItem());
	};

	const handleMouseEnter = (item: MenuItem) => {
		dispatch(
			setHoveredItem({
				key: item.key,
				id: item.id,
				title: "",
				options: [],
				maxOptions: 0,
				minOptions: 0,
				allowDuplicates: false,
				isMultipleSelection: false,
				timeLimit: "",
			})
		);
	};

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const currentActive = multypleselectedItem.find(
			(item) => item.id === active.id
		);
		if (currentActive) dispatch(setSelectedItem(currentActive));
		if (!over || active.id === over.id) return;

		const oldIndex = multypleselectedItem.findIndex(
			(item) => item.id === active.id
		);
		const newIndex = multypleselectedItem.findIndex(
			(item) => item.id === over.id
		);

		if (oldIndex !== -1 && newIndex !== -1) {
			const newItems = arrayMove(
				multypleselectedItem,
				oldIndex,
				newIndex
			);
			const itemsWithUpdatedPositions = newItems.map((item, index) => ({
				...item,
				position: index + 1,
			}));

			dispatch(setMultipleSelectedItems(itemsWithUpdatedPositions));
			const droppedItem = itemsWithUpdatedPositions[newIndex];
			dispatch(setSelectedItem(droppedItem));
		}
	};

	const duplicateFunctionCall = async (id: string) => {
		if (!selectedItem) return;
		const response = await axiosInstance.post(`/quiz/questions/store`, {
			quiz_id: selectedItem.quiz_id,
			question_text: ".",
			visibility: "public",
		});
		console.log(response, "currentActive");

		dispatch(
			duplicateItem({
				id: id,
				qid: response?.data?.data.question.id,
			})
		);
	};

	console.log(
		multypleselectedItem,
		"multypleselectedItemmultypleselectedItemmultypleselectedItemmultypleselectedItem"
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis]}
		>
			<SortableContext
				items={multypleselectedItem}
				strategy={verticalListSortingStrategy}
			>
				<div>
					{multypleselectedItem
						.sort((a, b) => (a.position || 0) - (b.position || 0))
						.map((item, index) => (
							<SortableItem
								key={item.id}
								item={item}
								index={index}
								multypleselectedItem={multypleselectedItem}
								onMouseEnter={handleMouseEnter}
								onMouseLeave={handleMouseLeave}
								onClick={handleItemClick}
								currentActiveItem={selectedItem}
								onDelete={() =>
									dispatch(removeSelectedItem(item))
								}
								onDuplicate={() =>
									duplicateFunctionCall(item.id)
								}
							/>
						))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

export default SelectedQuizList;
