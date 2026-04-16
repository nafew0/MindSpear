import { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

interface UseSurveyAutoSaveProps {
	questionItem: any;
	surveyId: string;
	enabled?: boolean;
}

export function useSurveyAutoSave({
	questionItem,
	surveyId,
	enabled = true,
}: UseSurveyAutoSaveProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastSavedDataRef = useRef<any>(null);

	// Function to check if question data has changed
	const hasChanged = useCallback((current: any, last: any) => {
		if (!last) return true;
		return JSON.stringify(current) !== JSON.stringify(last);
	}, []);

	// Function to perform the auto-save
	const performAutoSave = useCallback(async (item: any) => {
		if (!item || !surveyId || !enabled) return;

		try {
			setIsSaving(true);
			setSaveError(null);

			// Prepare the payload for update endpoint
			const qType = item.key || item.question_type;

			// For scales/rating, send options as a single object containing only min/max
			let optionsPayload = item.options || [];
			if (qType === "scales" || qType === "rating") {
				const minNumberVal =
					item.minNumber ?? item.task_data?.minNumber ?? 1;
				const maxNumberVal =
					item.maxNumber ?? item.task_data?.maxNumber ?? 5;
				optionsPayload = [
					{
						minNumber: minNumberVal,
						maxNumber: maxNumberVal,
					},
				];
			}

			const payload = {
				id: item.id,
				survey_id: surveyId,
				title: item.title || item.question_text || '',
				description: item.description || '',
				question_type: qType,
				options: optionsPayload,
				isMultipleSelection: item.isMultipleSelection || false,
				timeLimit: item.timeLimit || "30",
				chartType: item.chartType || 'bar',
				image_url: item.image_url || '',
				is_required: item.is_required || false,
			};

			console.log("Auto-saving question with payload:", payload);	

			const response = await axiosInstance.post(
				`/survey-questions/update/${item.id}`,
				payload
			);

			if (process.env.NODE_ENV !== "production") {
				console.debug("Auto-save response:", response?.data);
			}

			if (response.status === 200 || response.status === 201) {
				setLastSavedAt(new Date());
				lastSavedDataRef.current = JSON.stringify(item);
			}
		} catch (error: any) {
			const errorMsg =
				error?.response?.data?.message ||
				"Failed to auto-save question";
			setSaveError(errorMsg);
			console.error("Auto-save error:", error);
			// Don't show toast for auto-save errors to avoid annoying the user
			// toast.error(errorMsg);
		} finally {
			setIsSaving(false);
		}
	}, [surveyId, enabled]);

	// Expose a flush function so callers can force an immediate save
	const flushSave = useCallback(async () => {
		if (!questionItem) return;
		// clear any pending timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}
		await performAutoSave(questionItem);
	}, [performAutoSave, questionItem]);

	// Setup the auto-save effect with debouncing
	useEffect(() => {
		if (!enabled || !questionItem) return;

		// Check if data has changed since last save
		if (!hasChanged(questionItem, lastSavedDataRef.current)) {
			return;
		}

		// Clear previous timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// Set new timeout for debounced save
		saveTimeoutRef.current = setTimeout(() => {
			performAutoSave(questionItem);
		}, 800); // 800ms debounce delay

		// Cleanup
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [questionItem, enabled, hasChanged, performAutoSave]);

	return {
		isSaving,
		saveError,
		lastSavedAt,
		flushSave,
	};
}
