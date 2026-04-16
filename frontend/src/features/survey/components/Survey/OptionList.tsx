import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import OptionItem from "./OptionItem";
import { MdStars } from "react-icons/md";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

export interface QuizOption {
	id: string;
	text: string;
	placeholder: string;
	color: string;
	isSelected: boolean;
}

interface OptionListProps {
	allOptions: QuizOption[];
	quizId: string;
	editingId: string | null;
	setEditingId: (id: string | null) => void;
	editText: string;
	setEditText: (text: string) => void;
	handleAddOption: () => void;
	handleRemoveOption: (optionId: string) => void;
	qsenkey?: string;
	onReorder: (fromId: string, toId: string) => void;
}

const OptionList: React.FC<OptionListProps> = ({
	allOptions,
	quizId,
	editingId,
	setEditingId,
	editText,
	setEditText,
	handleAddOption,
	handleRemoveOption,
	qsenkey,
	onReorder,
}) => {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor)
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleDragEnd = (event: any) => {
		const { active, over } = event;
		if (!over) return;
		if (active.id !== over.id) {
			onReorder(active.id, over.id);
		}
	};



	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis]}
			>
				<SortableContext
					items={allOptions.map(option => option.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="grid gap-2">
						{allOptions.map((option) => (
							<OptionItem
								key={option.id}
								option={option}
								quizId={quizId}
								editingId={editingId}
								setEditingId={setEditingId}
								editText={editText}
								setEditText={setEditText}
								handleRemoveOption={() => handleRemoveOption(option.id)}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{qsenkey !== "truefalse" && (
				<div className="flex justify-center items-center gap-4 mt-4">
					<button
						onClick={handleAddOption}
						className="py-[10px] px-[20px] bg-[#f2f1f0] text-[#171717] rounded-[10px] font-bold hover:bg-primary hover:text-white"
					>
						<div className="flex items-center gap-3">
							<MdStars size={20} /> Add option
						</div>
					</button>
				</div>
			)}
		</>
	);
};

export default OptionList;