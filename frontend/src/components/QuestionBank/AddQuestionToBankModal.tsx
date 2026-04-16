/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "@/stores/store";
import {
	setLoading,
	setError,
	setCategories,
	setCurrentQuestion,
	setFormData,
	resetState,
	setSuccess
} from "@/features/dashboard/question-bank/store/questionBankSlice";
import axiosInstance from "@/utils/axiosInstance";
import { Modal } from "@/components/ui";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { QuizItem } from "@/types/types";

// Define type for React Select option
type SelectOption = {
	value: string;
	label: string;
};

interface AddQuestionToBankModalProps {
	open: boolean;
	onClose: () => void;
	questionId: string;
	questionText: string;
	questionData?: QuizItem;
}

const AddQuestionToBankModal: React.FC<AddQuestionToBankModalProps> = ({
	open,
	onClose,
	// questionId,
	questionText,
	questionData,
}) => {
	const dispatch = useDispatch();
	const { categories, loading, error, formData } = useSelector((state: RootState) => state.questionBank);

	// State for tags
	const [selectedTags, setSelectedTags] = useState<SelectOption[]>([]);
	// State for visibility toggle
	const [visibility, setVisibility] = useState<'public' | 'private'>('public');

	// Update the form data when questionText changes
	useEffect(() => {
		if (questionText) {
			const truncatedText = questionText.substring(0, 50) + (questionText.length > 50 ? "..." : "");
			// Only update if the name is different
			if (formData.name !== truncatedText) {
				dispatch(setFormData({
					name: truncatedText,
					// Preserve other fields like tags
					tags: formData.tags || ""
				}));
			}
		}
	}, [dispatch, questionText, formData.name, formData.tags]);

	const fetchCategories = useCallback(async () => {
		try {
			dispatch(setLoading(true));
			const response = await axiosInstance.get("/quiz/question-bank-categories");

			// Handle different possible response structures for categories
			let categoriesData = [];

			if (response.data && response.data.data) {
				if (response.data.data.categories && Array.isArray(response.data.data.categories)) {
					// Direct array of categories
					categoriesData = response.data.data.categories;
				} else if (response.data.data.categories && response.data.data.categories.data) {
					// Paginated response structure
					categoriesData = response.data.data.categories.data;
				} else if (Array.isArray(response.data.data)) {
					// Direct array in data
					categoriesData = response.data.data;
				} else {
					// Other possible structures
					categoriesData = response.data.data;
				}
			}

			const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];
			dispatch(setCategories(categoriesArray));

			dispatch(setError(null));
		} catch (err) {
			console.error("Error fetching categories:", err);
			dispatch(setError("Failed to load categories. Please try again."));
		} finally {
			dispatch(setLoading(false));
		}
	}, [dispatch]);

	// Auto-select first category when categories are loaded and no category is selected
	useEffect(() => {
		if (categories.length > 0 && formData.quiz_q_bank_category_id === 0) {
			dispatch(setFormData({
				quiz_q_bank_category_id: categories[0].id
			}));
		}
	}, [categories, formData.quiz_q_bank_category_id, dispatch]);


	// Handle modal opening
	useEffect(() => {
		if (open) {
			// Reset state when modal opens
			dispatch(resetState());
			// Set the current question data
			if (questionData) {
				dispatch(setCurrentQuestion(questionData));
			}
			// Fetch categories
			fetchCategories();
		}
	}, [open, dispatch, questionData, fetchCategories]); // Removed fetchCategories from dependency array

	// Initialize tags when form data changes and modal is open
	useEffect(() => {
		if (open) {
			// Initialize selectedTags with existing tags if they exist
			if (formData.tags) {
				const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
				setSelectedTags(tagArray.map(tag => ({ value: tag, label: tag })));
			} else {
				setSelectedTags([]); // Reset tags to empty array
			}
		} else {
			// Reset tags when modal closes
			setSelectedTags([]);
		}
	}, [open]);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Comprehensive validation
		if (!formData.quiz_q_bank_category_id || formData.quiz_q_bank_category_id <= 0) {
			dispatch(setError("Please select a category"));
			return;
		}

		if (!questionData?.title || questionData.title.trim() === "") {
			dispatch(setError("Question text cannot be empty"));
			return;
		}

		if (questionData?.title.length > 500) {
			dispatch(setError("Question text is too long (maximum 500 characters)"));
			return;
		}

		// For quiz type questions, validate that there are options
		const questionType = questionData?.key?.toLowerCase() || "quiz";
		if (questionType === 'quiz' || questionType === 'truefalse') {
			if (!questionData?.options || questionData.options.length === 0) {
				dispatch(setError("Quiz questions must have at least one option"));
				return;
			}

			// Check if at least one option is selected as correct
			const hasCorrectAnswer = questionData.options.some(option => option.isSelected);
			if (!hasCorrectAnswer) {
				dispatch(setError("Please select at least one correct answer"));
				return;
			}

			// Check if options have content
			const hasEmptyOptions = questionData.options.some(option =>
				!(option.text && option.text.trim()) && !(option.placeholder && option.placeholder.trim())
			);
			if (hasEmptyOptions) {
				dispatch(setError("All options must have text content"));
				return;
			}
		}

		// Validate time limit if provided
		if (questionData?.timeLimit) {
			const timeLimit = parseInt(questionData.timeLimit);
			if (isNaN(timeLimit) || timeLimit <= 0) {
				dispatch(setError("Time limit must be a positive number"));
				return;
			}
			if (timeLimit > 3600) { // More than 1 hour
				dispatch(setError("Time limit cannot exceed 3600 seconds (1 hour)"));
				return;
			}
		}

		// Validate points if provided
		if (questionData?.points) {
			const points = parseInt(questionData.points);
			if (isNaN(points) || points <= 0) {
				dispatch(setError("Points must be a positive number"));
				return;
			}
			if (points > 100) { // Arbitrary limit
				dispatch(setError("Points cannot exceed 100"));
				return;
			}
		}


		try {
			dispatch(setLoading(true));

			// Prepare options data
			const optionsData: { choices: string[], correct_answer: number[] } = {
				choices: [],
				correct_answer: []
			};

			if (questionData?.options && Array.isArray(questionData.options)) {
				const choices: string[] = [];
				const correctAnswersIndices: number[] = [];

				questionData.options.forEach((option, index) => {
					choices.push(option.text || option.placeholder || '');

					if (option.isSelected) {
						// For the API, correct_answer should be the index of the correct option
						correctAnswersIndices.push(index);
					}
				});

				optionsData.choices = choices;
				// If no options are selected as correct, default to the first option (index 0)
				optionsData.correct_answer = correctAnswersIndices.length > 0 ? correctAnswersIndices : [0];
			}

			// Determine the question type based on the original question type - using already defined questionType above
			const finalQuestionType = questionType; // Use the questionType defined earlier

			// Convert selected tags to comma-separated string
			const tagsString = selectedTags.length > 0
				? selectedTags.map(tag => tag.label).join(',')
				: null;

			// Prepare the question data for the new API
			const questionDataForAPI = {
				q_bank_category_id: formData.quiz_q_bank_category_id,
				question_text: questionData?.title || "Untitled Question",
				question_type: finalQuestionType,
				visibility: visibility, // Use selected visibility
				time_limit_seconds: parseInt(questionData?.timeLimit || "30"),
				points: parseInt(questionData?.points || "1"),
				is_ai_generated: false,
				source_content_url: questionData?.source_content_url || null,
				options: optionsData,
				tags: tagsString
			};

			// Call the new API endpoint with the complete question data
			const response = await axiosInstance.post("/quiz/question-bank/store", questionDataForAPI);

			if (response.data.status === true || response.status === 200 || response.status === 201) {
				dispatch(setSuccess(true));
				dispatch(setError(null));
				toast.success("Question successfully added to the question bank!");
				onClose();
			} else {
				dispatch(setError(response.data.message || "Failed to add question to the question bank. Please try again."));
			}
		} catch (err: any) {
			console.error("Error adding question to bank:", err);
			dispatch(setError(err.response?.data?.message || "An error occurred while adding the question to the bank."));
		} finally {
			dispatch(setLoading(false));
		}
	};


	const handleCategoryChange = useCallback((value: string) => {
		dispatch(setFormData({
			quiz_q_bank_category_id: parseInt(value),
		}));
	}, [dispatch]);

	return (
		<Modal open={open} onClose={onClose} title="Add Question to Bank">
			{/* Display quiz data */}
			{questionData && (
				<section>
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white p-5 rounded-xl border border-slate-200 transition-shadow">
								<div className="flex items-start gap-3">
									<div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
										</svg>
									</div>
									<div className="flex-1">
										<label className="block text-sm font-semibold text-slate-800 mb-1">
											Category *
										</label>
										<p className="text-xs text-slate-600 mb-3">Select a category for this question</p>
										<Select
											instanceId="category-select"
											options={categories.map(category => ({
												label: category.name,
												value: `${category.id}`,
											})) as SelectOption[]}
											value={{
												label: categories.find(c => c.id === formData.quiz_q_bank_category_id)?.name || "",
												value: `${formData.quiz_q_bank_category_id}`,
											}}
											onChange={(selectedOption) => {
												if (selectedOption) {
													handleCategoryChange(selectedOption.value);
												}
											}}
											placeholder="Choose a category..."
											className="basic-single"
											classNamePrefix="select"
											isClearable={false}
											isSearchable={true}
										/>
									</div>
								</div>
							</div>

							<div className="bg-white p-5 rounded-xl border border-slate-200 transition-shadow">
								<div className="flex items-start gap-3">
									<div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
										</svg>
									</div>
									<div className="flex-1">
										<label className="block text-sm font-semibold text-slate-800 mb-1">
											Tags
										</label>
										<p className="text-xs text-slate-600 mb-3">Add tags to organize your questions</p>
										<CreatableSelect
											isMulti
											name="tags"
											options={[]}
											value={selectedTags}
											onChange={(newValue) => setSelectedTags(newValue as SelectOption[])}
											placeholder="Select or create tags..."
											className="basic-multi-select"
											classNamePrefix="select"
											isSearchable={true}
											isClearable={true}
											instanceId="tags-select"
										/>
										<p className="text-xs text-slate-500 mt-2">Example: science, physics, multiple-choice, astronomy</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-6 my-4 shadow-sm">
						<div className="flex items-start gap-4 mb-6">
							<div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="flex-1">
								<h3 className="font-bold text-xl text-slate-800 mb-1">Question Preview</h3>
								<p className="text-sm text-slate-600 mb-4">Review your question before adding to bank</p>

								<div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-5">
									<div className="flex items-center gap-2 mb-3">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
										</svg>
										<p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Question Text</p>
									</div>
									<p className="text-slate-900 break-words font-medium text-base leading-relaxed">{questionData.title || 'No title'}</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
									{/* Time Limit */}
									<div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
										<div className="flex items-center gap-2 mb-2">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
											</svg>
											<p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Time Limit</p>
										</div>
										<p className="text-slate-900 font-medium">{questionData.timeLimit ? `${questionData.timeLimit} seconds` : 'Not set'}</p>
									</div>

									{/* Points */}
									<div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
										<div className="flex items-center gap-2 mb-2">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
											<p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Points</p>
										</div>
										<p className="text-slate-900 font-medium">{questionData.points || '1'}</p>
									</div>

									{/* Selection Mode */}
									<div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
										<div className="flex items-center gap-2 mb-2">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
											<p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Selection Mode</p>
										</div>
										<p className="text-slate-900 font-medium">{questionData.isMultipleSelection ? 'Multiple Selection' : 'Single Selection'}</p>
									</div>
								</div>

								{/* Options */}
								<div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
									<div className="flex items-center gap-2 mb-4">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
											<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
											<path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
										</svg>
										<p className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Options</p>
									</div>
									<div className="space-y-3 max-h-60 overflow-y-auto pr-2">
										{questionData.options && Array.isArray(questionData.options) && questionData.options.length > 0 ? (
											questionData.options.map((option, index) => (
												<div
													key={option.id || `option-${index}`}
													className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${option.isSelected
														? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm'
														: 'bg-slate-50 border-slate-200 hover:bg-slate-100'
														}`}
												>
													<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${option.isSelected
														? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
														: 'bg-slate-200 text-slate-700'
														}`}>
														{String.fromCharCode(65 + index)} {/* A, B, C, etc. */}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-slate-900 font-medium">{option.text || option.placeholder || 'Empty option'}</p>
													</div>
													{option.isSelected && (
														<div className="flex-shrink-0">
															<span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
																<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
																	<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
																</svg>
																Correct
															</span>
														</div>
													)}
												</div>
											))
										) : (
											<div className="text-center py-8">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<p className="text-slate-500 italic mt-3">No options available</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

			)}

			{loading && (
				<div className="flex flex-col items-center justify-center h-64 space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary animate-pulse" viewBox="0 0 20 20" fill="currentColor">
							<path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
						</svg>
					</div>
					<span className="text-lg text-slate-600 font-medium">Adding to Question Bank...</span>
					<p className="text-sm text-slate-500">Please wait while we process your request</p>
				</div>
			)}

			{!loading && (
				<form onSubmit={handleSubmit} className="space-y-6">
					{error && (
						<div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm flex items-start gap-3 shadow-sm">
							<div className="flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
							</div>
							<span className="flex-1">{error}</span>
						</div>
					)}

					{/* Visibility Toggle */}
					<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
						<div>
							<h4 className="font-medium text-slate-800">Visibility</h4>
							<p className="text-sm text-slate-600">Control who can see this question</p>
						</div>
						<div className="flex items-center space-x-4">
							<span className={`text-sm font-medium ${visibility === 'public' ? 'text-primary' : 'text-slate-500'}`}>Public</span>
							<button
								type="button"
								onClick={() => setVisibility(visibility === 'public' ? 'private' : 'public')}
								aria-pressed={visibility === 'public'}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${visibility === 'public' ? 'bg-primary' : 'bg-gray-300'
									}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${visibility === 'public' ? 'translate-x-6' : 'translate-x-1'
										}`}
								/>
							</button>
							<span className={`text-sm font-medium ${visibility === 'private' ? 'text-primary' : 'text-slate-500'}`}>Private</span>
						</div>
					</div>

					<div className="flex justify-end space-x-3 pt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 disabled:opacity-70 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
						>
							{loading ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
									<span>Adding...</span>
								</>
							) : (
								<>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
									</svg>
									<span>Add to Bank</span>
								</>
							)}
						</button>
					</div>
				</form>
			)}
		</Modal>
	);
};

export default AddQuestionToBankModal;