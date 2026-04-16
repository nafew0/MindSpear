"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useSurvey } from "@/contexts/SurveyContext";
import { useSurveyAutoSave } from "@/hooks/useSurveyAutoSave";
import StylableInput from "@/lib/StylableInput";
import ConfirmDialog from "@/utils/showConfirmDialog";
import axiosInstance from "@/utils/axiosInstance";

const SurveyShortAnswerCreatorPreview: React.FC<{ id: string }> = ({ id }) => {
	const params = useParams();
	const surveyId = params?.id as string;

	const { state, actions } = useSurvey();
	const { multypleselectedItem } = state;

	const currentItem = multypleselectedItem.find((item) => item.id === id);

	// Auto-save functionality
	const { isSaving, lastSavedAt } = useSurveyAutoSave({
		questionItem: currentItem,
		surveyId,
		enabled: !!currentItem,
	});

	const questionsRemove = async () => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this survey question?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				const response = await axiosInstance.delete(
					`/survey-tasks/delete/${currentItem?.id}`,
				);
				if (currentItem)
					actions.removeSelectedItem({ id: currentItem.id });
				console.log(response);
			},
		);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
			<div className="md:col-span-9">
				<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-[10px] h-[calc(90vh-80px)] flex flex-col justify-start overflow-y-auto scrollbar-hidden">
					<StylableInput style="survey" />

					<div className="mt-6">
						<div className="p-4 bg-gray-100 rounded-md">
							<input
								type="text"
								placeholder="Enter your answer here..."
								className="w-full p-2 border rounded-md"
								disabled
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="md:col-span-3 p-4 bg-white rounded-lg h-[calc(90vh-50px)] overflow-y-auto scrollbar-hidden">
				{" "}
				{/* Auto-save indicator */}
				<div className="mb-4 flex items-center justify-between">
					<div className="text-xs text-gray-500">
						{isSaving ? (
							<span className="flex items-center gap-1">
								<span className="animate-pulse">●</span>{" "}
								Saving...
							</span>
						) : lastSavedAt ? (
							<span className="text-green-600">✓ Saved</span>
						) : null}
					</div>
				</div>
				<div className="flex gap-3 mb-6">
					<button
						onClick={questionsRemove}
						className="bg-[#f2f1f0] w-full py-2 rounded-md font-medium"
					>
						Delete
					</button>
				</div>
				<div className="bg-gray-50 p-4 rounded-md">
					<h3 className="font-medium mb-2">Question Type</h3>
					<p className="text-sm text-gray-600">Short Answer</p>
				</div>
			</div>
		</div>
	);
};

export default SurveyShortAnswerCreatorPreview;
