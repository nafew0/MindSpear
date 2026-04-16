"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSurvey } from "@/contexts/SurveyContext";
import { useSurveyAutoSave } from "@/hooks/useSurveyAutoSave";
import StylableInput from "@/lib/StylableInput";
import { Select } from "@/components/FormElements/select";
import { FaRegClock } from "react-icons/fa";
import axiosInstance from "@/utils/axiosInstance";
import ConfirmDialog from "@/utils/showConfirmDialog";
import QuestionChart from "../Quest/QuestionChart";
import ChartTypeSelector from "../Quest/ChartTypeSelector";
import OptionList from "./OptionList";

const SurveyChoiceCreatorPreview: React.FC<{ id: string }> = ({ id }) => {
	const params = useParams();
	const surveyId = params?.id as string;

	const { state, actions } = useSurvey();
	const { selectedItem, multypleselectedItem } = state;
	const isMultipleSelection = selectedItem?.isMultipleSelection ?? false;

	const currentItem = multypleselectedItem.find((item) => item.id === id);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const allOptions: any = currentItem?.options || [];

	// Auto-save functionality
	const { isSaving, lastSavedAt } = useSurveyAutoSave({
		questionItem: currentItem,
		surveyId,
		enabled: !!currentItem,
	});

	const [chartType, setChartType] = useState<"bar" | "pie" | "donut">("bar");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editText, setEditText] = useState("");
	const [series, setSeries] = useState<number[]>([]);
	const [labels, setLabels] = useState<string[]>([]);

	useEffect(() => {
		if (allOptions.length > 0) {
			const newLabels = allOptions.map(
				(opt: { text: string; placeholder: string }) =>
					opt.text?.trim() || opt.placeholder || "",
			);
			setLabels(newLabels);

			const randomValues = allOptions.map(() =>
				Math.floor(Math.random() * 100),
			);
			setLabels(newLabels);
			setSeries(randomValues);
			setTimeout(() => setSeries(allOptions.map(() => 0)), 1500);
		}
	}, [allOptions, chartType]);

	const questionsRemove = async () => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this survey?",
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
	const handleReorder = (fromId: string, toId: string) => {
		actions.reorderOptions({
			quizId: id,
			fromId,
			toId,
		});
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
			<div className="md:col-span-9">
				<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-[10px] h-[calc(90vh-80px)] flex flex-col justify-end overflow-y-auto scrollbar-hidden">
					<StylableInput style="survey" />

					<QuestionChart
						chartType={chartType}
						series={series}
						labels={labels}
						colors={allOptions.map(
							(opt: { color: string }) => opt.color || "",
						)}
					/>
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
				<div className="mb-6">
					<label className="flex items-center cursor-pointer justify-between">
						<div className="text-[#1a1a1a] font-medium text-[0.875rem]">
							{isMultipleSelection
								? "Select Multiple Answer"
								: "Select Single Answer"}
						</div>

						<div className="relative">
							<input
								type="checkbox"
								className="sr-only"
								checked={!!isMultipleSelection}
								onChange={() =>
									actions.toggleSwitchSelectionMode({
										id,
										isMultipleSelection:
											!isMultipleSelection,
									})
								}
							/>
							<div
								className={`block w-14 h-8 rounded-full ${
									isMultipleSelection
										? "bg-primary"
										: "bg-gray-400"
								}`}
							></div>
							<div
								className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
									isMultipleSelection
										? "transform translate-x-6"
										: ""
								}`}
							></div>
						</div>
					</label>
				</div>
				<div className="mb-[20px]">
					<h3 className="pb-4 text-[#1a1a1a] font-medium text-[0.875rem]">
						Visualization type
					</h3>
					<ChartTypeSelector
						chartType={chartType}
						setChartType={setChartType}
					/>
				</div>
				<OptionList
					allOptions={allOptions}
					quizId={id}
					editingId={editingId}
					setEditingId={setEditingId}
					editText={editText}
					setEditText={setEditText}
					handleAddOption={() =>
						actions.addSurveyOption({
							id,
							option: {
								text: "",
								color: "#3b82f6",
								isSelected: false,
							},
						})
					}
					handleRemoveOption={(optionId) =>
						actions.removeSurveyOption({ id, optionId })
					}
					onReorder={handleReorder}
				/>
				<Select
					className="mt-4 text-sm"
					label="Time limit"
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
						actions.updateLimitedTimeTitle({
							id,
							timeLimit: `${value}` === `0` ? `30` : `${value}`,
						})
					}
				/>
			</div>
		</div>
	);
};

export default SurveyChoiceCreatorPreview;
