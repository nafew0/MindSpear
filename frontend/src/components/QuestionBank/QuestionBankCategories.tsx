/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { APICategory } from "@/interfaces/questionBank";
import axiosInstance from "@/utils/axiosInstance";
import {
	Plus,
	Edit3,
	Trash2,
	AlertCircle,
	Search,
	Folder,
	ListTree,
} from "lucide-react";
import GlobalModal from "@/components/globalModal";

interface QuestionBankCategoriesProps {
	categories: APICategory[];
	loading?: boolean;
	onDelete?: (id: number) => void;
	onRefresh?: () => void;
}

interface SelectOption {
	value: number | null;
	label: string;
}

// Helper function for relative date formatting
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
		return "Just now";
	} else if (diffInSeconds < secondsInHour) {
		const minutes = Math.floor(diffInSeconds / secondsInMinute);
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	} else if (diffInSeconds < secondsInDay) {
		const hours = Math.floor(diffInSeconds / secondsInHour);
		return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	} else if (diffInSeconds < secondsInWeek) {
		const days = Math.floor(diffInSeconds / secondsInDay);
		return `${days} day${days > 1 ? "s" : ""} ago`;
	} else if (diffInSeconds < secondsInMonth) {
		const weeks = Math.floor(diffInSeconds / secondsInWeek);
		return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
	} else if (diffInSeconds < secondsInYear) {
		const months = Math.floor(diffInSeconds / secondsInMonth);
		return `${months} month${months > 1 ? "s" : ""} ago`;
	} else {
		const years = Math.floor(diffInSeconds / secondsInYear);
		return `${years} year${years > 1 ? "s" : ""} ago`;
	}
};

// Category Modal Component
const CategoryModal = ({
	isOpen,
	onClose,
	onSubmit,
	category,
	title,
	allCategories,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: any) => void;
	category?: any;
	title: string;
	allCategories: APICategory[];
}) => {
	// Extract parent categories (only non-child categories)
	const parentCategories = allCategories.filter(
		(cat) => cat.is_parent || cat.parent_category_id === null,
	);

	const [formData, setFormData] = useState({
		name: category?.name || "",
		description: category?.description || "",
		is_parent: category?.is_parent ?? true,
		parent_category_id: category?.parent_category_id || null,
		color_code: category?.color_code || "#ffffff",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Convert categories to select options format
	const categoryOptions: SelectOption[] = parentCategories.map((cat) => ({
		value: cat.id,
		label: cat.name,
	}));

	// Set default option when editing a subcategory
	useEffect(() => {
		if (category && !category.is_parent) {
			setFormData({
				name: category.name || "",
				description: category.description || "",
				is_parent: false,
				parent_category_id: category.parent_category_id || null,
				color_code: category.color_code || "#ffffff",
			});
		} else if (category) {
			setFormData({
				name: category.name || "",
				description: category.description || "",
				is_parent: true,
				parent_category_id: null,
				color_code: category.color_code || "#ffffff",
			});
		} else {
			setFormData({
				name: "",
				description: "",
				is_parent: true,
				parent_category_id: null,
				color_code: "#ffffff",
			});
		}
		setError(null);
	}, [category]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (!formData.name.trim()) {
			setError("Category name is required");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await onSubmit(formData);
			setFormData({
				name: "",
				description: "",
				is_parent: true,
				parent_category_id: null,
				color_code: "#ffffff",
			});
		} catch (error) {
			console.error("Error submitting form:", error);
			setError(
				"An error occurred while saving the category. Please try again.",
			);
		} finally {
			setLoading(false);
			onClose(); // Close the modal after successful submission
		}
	};

	return (
		<GlobalModal open={isOpen} onClose={onClose} title={title}>
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
						<AlertCircle size={16} />
						{error}
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Category Name *
					</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) =>
							setFormData({ ...formData, name: e.target.value })
						}
						className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
						placeholder="Mathematics"
						required
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Example: Mathematics
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Description
					</label>
					<textarea
						value={formData.description}
						onChange={(e) =>
							setFormData({
								...formData,
								description: e.target.value,
							})
						}
						className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
						placeholder="All math-related questions"
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Example: All math-related questions
					</p>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-700 dark:text-gray-300">
						Parent Category
					</span>
					<div
						onClick={() => {
							setFormData({
								...formData,
								is_parent: !formData.is_parent,
								// Reset parent selection when switching to parent
								parent_category_id: !formData.is_parent
									? null
									: formData.parent_category_id,
							});
						}}
						className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none ${
							formData.is_parent
								? "bg-primary"
								: "bg-gray-300 dark:bg-gray-600"
						}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								formData.is_parent
									? "translate-x-6"
									: "translate-x-1"
							}`}
						/>
					</div>
				</div>

				{!formData.is_parent && (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Parent Category
						</label>
						<Select
							value={
								categoryOptions.find(
									(opt) =>
										opt.value ===
										formData.parent_category_id,
								) || null
							}
							onChange={(selectedOption) => {
								setFormData({
									...formData,
									parent_category_id: selectedOption
										? selectedOption.value
										: null,
								});
							}}
							options={categoryOptions}
							placeholder="Select parent category..."
							className="basic-single"
							classNamePrefix="select"
							isClearable
							styles={{
								control: (provided, state) => ({
									...provided,
									borderColor: state.isFocused
										? "#3b82f6"
										: "#d1d5db",
									borderWidth: "2px",
									borderRadius: "0.5rem",
									background: "white",
									"&:hover": {
										borderColor: "#3b82f6",
									},
									...(state.isFocused && {
										boxShadow:
											"0 0 0 3px rgba(59, 130, 246, 0.15)",
										borderColor: "#3b82f6",
									}),
									"@apply dark:bg-dark-3 dark:border-gray-600":
										{},
								}),
								option: (provided, state) => ({
									...provided,
									backgroundColor: state.isSelected
										? "#3b82f6" // primary color
										: state.isFocused
											? "#dbeafe" // lighter primary
											: "white",
									color: state.isSelected ? "white" : "black",
									"@apply dark:bg-dark-3 dark:hover:bg-dark-4 dark:text-white":
										{},
									"&:hover": {
										backgroundColor: "#dbeafe",
									},
								}),
							}}
						/>
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Category Color
					</label>
					<div className="flex items-center gap-3">
						<input
							type="color"
							value={formData.color_code}
							onChange={(e) =>
								setFormData({
									...formData,
									color_code: e.target.value,
								})
							}
							className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
						/>
						<input
							type="text"
							value={formData.color_code}
							onChange={(e) =>
								setFormData({
									...formData,
									color_code: e.target.value,
								})
							}
							className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
							placeholder="#ffffff"
						/>
					</div>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						Choose a color for this category
					</p>
				</div>

				<div className="flex justify-end space-x-3 pt-4">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
						disabled={loading}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
					>
						{loading ? (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
						) : (
							<>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
								Save
							</>
						)}
					</button>
				</div>
			</form>
		</GlobalModal>
	);
};

export default function QuestionBankCategories({
	loading = false,
}: QuestionBankCategoriesProps) {
	const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
	const [editingCategory, setEditingCategory] = useState<APICategory | null>(
		null,
	);

	// Search and filter states
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [parentCategoryId, setParentCategoryId] = useState<number | null>(
		null,
	);
	const [isParentFilter, setIsParentFilter] = useState<boolean | null>(null);
	const [categories, setCategories] = useState<APICategory[]>([]);

	// Function to handle refresh after create, update, or delete
	const handleRefresh = () => {
		fetchCategories();
	};

	const fetchCategories = async () => {
		try {
			const response = await axiosInstance.get(
				"/quiz/question-bank-categories",
			);
			if (response.status === 200) {
				setCategories(response.data.data.categories.data || []);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleCreate = async (data: any) => {
		try {
			const response = await axiosInstance.post(
				`/quiz/question-bank-categories/store`,
				{
					name: data.name.trim(),
					description: data.description.trim() || null,
					is_parent: data.is_parent,
					parent_category_id: data.is_parent
						? null
						: data.parent_category_id,
					color_code: data.color_code || "#ffffff",
				},
			);

			if (
				response.data.status === true ||
				response.status === 200 ||
				response.status === 201
			) {
				setModalMode(null);
				handleRefresh();
			} else {
				console.error(
					"Failed to create category:",
					response.data.message || response.data,
				);
			}
		} catch (error: any) {
			console.error("Error creating category:", error);
		}
	};

	const handleUpdate = async (data: any) => {
		if (!editingCategory) return;

		try {
			const response = await axiosInstance.post(
				`/quiz/question-bank-categories/update/${editingCategory.id}`,
				{
					name: data.name.trim(),
					description: data.description.trim() || null,
					is_parent: data.is_parent,
					parent_category_id: data.is_parent
						? null
						: data.parent_category_id,
					color_code: data.color_code || "#ffffff",
				},
			);

			if (
				response.data.status === true ||
				response.status === 200 ||
				response.status === 201
			) {
				setModalMode(null);
				setEditingCategory(null);
				handleRefresh();
			} else {
				console.error(
					"Failed to update category:",
					response.data.message || response.data,
				);
			}
		} catch (error: any) {
			console.error("Error updating category:", error);
			if (error.response) {
			} else if (error.request) {
				// The request was made but no response was received
				console.error("Request data:", error.request);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.error("Error message:", error.message);
			}
		}
	};

	const showDeleteConfirmation = async (category: APICategory) => {
		const result = await Swal.fire({
			title: "Are you sure?",
			text: `You are about to delete "${category.name}". This action cannot be undone.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "Cancel",
		});

		if (result.isConfirmed) {
			await handleDelete(category.id);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await axiosInstance.delete(
				`/quiz/question-bank-categories/delete/${id}`,
			);

			if (
				response.data.status === true ||
				response.status === 200 ||
				response.status === 204
			) {
				handleRefresh();
				Swal.fire({
					title: "Deleted!",
					text: "The category has been deleted successfully.",
					icon: "success",
					timer: 1500,
					showConfirmButton: false,
				});
			} else {
				console.error(
					"Failed to delete category:",
					response.data.message || response.data,
				);
				Swal.fire({
					title: "Error!",
					text: response.data.message || "Failed to delete category",
					icon: "error",
				});
			}
		} catch (error: any) {
			console.error("Error deleting category:", error);
			Swal.fire({
				title: "Error!",
				text:
					error.response?.data?.message ||
					"An error occurred while deleting the category",
				icon: "error",
			});
		}
	};

	const handleEdit = (category: APICategory) => {
		setEditingCategory(category);
		setModalMode("edit");
	};

	return (
		<div className="">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
				<div>
					<h2 className="text-2xl font-bold">
						Question Bank Categories
					</h2>
					<div className="flex flex-wrap gap-4 mt-4">
						{/* Search Input */}
						<div className="relative">
							<input
								type="text"
								placeholder="Search categories..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full sm:w-64"
							/>
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
								<Search size={18} />
							</div>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							)}
						</div>

						{/* Parent Category Filter */}
						<div className="relative">
							<select
								value={parentCategoryId || ""}
								onChange={(e) =>
									setParentCategoryId(
										e.target.value
											? parseInt(e.target.value)
											: null,
									)
								}
								className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full sm:w-48 appearance-none"
							>
								<option value="">All Categories</option>
								{categories
									.filter((cat) => cat.is_parent)
									.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
							</select>
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
								<Folder size={18} />
							</div>
						</div>

						{/* Is Parent Filter */}
						<div className="relative">
							<select
								value={
									isParentFilter === null
										? ""
										: isParentFilter
											? "true"
											: "false"
								}
								onChange={(e) => {
									if (e.target.value === "") {
										setIsParentFilter(null);
									} else {
										setIsParentFilter(
											e.target.value === "true",
										);
									}
								}}
								className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full sm:w-40 appearance-none"
							>
								<option value="">All Types</option>
								<option value="true">Parent Only</option>
								<option value="false">Subcategory Only</option>
							</select>
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
								<ListTree size={18} />
							</div>
						</div>

						{/* Clear Filters Button */}
						{(searchQuery ||
							parentCategoryId ||
							isParentFilter !== null) && (
							<button
								onClick={() => {
									setSearchQuery("");
									setParentCategoryId(null);
									setIsParentFilter(null);
								}}
								className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
							>
								Clear Filters
							</button>
						)}
					</div>
				</div>

				<button
					onClick={() => {
						setModalMode("create");
						setEditingCategory(null); // Ensure clean state
					}}
					className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-all duration-200 self-start"
				>
					<Plus size={18} />
					Add Category
				</button>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
					{[...Array(6)].map((_, index) => (
						<div
							key={index}
							className="rounded-xl bg-white dark:bg-dark-2 border border-gray-200 dark:border-gray-700 overflow-hidden"
						>
							{/* Top Accent Skeleton */}
							<div className="h-1 w-full bg-gray-200 dark:bg-dark-3 animate-pulse"></div>

							<div className="p-5">
								{/* Title Skeleton */}
								<div className="flex justify-between items-start mb-3">
									<div className="h-5 w-3/4 bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
									<div className="h-5 w-16 bg-gray-200 dark:bg-dark-3 rounded-full animate-pulse"></div>
								</div>

								{/* Description Skeleton */}
								<div className="space-y-2 mb-4">
									<div className="h-3 w-full bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
									<div className="h-3 w-5/6 bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
									<div className="h-3 w-4/6 bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
								</div>

								{/* Details Skeleton */}
								<div className="space-y-2 mb-6">
									<div className="h-3 w-2/3 bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
									<div className="h-3 w-1/2 bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
									<div className="h-3 w-3/4 bg-gray-200 dark:bg-dark-3 rounded animate-pulse"></div>
								</div>

								{/* Buttons Skeleton */}
								<div className="flex gap-2">
									<div className="flex-1 h-10 bg-gray-200 dark:bg-dark-3 rounded-lg animate-pulse"></div>
									<div className="flex-1 h-10 bg-gray-200 dark:bg-dark-3 rounded-lg animate-pulse"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			) : categories.length === 0 ? (
				<div className="text-center py-12">
					<div className="mx-auto h-16 w-16 text-gray-400 mb-4 flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-16 w-16"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
					</div>
					<h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
						No categories found
					</h3>
					<p className="text-gray-500 dark:text-gray-400 mb-6">
						Get started by creating your first category.
					</p>
					<button
						onClick={() => {
							setModalMode("create");
							setEditingCategory(null); // Ensure clean state
						}}
						className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2 transition-all duration-200 mx-auto"
					>
						<Plus size={18} />
						Create Category
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
					{(() => {
						// Apply search and filtering logic
						let filteredCategories = [...categories];

						// Apply search filter - match against category name
						if (searchQuery) {
							filteredCategories = filteredCategories.filter(
								(category) =>
									category.name
										.toLowerCase()
										.includes(searchQuery.toLowerCase()),
							);
						}

						// Apply parent category filter
						if (parentCategoryId) {
							filteredCategories = filteredCategories.filter(
								(category) =>
									category.parent_category_id ===
									parentCategoryId,
							);
						}

						// Apply is_parent filter
						if (isParentFilter !== null) {
							filteredCategories = filteredCategories.filter(
								(category) =>
									category.is_parent === isParentFilter,
							);
						}

						return filteredCategories.length === 0 ? (
							<div className="col-span-full text-center py-12">
								<div className="mx-auto h-16 w-16 text-gray-400 mb-4 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-16 w-16"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
									No categories found
								</h3>
								<p className="text-gray-500 dark:text-gray-400 mb-6">
									No categories match your search and filter
									criteria.
								</p>
							</div>
						) : (
							filteredCategories.map((category) => (
								<div
									key={category.id}
									className="
        group relative overflow-hidden rounded-xl
        bg-white dark:bg-dark-2
        border border-gray-200 dark:border-gray-700
        transition-all duration-300
      "
								>
									{/* Top Accent */}
									<div
										className="absolute inset-x-0 top-0 h-1"
										style={{
											backgroundColor:
												category.color_code ||
												undefined,
										}}
									/>

									<div className="p-5 flex flex-col h-full">
										{/* Content */}
										<div className="flex-1 space-y-3">
											<div className="flex justify-between items-start">
												<h3
													className="text-lg font-semibold text-gray-900  leading-tight truncate"
													style={{
														color:
															category.color_code ||
															undefined,
													}}
												>
													{category.name}
												</h3>

												{/* Badge */}
												<span
													className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${
					category.is_parent
						? "bg-primary/10 text-primary"
						: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
				}
              `}
												>
													{category.is_parent
														? "Parent"
														: "Sub"}
												</span>
											</div>

											{category.description && (
												<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
													{category.description}
												</p>
											)}

											{/* Category details */}
											<div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
												<div className="flex items-center gap-1">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-3 w-3"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													<span>
														{formatDate(
															category.created_at,
														)}
													</span>
												</div>

												{category.parent_category && (
													<div className="flex items-center gap-1">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-3 w-3"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
															/>
														</svg>
														<span className="text-gray-700 dark:text-gray-300">
															{
																category
																	.parent_category
																	.name
															}
														</span>
													</div>
												)}

												{category.sub_categories &&
													category.sub_categories
														.length > 0 && (
														<div className="flex items-center gap-1">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-3 w-3"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
																/>
															</svg>
															<span className="text-gray-700 dark:text-gray-300">
																{
																	category
																		.sub_categories
																		.length
																}{" "}
																subcategories
															</span>
														</div>
													)}
											</div>
										</div>

										{/* Actions */}
										<div className="mt-4 flex gap-2">
											<button
												onClick={() =>
													handleEdit(category)
												}
												title="Edit"
												className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
											>
												<Edit3 size={14} />
												Edit
											</button>

											<button
												onClick={() =>
													showDeleteConfirmation(
														category,
													)
												}
												title="Delete"
												className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-lg transition-colors duration-200 text-sm font-medium"
											>
												<Trash2 size={14} />
												Delete
											</button>
										</div>
									</div>
								</div>
							))
						);
					})()}
				</div>
			)}

			{/* Single Category Modal for both Create and Edit */}
			{modalMode && (
				<CategoryModal
					isOpen={!!modalMode}
					onClose={() => {
						setModalMode(null);
						setEditingCategory(null);
					}}
					onSubmit={
						modalMode === "edit" ? handleUpdate : handleCreate
					}
					category={
						modalMode === "edit" ? editingCategory : undefined
					}
					title={
						modalMode === "edit"
							? "Edit Category"
							: "Create New Category"
					}
					allCategories={categories}
				/>
			)}
		</div>
	);
}
