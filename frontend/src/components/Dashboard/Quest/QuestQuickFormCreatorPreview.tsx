/* eslint-disable @typescript-eslint/no-explicit-any */
// QuestQuickFormCreatorPreview.tsx
"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { useParams } from "next/navigation";
import StylableInput from "@/lib/StylableInput";
import axiosInstance from "@/utils/axiosInstance";
import ConfirmDialog from "@/utils/showConfirmDialog";

import QuestionsList from "./QuickFormComponents/QuestionsList";
import AddQuestionDropdown from "./QuickFormComponents/AddQuestionDropdown";
import type { QuestionBlock } from "./QuickFormComponents/quest";
import {
	ensureQuest,
	ensureTaskWithId,
	addQuestion,
	removeQuestion,
	reorderQuestions,
	setQuestionLabel,
	addOptionIfLast,
	setOptionText,
	removeOption,
	pasteOptionsReplace,
} from "@/stores/features/quickFormSlice";
import { selectTaskById } from "@/stores/features/selectors";
import { FaRegClock } from "react-icons/fa6";
import {
	updateLimitedTimeTitle,
} from "@/stores/features/quizItems/quizSlice";
import { Trash2 } from "lucide-react";
import { CustomSelect } from "@/components/FormElements/CustomSelect";

const QuestQuickFormCreatorPreview: React.FC<{ id: string }> = ({ id }) => {
	const dispatch = useDispatch();
	const params = useParams();
	const questId = String(params?.id ?? "");
	const { selectedItem, multypleselectedItem } = useSelector(
		(s: RootState) => s.quiz
	);
	const currentItem: any = multypleselectedItem.find(
		(item) => item.id === id
	);
	console.log(currentItem, "333333333333");

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// Ensure quest + the "server task" based on selectedItem.id
	const serverTaskId = useMemo(
		() => (selectedItem?.id ? Number(selectedItem.id) : undefined),
		[selectedItem?.id]
	);

	useEffect(() => {
		if (!questId) return;
		dispatch(ensureQuest({ quest_id: questId }));
	}, [dispatch, questId]);

	useEffect(() => {
		if (!questId || !serverTaskId) return;
		dispatch(ensureTaskWithId({ quest_id: questId, taskId: serverTaskId }));
	}, [dispatch, questId, serverTaskId]);

	// Pull current task + questions from slice
	const task = useSelector((s: RootState) =>
		serverTaskId ? selectTaskById(s, questId, serverTaskId) : null
	);

	// task
	// currentItem?.task_data?.questions
	const task2222 = useSelector((s: RootState) => s.quickForm);

	console.log(task2222, "tasktasktasktasktasktasktasktask");

	const questions: QuestionBlock[] = useMemo(
		() =>
			[
				...(currentItem?.task_data?.questions ?? []),
				...(task?.questions ?? []),
			]
				// dedupe by id (defaults first, task overrides)
				.reduce((acc: any[], q: any, i: number) => {
					const id = String(q?.id);
					const at = acc.findIndex((x) => String(x.id) === id);

					const normalized = {
						...(at >= 0 ? acc[at] : {}),
						...q,
						id,
						serial_number: String(q?.serial_number ?? i + 1),
						// normalize options if present (quick_form); otherwise empty array
						options: Array.isArray(q?.options)
							? q.options.map((o: any) => ({
								id: String(o.id),
								text: o.text ?? "",
							}))
							: [],
					};

					if (at === -1) acc.push(normalized);
					else acc[at] = normalized;

					return acc;
				}, [])
				.slice()
				.sort(
					(a, b) =>
						Number(a.serial_number ?? 0) -
						Number(b.serial_number ?? 0)
				) as unknown as QuestionBlock[],
		[task?.questions, currentItem?.task_data?.questions]
	);

	// const questions: QuestionBlock[] = useMemo(
	//   () =>
	//     (task?.questions ?? [])
	//       .slice()
	//       .sort((a, b) => Number(a.serial_number) - Number(b.serial_number)) as unknown as QuestionBlock[],
	//   [task?.questions]
	// );

	/** ——— handlers ——— **/
	const handleAddQuestion = useCallback(
		(type: QuestionBlock["type"]) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				addQuestion({
					quest_id: questId,
					taskId: serverTaskId,
					qType: type,
				})
			);
			setIsDropdownOpen(false);
		},
		[dispatch, questId, serverTaskId]
	);

	const handleLabelChange = useCallback(
		(qid: string, value: string) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				setQuestionLabel({
					quest_id: questId,
					taskId: serverTaskId,
					qid,
					label: value,
				})
			);
		},
		[dispatch, questId, serverTaskId]
	);

	const handleRemoveQuestion = useCallback(
		(qid: string) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				removeQuestion({ quest_id: questId, taskId: serverTaskId, qid })
			);
		},
		[dispatch, questId, serverTaskId]
	);

	const handleReorder = useCallback(
		(orderedIds: string[]) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				reorderQuestions({
					quest_id: questId,
					taskId: serverTaskId,
					orderedQIds: orderedIds,
				})
			);
		},
		[dispatch, questId, serverTaskId]
	);

	// Option helpers (pass down)
	const onAddOptionIfLastCb = useCallback(
		(qid: string) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				addOptionIfLast({
					quest_id: questId,
					taskId: serverTaskId,
					qid,
				})
			);
		},
		[dispatch, questId, serverTaskId]
	);

	const onOptionTextChangeCb = useCallback(
		(qid: string, optId: string, text: string) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				setOptionText({
					quest_id: questId,
					taskId: serverTaskId,
					qid,
					optId,
					text,
				})
			);
		},
		[dispatch, questId, serverTaskId]
	);

	const onRemoveOptionCb = useCallback(
		(qid: string, optId: string) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				removeOption({
					quest_id: questId,
					taskId: serverTaskId,
					qid,
					optId,
				})
			);
		},
		[dispatch, questId, serverTaskId]
	);

	const onPasteOptionsCb = useCallback(
		(qid: string, targetOptId: string, pasted: string) => {
			if (!questId || !serverTaskId) return;
			dispatch(
				pasteOptionsReplace({
					quest_id: questId,
					taskId: serverTaskId,
					qid,
					targetOptId,
					pasted,
				})
			);
		},
		[dispatch, questId, serverTaskId]
	);

	const confirmDeleteFromServer = useCallback(async () => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this question?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				const response = await axiosInstance.delete(
					`/quest-tasks/delete/${currentItem?.id}`
				);
				console.log(response);
			}
		);
	}, [currentItem]);

	console.log(
		questions,
		"questionsquestionsquestionsquestionsquestionsquestions"
	);

	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
			{/* Left */}
			<div className="md:col-span-9">
				<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-md h-[calc(90vh-80px)] flex flex-col overflow-y-auto scrollbar-hidden">
					<StylableInput style="quest" />
					<div className="space-y-8 mt-6">
						<QuestionsList
							questions={questions}
							onRemoveQuestion={handleRemoveQuestion}
							onLabelChange={handleLabelChange}
							onReorder={handleReorder}
							onAddOptionIfLast={onAddOptionIfLastCb}
							onOptionTextChange={onOptionTextChangeCb}
							onRemoveOption={onRemoveOptionCb}
							onPasteOptions={onPasteOptionsCb}
						/>
					</div>
				</div>
			</div>

			{/* Right */}
			<div className="md:col-span-3 p-6 bg-white rounded-md h-[calc(90vh-80px)] overflow-y-auto scrollbar-hidden">

				<div className="flex gap-3 mb-6">
					<h3 className="block text-sm font-medium"> Question type : Quick Form  </h3>
				</div>

				<div className="flex gap-3 mb-6">
					<button
						onClick={confirmDeleteFromServer}
						className="bg-[#f2f1f0] hover:bg-red-500 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 w-full py-2 rounded-md font-medium"
					>
						<Trash2 size={16} /> <span>Delete</span>
					</button>
				</div>

				<AddQuestionDropdown
					isOpen={isDropdownOpen}
					onToggle={() => setIsDropdownOpen((p) => !p)}
					onPick={handleAddQuestion}
				/>

				<CustomSelect
					className="mt-4 text-sm"
					label="Time Limit"
					items={[
						{ label: "5 Seconds", value: "5" },
						{ label: "10 Seconds", value: "10" },
						{ label: "20 Seconds", value: "20" },
						{ label: "30 Seconds", value: "30" },
						{ label: "45 Seconds", value: "45" },
						{ label: "1  Minute ", value: "60" },
						{ label: "1  Min 30 Sec", value: "90" },
						{ label: "2  Minute ", value: "120" },
						{ label: "2  Min 30 Sec", value: "150" },
						{ label: "3  Minute", value: "180" },
						{ label: "3  Min 30 Sec", value: "210" },
						{ label: "4  Minute", value: "240" },
						{ label: "4  Min 30 Sec", value: "270" },
						{ label: "5  Minute", value: "300" },
					]}
					value={`${selectedItem?.timeLimit || "30"}`}
					prefixIcon={<FaRegClock />}
					onChange={(value) =>
						dispatch(
							updateLimitedTimeTitle({ id, timeLimit: value })
						)
					}
				/>
			</div>
		</div>
	);
};

export default React.memo(QuestQuickFormCreatorPreview);
