"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSurvey } from "@/contexts/SurveyContext";
import { useSurveyAutoSave } from "@/hooks/useSurveyAutoSave";
import StylableInput from "@/lib/StylableInput";
import ConfirmDialog from "@/utils/showConfirmDialog";
import axiosInstance from "@/utils/axiosInstance";
import next from "next";

const SurveyRatingCreatorPreview: React.FC<{ id: string }> = ({ id }) => {
	const params = useParams();
	const surveyId = params?.id as string;

	const { state, actions } = useSurvey();
	const { multypleselectedItem } = state;

	const currentItem = multypleselectedItem.find(
		(item) => String(item.id) === String(id),
	);
	const [minValue, setMinValue] = useState(() => {
		const fromOptions = (currentItem as any)?.options?.[0]?.minNumber;
		return (
			fromOptions ??
			(currentItem as any)?.task_data?.minNumber ??
			currentItem?.minNumber ??
			1
		);
	});
	const [maxValue, setMaxValue] = useState(() => {
		const fromOptions = (currentItem as any)?.options?.[0]?.maxNumber;
		return (
			fromOptions ??
			(currentItem as any)?.task_data?.maxNumber ??
			currentItem?.maxNumber ??
			5
		);
	});

	// Auto-save functionality - pass the actual values with memoization
	const itemToSave = useMemo(
		() =>
			currentItem
				? {
						...currentItem,
						minNumber: minValue,
						maxNumber: maxValue,
					}
				: null,
		[currentItem?.id, minValue, maxValue],
	);

	console.log("Rendering SurveyRatingCreatorPreview with item:", itemToSave);

	// Derive simple values used for syncing so we can list them in deps
	const derivedOptionMin: number | undefined = (() => {
		if (!currentItem) return undefined;
		const opts = Array.isArray((currentItem as any).options)
			? (currentItem as any).options
			: undefined;
		return opts && opts[0] ? (opts[0] as any).minNumber : undefined;
	})();
	const derivedOptionMax: number | undefined = (() => {
		if (!currentItem) return undefined;
		const opts = Array.isArray((currentItem as any).options)
			? (currentItem as any).options
			: undefined;
		return opts && opts[0] ? (opts[0] as any).maxNumber : undefined;
	})();
	const derivedTaskMin: number | undefined = (currentItem as any)?.task_data
		?.minNumber;
	const derivedTaskMax: number | undefined = (currentItem as any)?.task_data
		?.maxNumber;

	// Only initialize min/max when the selected question changes. This avoids
	// overwriting user edits while they are typing.
	const prevItemIdRef = useRef<string | number | undefined>(undefined);
	useEffect(() => {
		if (!currentItem) return;
		// If the item id hasn't changed, don't sync (prevents clobbering edits)
		if (prevItemIdRef.current === currentItem.id) return;
		prevItemIdRef.current = currentItem.id;

		const nextMin =
			derivedOptionMin ?? derivedTaskMin ?? currentItem?.minNumber ?? 1;
		const nextMax =
			derivedOptionMax ?? derivedTaskMax ?? currentItem?.maxNumber ?? 5;

		if (typeof nextMin === "number") setMinValue(nextMin);
		if (typeof nextMax === "number") setMaxValue(nextMax);
	}, [currentItem?.id]);

	const { isSaving, lastSavedAt, flushSave } = useSurveyAutoSave({
		questionItem: itemToSave,
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

	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const value = raw === "" ? NaN : parseInt(raw, 10);
		if (Number.isNaN(value)) return; // ignore invalid intermediate values
		setMinValue(value);
		if (currentItem) {
			actions.scalesMaxMinData({
				id: currentItem.id,
				minNumber: value,
				maxNumber: maxValue,
			});
			// force immediate save so server receives updated bounds
			flushSave?.();
		}
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const value = raw === "" ? NaN : parseInt(raw, 10);
		if (Number.isNaN(value)) return; // ignore invalid intermediate values
		setMaxValue(value);
		if (currentItem) {
			actions.scalesMaxMinData({
				id: currentItem.id,
				minNumber: minValue,
				maxNumber: value,
			});
			// force immediate save so server receives updated bounds
			flushSave?.();
		}
	};

	// Generate scale values
	const scaleValues = [];
	const start = Number.isFinite(minValue) ? minValue : 1;
	const end = Number.isFinite(maxValue) ? maxValue : 5;
	for (let i = start; i <= end; i++) {
		scaleValues.push(i);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
			<div className="md:col-span-9">
				<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-[10px] h-[calc(90vh-80px)] flex flex-col justify-start overflow-y-auto scrollbar-hidden">
					<StylableInput style="survey" />

					<div className="mt-6">
						<div className="p-4 bg-gray-100 rounded-md">
							<div className="flex justify-between mb-2">
								<span>{minValue}</span>
								<span>{maxValue}</span>
							</div>
							<div className="flex justify-between">
								{scaleValues.map((value) => (
									<div
										key={value}
										className="flex flex-col items-center"
									>
										<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
											{value}
										</div>
									</div>
								))}
							</div>
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
				<div className="bg-gray-50 p-4 rounded-md mb-4">
					<h3 className="font-medium mb-2">Scale Settings</h3>
					<div className="space-y-3">
						<div>
							<label className="block text-sm mb-1">
								Min Value
							</label>
							<input
								type="number"
								value={minValue}
								onChange={handleMinChange}
								className="w-full p-2 border rounded-md"
							/>
						</div>
						<div>
							<label className="block text-sm mb-1">
								Max Value
							</label>
							<input
								type="number"
								value={maxValue}
								onChange={handleMaxChange}
								className="w-full p-2 border rounded-md"
							/>
						</div>
					</div>
				</div>
				<div className="bg-gray-50 p-4 rounded-md">
					<h3 className="font-medium mb-2">Question Type</h3>
					<p className="text-sm text-gray-600">Scales</p>
				</div>
			</div>
		</div>
	);
};

export default SurveyRatingCreatorPreview;
