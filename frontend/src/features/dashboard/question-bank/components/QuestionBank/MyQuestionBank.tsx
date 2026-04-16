/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Folder, AlertTriangle, CheckCircle, X, Search, Eye, Edit3, Trash2, ChevronDown, ChevronUp, ListCollapse, BookOpen, Type, Zap, Clock4, Link, Calendar, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import GlobalPagination from "@/components/GlobalPagination";
import { Modal } from "@/components/ui";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

// Define interfaces for the new data structure
interface OptionData {
	choices: string[];
	correct_answer: number[] | string;
}

interface Category {
	id: number;
	name: string;
	description: string | null;
	is_parent: boolean;
	parent_category_id: number | null;
	created_by: number;
	created_at: string;
	updated_at: string;
}

interface Question {
	id: number;
	q_bank_category_id: number;
	owner_id: number;
	question_text: string;
	question_type: string;
	time_limit_seconds: number | null;
	points: number | null;
	is_ai_generated: boolean;
	source_content_url: string | null;
	visibility: string;
	options: OptionData;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
	category: Category | null;
}

interface QuestionResponse {
	current_page: number;
	data: Question[];
	first_page_url: string;
	from: number;
	last_page: number;
	last_page_url: string;
	links: Array<{
		url: string | null;
		label: string;
		page: number | null;
		active: boolean;
	}>;
	next_page_url: string | null;
	path: string;
	per_page: number;
	prev_page_url: string | null;
	to: number;
	total: number;
}

interface ApiResponse {
	status: boolean;
	message: string;
	data: {
		questions: QuestionResponse;
	};
}

// Helper function for relative date formatting (same as in QuestionBankCategories)
const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	// Calculate different time units
	const secondsInMinute = 60;
	const secondsInHour = 3600;
	const secondsInDay = 86400;
	const secondsInWeek = 604800;
	const secondsInMonth = 2592000; // Approximate
	const secondsInYear = 31536000;

	if (diffInSeconds < secondsInMinute) {
		return 'Just now';
	} else if (diffInSeconds < secondsInHour) {
		const minutes = Math.floor(diffInSeconds / secondsInMinute);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < secondsInDay) {
		const hours = Math.floor(diffInSeconds / secondsInHour);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < secondsInWeek) {
		const days = Math.floor(diffInSeconds / secondsInDay);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < secondsInMonth) {
		const weeks = Math.floor(diffInSeconds / secondsInWeek);
		return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < secondsInYear) {
		const months = Math.floor(diffInSeconds / secondsInMonth);
		return `${months} month${months > 1 ? 's' : ''} ago`;
	} else {
		const years = Math.floor(diffInSeconds / secondsInYear);
		return `${years} year${years > 1 ? 's' : ''} ago`;
	}
};

// Helper function to get question type icon
const getQuestionTypeIcon = (type: string) => {
	switch (type.toLowerCase()) {
		case 'quiz':
			return "/images/icons/Icon-01.svg";
		case 'truefalse':
		case 'true_false':
			return "/images/icons/yes-no.svg";
		case 'shortanswer':
		case 'short_answer':
			return "/images/icons/Icon-03.svg";
		case 'fillintheblanks':
		case 'fill_in_the_blanks':
			return "/images/icons/long-answer.svg";
		default:
			return "/images/icons/Icon-01.svg"; // Default icon
	}
};

export default function MyQuestionBank() {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
	const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [total, setTotal] = useState<number>(0);
	const [perPage, setPerPage] = useState<number>(12);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
	const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<Question | null>(null);
	const [detailedQuestion, setDetailedQuestion] = useState<any>(null);
	const [detailLoading, setDetailLoading] = useState<boolean>(false);
	const [optionsCollapsed, setOptionsCollapsed] = useState<boolean>(false);

	// Ref for the search debounce timer
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Fetch categories for the filter
	const fetchCategories = useCallback(async () => {
		try {
			const response = await axiosInstance.get("/quiz/question-bank-categories");
			if (response.data.status) {
				setCategories(response.data.data.categories.data || []);
			}
		} catch (err) {
			console.error("Error fetching categories:", err);
		}
	}, []);

	// Memoize fetchQuestions to prevent recreation on each render
	const fetchQuestions = useCallback(async () => {
		setLoading(true);
		try {
			// Build query parameters for search, filter, and pagination
			const params = new URLSearchParams();
			if (debouncedSearchTerm) {
				params.append('search', debouncedSearchTerm);
			}
			if (categoryFilter) {
				params.append('q_bank_category_id', categoryFilter.toString());
			}
			params.append('page', currentPage.toString());
			params.append('per_page', perPage.toString());

			const queryString = params.toString();
			const endpoint = `/quiz/question-bank/my${queryString ? '?' + queryString : ''}`;

			const response = await axiosInstance.get<ApiResponse>(endpoint);
			if (response.data.status) {
				const questionsData = response.data.data.questions.data;
				const paginationData = response.data.data.questions;

				setQuestions(questionsData);
				setTotal(paginationData.total || 0);
				setCurrentPage(paginationData.current_page || 1);

				// Only set error to null if we successfully fetched data
				if (error) setError(null);
			} else {
				setError(response.data.message || "Failed to fetch questions");
			}
		} catch (err) {
			setError("An error occurred while fetching questions");
			console.error(err);
		} finally {
			// Ensure loading is always set to false in the finally block
			setLoading(false);
		}
	}, [debouncedSearchTerm, error, categoryFilter, currentPage, perPage]);

	// Handle search term changes with debounce
	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			// Reset to first page when search term changes
			setCurrentPage(1);
		}, 500); // 500ms delay

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchTerm]);

	// Handle category filter changes
	const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setCategoryFilter(value ? parseInt(value) : null);
		// Reset to first page when category filter changes
		setCurrentPage(1);
	}, []);

	// Handle pagination change
	const handlePageChange = useCallback((page: number, pageSize?: number) => {
		setCurrentPage(page);
		if (pageSize) {
			setPerPage(pageSize);
		}
	}, []);

	// Fetch data on component mount and when debounced search changes
	useEffect(() => {
		fetchQuestions();
	}, [fetchQuestions]);

	// Fetch categories on component mount
	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	// Edit question function
	const editQuestion = useCallback((questionId: number) => {
		// For now, show an alert indicating edit functionality
		// In a real implementation, this would open an edit modal or navigate to an edit page
		toast.error(`Edit functionality for question ID: ${questionId} would open here`);
	}, []);

	// Delete question function with confirmation
	const deleteQuestion = useCallback(async (questionId: number, questionText: string) => {
		const result = await Swal.fire({
			title: 'Are you sure?',
			text: `You are about to delete the question: "${questionText.substring(0, 50)}${questionText.length > 50 ? '...' : ''}". This action cannot be undone.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#ef4444',
			cancelButtonColor: '#6b7280',
			confirmButtonText: 'Yes, delete it!',
			cancelButtonText: 'Cancel'
		});

		if (result.isConfirmed) {
			try {
				setLoading(true);
				const response = await axiosInstance.delete(`/quiz/question-bank/delete/${questionId}`);

				if (response.data.status === true || response.status === 200 || response.status === 204) {
					Swal.fire({
						title: 'Deleted!',
						text: 'The question has been deleted successfully.',
						icon: 'success',
						timer: 1500,
						showConfirmButton: false
					});
					// Refetch questions to update the UI after deletion
					fetchQuestions();
				} else {
					console.error("Failed to delete question:", response.data.message || response.data);
					Swal.fire({
						title: 'Error!',
						text: response.data.message || 'Failed to delete question',
						icon: 'error'
					});
				}
			} catch (err) {
				console.error("Error deleting question:", err);
				Swal.fire({
					title: 'Error!',
					text: 'An error occurred while deleting the question',
					icon: 'error'
				});
			} finally {
				setLoading(false);
			}
		}
	}, [fetchQuestions]);

	// View question details function
	const viewQuestionDetails = useCallback(async (questionId: number) => {
		try {
			setDetailLoading(true);
			setSelectedQuestionDetail(questions.find(q => q.id === questionId) || null);

			const response = await axiosInstance.get(`/quiz/question-bank/show/${questionId}`);

			if (response.data.status) {
				setDetailedQuestion(response.data.data.question);
				setIsDetailModalOpen(true);
			} else {
				Swal.fire({
					title: 'Error!',
					text: response.data.message || 'Failed to fetch question details',
					icon: 'error'
				});
			}
		} catch (err) {
			console.error("Error fetching question details:", err);
			Swal.fire({
				title: 'Error!',
				text: 'An error occurred while fetching question details',
				icon: 'error'
			});
		} finally {
			setDetailLoading(false);
		}
	}, [questions]);

	if (loading) {
		return (
			<section className="container mx-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold">My Questions</h2>
					<div className="h-10 w-48 bg-gray-200 dark:bg-dark-3 rounded-md animate-pulse"></div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, index) => (
						<div key={index} className="bg-white dark:bg-dark-2 rounded-lg border p-5 animate-pulse">
							<div className="flex justify-between mb-2">
								<div className="h-6 w-20 bg-gray-200 dark:bg-dark-3 rounded"></div>
								<div className="h-4 w-16 bg-gray-200 dark:bg-dark-3 rounded"></div>
							</div>

							<div className="h-5 w-3/4 bg-gray-200 dark:bg-dark-3 rounded mb-3"></div>

							<div className="flex flex-wrap gap-2 mb-4">
								<div className="h-5 w-12 bg-gray-200 dark:bg-dark-3 rounded"></div>
								<div className="h-5 w-16 bg-gray-200 dark:bg-dark-3 rounded"></div>
							</div>

							<div className="flex gap-2 mb-2">
								<div className="flex-1 h-10 bg-gray-200 dark:bg-dark-3 rounded"></div>
							</div>

							<div className="h-5 w-full bg-gray-200 dark:bg-dark-3 rounded"></div>
						</div>
					))}
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					<AlertTriangle className="w-8 h-8 text-red-500" />
				</div>
				<h3 className="text-xl font-semibold text-red-500 mb-2">Something went wrong</h3>
				<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{error}</p>
				<button
					onClick={fetchQuestions}
					className="mt-6 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors mx-auto"
				>
					<CheckCircle className="w-4 h-4" />
					Retry
				</button>
			</div>
		);
	}

	return (
		<section className=" mx-auto">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
				<div>
					<h2 className="text-2xl font-bold">My Questions</h2>
					<div className="flex flex-wrap gap-4 mt-4">
						{/* Search Input */}
						<div className="relative">
							<input
								type="text"
								placeholder="Search questions..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => {
									// Prevent form submission if the input is accidentally inside a form
									if (e.key === 'Enter') {
										e.preventDefault();
									}
								}}
								className="px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full sm:w-64"
							/>
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
								<Search size={18} />
							</div>
							{searchTerm && (
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setSearchTerm('');
										setDebouncedSearchTerm('');
									}}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								>
									<X size={18} />
								</button>
							)}
						</div>

						{/* Category Filter */}
						<div className="relative">
							<select
								value={categoryFilter || ''}
								onChange={handleCategoryChange}
								className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full sm:w-48 appearance-none"
							>
								<option value="">All Categories</option>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
								<Folder size={18} />
							</div>
						</div>

						{/* Clear Filters Button */}
						{(searchTerm || categoryFilter) && (
							<button
								onClick={() => {
									setSearchTerm('');
									setDebouncedSearchTerm('');
									setCategoryFilter(null);
									setCurrentPage(1);
								}}
								className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
							>
								Clear Filters
							</button>
						)}
					</div>
				</div>
			</div>

			{/* ================= EMPTY STATE ================= */}
			{!questions.length ? (
				<div className="text-center py-12">
					<div className="mx-auto max-w-md">
						<div className="bg-gray-100 dark:bg-dark-3 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<Eye className="w-8 h-8 text-gray-400" />
						</div>

						<h3 className="text-xl font-semibold mb-2">
							No questions found
						</h3>

						{searchTerm || categoryFilter ? (
							<>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									{searchTerm && categoryFilter
										? `No questions match "${searchTerm}" in the selected category`
										: searchTerm
											? `No questions match "${searchTerm}"`
											: `No questions found in the selected category`
									}
								</p>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										setSearchTerm("");
										setDebouncedSearchTerm("");
										setCategoryFilter(null);
										setCurrentPage(1);
									}}
									className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors mx-auto"
								>
									<X className="w-4 h-4" />
									Clear Filters
								</button>
							</>
						) : (
							<>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									{`You haven't created any questions yet.`}
								</p>
							</>
						)}
					</div>
				</div>
			) : (
				/* ================= LIST ================= */
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{questions.map((question) => (
						<div
							key={question.id}
							className="bg-white dark:bg-dark-2 rounded-xl border flex flex-col"
						>
							<div className="p-5 flex-grow">
								<div className="flex justify-between mb-3">
									{question.category ? (
										<span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
											{question.category.name}
										</span>
									) : (
										<span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
											Uncategorized
										</span>
									)}
									<span className="text-xs text-gray-400">
										{formatDate(question.created_at)}
									</span>
								</div>

								<div className="flex items-start gap-3 mb-3">
									<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
										<Image
											src={getQuestionTypeIcon(question.question_type)}
											alt={question.question_type}
											width={28}
											height={28}
											className="object-contain"
										/>
									</div>
									<h3 className="font-semibold flex-grow line-clamp-2 text-gray-800 dark:text-gray-200">
										{question.question_text}
									</h3>
								</div>

								<div className="flex flex-wrap gap-2 mb-3">
									<span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium flex items-center gap-1">
										<Type size={10} />
										{question.question_type.replace(/_/g, ' ').toUpperCase()}
									</span>
									{question.points && (
										<span className="text-xs px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full font-medium flex items-center gap-1">
											<Zap size={10} />
											{question.points} Points
										</span>
									)}
									{question.time_limit_seconds && (
										<span className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium flex items-center gap-1">
											<Clock4 size={10} />
											{question.time_limit_seconds}s
										</span>
									)}
								</div>

								<div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center justify-between">
									<span className="flex items-center gap-1">
										<ListCollapse className="w-4 h-4" />
										Options: {question.options.choices.length}
									</span>
									{/* <button
										onClick={() => viewQuestionDetails(question.id)}
										title="View Details"
										className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light rounded-full transition-colors flex items-center gap-1"
									>
										<Eye size={12} />
										View Details
									</button> */}
									{question.is_ai_generated && (
										<span className="text-xs px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full ml-2">
											AI Generated
										</span>
									)}
								</div>

								<div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
									<button
										onClick={() => viewQuestionDetails(question.id)}
										title="View"
										className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
									>
										<Eye size={12} />
										View
									</button>
									<button
										onClick={() => deleteQuestion(question.id, question.question_text)}
										title="Delete"
										className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-lg transition-colors duration-200 text-sm font-medium"
									>
										<Trash2 size={14} />
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			{total > 0 && (
				<GlobalPagination
					current={currentPage}
					total={total}
					pageSize={perPage}
					onChange={handlePageChange}
				/>
			)}

			{/* Question Detail Modal */}
			<Modal
				title="Question Details"
				open={isDetailModalOpen}
				onClose={() => setIsDetailModalOpen(false)}
			>
				{detailLoading ? (
					<div className="flex justify-center items-center h-32">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : detailedQuestion ? (
					<div className="space-y-3">
						<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
							<div className="flex items-start gap-2">
								<div className="flex-shrink-0 mt-0.5">
									<BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Question Text</h4>
									<p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
										{detailedQuestion.question_text}
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
							<div className="bg-gray-50 dark:bg-dark-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-1 mb-0.5">
									<Folder className="w-3 h-3 text-gray-500 dark:text-gray-400" />
									<h4 className="font-medium text-gray-700 dark:text-gray-300 text-[0.6rem]">Category</h4>
								</div>
								<p className="text-gray-900 dark:text-white text-xs">
									{detailedQuestion.category?.name || 'Uncategorized'}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-dark-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-1 mb-0.5">
									<Type className="w-3 h-3 text-gray-500 dark:text-gray-400" />
									<h4 className="font-medium text-gray-700 dark:text-gray-300 text-[0.6rem]">Type</h4>
								</div>
								<p className="text-gray-900 dark:text-white text-xs">
									{detailedQuestion.question_type.replace(/_/g, ' ').toUpperCase()}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-dark-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-1 mb-0.5">
									<Zap className="w-3 h-3 text-yellow-500" />
									<h4 className="font-medium text-gray-700 dark:text-gray-300 text-[0.6rem]">Points</h4>
								</div>
								<p className="text-gray-900 dark:text-white text-xs">
									{detailedQuestion.points || 0}
								</p>
							</div>
							<div className="bg-gray-50 dark:bg-dark-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-1 mb-0.5">
									<Clock4 className="w-3 h-3 text-purple-500" />
									<h4 className="font-medium text-gray-700 dark:text-gray-300 text-[0.6rem]">Time Limit</h4>
								</div>
								<p className="text-gray-900 dark:text-white text-xs">
									{detailedQuestion.time_limit_seconds || 0}s
								</p>
							</div>
						</div>

						<div className="bg-gray-50 dark:bg-dark-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-1.5 mb-2">
								<ListCollapse className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
								<h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Options</h4>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
								{detailedQuestion.options?.choices?.map((choice: string, index: number) => (
									<div
										key={index}
										className={`p-2 rounded-lg border ${detailedQuestion.options?.correct_answer?.includes(index)
											? 'bg-green-50 dark:bg-green-900/20 border-green-500'
											: 'bg-white dark:bg-dark-2 border-gray-200 dark:border-gray-700'
											}`}
									>
										<div className="flex items-start gap-1.5">
											<span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold ${detailedQuestion.options?.correct_answer?.includes(index)
												? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
												: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
												}`}>
												{String.fromCharCode(65 + index)}
											</span>
											<div className="flex-1">
												<span className="block text-gray-900 dark:text-white text-xs">{choice}</span>
												{detailedQuestion.options?.correct_answer?.includes(index) && (
													<span className="inline-flex items-center gap-0.5 text-[0.5rem] px-1 py-0.5 mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
														<Check size={6} />
														Correct
													</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{detailedQuestion.source_content_url && (
							<div className="bg-gray-50 dark:bg-dark-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
								<div className="flex items-center gap-1.5 mb-1">
									<Link className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
									<h4 className="font-medium text-gray-700 dark:text-gray-300 text-xs">Source URL</h4>
								</div>
								<a
									href={detailedQuestion.source_content_url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline break-all block text-xs"
								>
									{detailedQuestion.source_content_url}
								</a>
							</div>
						)}

						<div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
								<Calendar className="w-3.5 h-3.5" />
								Created: {formatDate(detailedQuestion.created_at)}
							</div>
							{detailedQuestion.is_ai_generated && (
								<span className="inline-flex items-center gap-1 text-[0.6rem] px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
									<AlertCircle size={8} />
									AI Gen
								</span>
							)}
						</div>
					</div>
				) : null}
			</Modal>
		</section>
	);
}
