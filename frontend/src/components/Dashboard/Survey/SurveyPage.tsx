/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Loader2, Edit2 } from "lucide-react";
import { Modal } from "@/components/ui";
import { toast } from "react-toastify";
import { useSurvey } from "@/contexts/SurveyContext";
import { SurveyPage as SurveyPageType } from "@/types/surveyTypes";

interface SurveyPageProps {
	onPageUpdated?: () => void;
}

const SurveyPage: React.FC<SurveyPageProps> = ({ onPageUpdated }) => {
	const params = useParams();
	const surveyId = params?.id as string;
	const { state, actions, api } = useSurvey();
	const activePageId = state.activePageId;

	const [pages, setPages] = useState<SurveyPageType[]>([]);
	const [isAddingPage, setIsAddingPage] = useState(false);
	const [isEditingPage, setIsEditingPage] = useState(false);
	const [editingPageId, setEditingPageId] = useState<number | null>(null);
	const [newPageTitle, setNewPageTitle] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSelectingPageToEdit, setIsSelectingPageToEdit] = useState(false);

	// Set survey ID in context
	useEffect(() => {
		if (surveyId) {
			actions.setSurveyId(surveyId);
		}
	}, [surveyId, actions]);

	// Fetch pages from server
	const fetchPages = useCallback(async () => {
		if (!surveyId) return;
		setIsLoading(true);
		try {
			const response = await api.fetchPagesBySurvey(surveyId);

			const pagesData = response.data?.data?.survey?.pages || [];

			const transformedPages = pagesData.map((page: any) => ({
				id: page.id,
				title: page.title || `Page ${page.page_number}`,
				page_number: page.page_number,
				description: page.description,
				question_count: page.questions?.length || 0,
				has_conditional_logic: page.has_conditional_logic || false,
				conditional_parent_type: page.conditional_parent_type,
				conditional_question_id: page.conditional_question_id,
				conditional_page_id: page.conditional_page_id,
				conditional_value: page.conditional_value,
				conditional_operator: page.conditional_operator,
			}));

			setPages(transformedPages);

			// Set the first page as active if none is selected
			if (transformedPages.length > 0 && !activePageId) {
				const firstPageId = transformedPages[0].id;
				actions.setActivePage(firstPageId);

				// Load questions for the first page
				const firstPageData = pagesData.find(
					(page: any) => page.id === firstPageId,
				);
				if (firstPageData && (firstPageData as any).questions) {
					const transformedQuestions = (
						firstPageData as any
					).questions.map((q: any) => ({
						key: q.question_type,
						id: q.id.toString(),
						title: q.question_text || "Untitled question",
						options: q.options || [],
						maxOptions: 0,
						minOptions: 0,
						allowDuplicates: false,
						isMultipleSelection: false,
						timeLimit: "",
						position: q.serial_number || 1,
						quiz_id: q.survey_id?.toString(),
						survey_id: q.survey_id?.toString() || "",
						page_id: q.page_id,
						question_text: q.question_text || "",
						question_type: q.question_type,
						serial_number: q.serial_number || 1,
						is_required: q.is_required || false,
						created_at: q.created_at || new Date().toISOString(),
						updated_at: q.updated_at || new Date().toISOString(),
					}));

					actions.setQuestionsForPage(
						firstPageId,
						transformedQuestions,
					);
				} else {
					actions.setQuestionsForPage(firstPageId, []);
				}
			}
		} catch (error) {
			console.error("Error fetching pages:", error);
			setPages([]);
		} finally {
			setIsLoading(false);
		}
	}, [surveyId, actions, api]);

	// Handle adding a new page
	const handleAddPage = async () => {
		if (!newPageTitle.trim()) return;
		setIsSaving(true);

		try {
			const newPageNumber = pages.length + 1;

			const response = await api.createPage({
				survey_id: parseInt(surveyId),
				page_number: newPageNumber,
				title: newPageTitle,
				description: "",
				has_conditional_logic: false,
				conditional_parent_type: null,
				conditional_question_id: null,
				conditional_section_id: null,
				conditional_page_id: null,
				conditional_value: null,
				conditional_operator: "equals",
			});

			const newPage = response.data.data.page;
			const updatedPages = [
				...pages,
				{
					...newPage,
					question_count: 0,
				},
			];

			setPages(updatedPages);
			actions.setActivePage(newPage.id);
			setIsAddingPage(false);
			setNewPageTitle("");

			toast.success("Page added successfully!");
		} catch (error: any) {
			console.error("Error adding page:", error);
			toast.error("Failed to add page. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	// Handle editing an existing page
	const handleEditPage = async () => {
		if (!newPageTitle.trim()) return;
		if (!editingPageId) return;
		setIsSaving(true);

		try {
			const response = await api.updatePage(editingPageId, {
				survey_id: parseInt(surveyId),
				title: newPageTitle,
				description: "",
				has_conditional_logic: false,
				conditional_parent_type: null,
				conditional_question_id: null,
				conditional_section_id: null,
				conditional_page_id: null,
				conditional_value: null,
				conditional_operator: "equals",
			});

			const updatedPage = response.data.data.page;
			const updatedPages = pages.map((page) =>
				page.id === editingPageId
					? {
							...page,
							title: updatedPage.title,
						}
					: page,
			);

			setPages(updatedPages);
			setIsEditingPage(false);
			setEditingPageId(null);
			setNewPageTitle("");

			// Trigger callback to refresh dropdown
			if (onPageUpdated) {
				onPageUpdated();
			}

			toast.success("Page updated successfully!");
		} catch (error: any) {
			console.error("Error updating page:", error);
			toast.error("Failed to update page. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	useEffect(() => {
		fetchPages();
	}, [surveyId, fetchPages]);

	return (
		<div className="w-full flex flex-col">
			{/* Add Page & Edit Page Buttons */}
			<div className="flex gap-2 w-full">
				<button
					onClick={() => setIsAddingPage(true)}
					disabled={isSaving}
					className="flex-1 flex items-center gap-2 px-4 py-2.5 text-sm bg-primary text-white font-medium rounded-md justify-center hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSaving ? (
						<Loader2 size={16} className="animate-spin" />
					) : (
						<Plus size={16} />
					)}
					<span>Add Page</span>
				</button>

				<button
					onClick={() =>
						setIsSelectingPageToEdit(!isSelectingPageToEdit)
					}
					disabled={isSaving || pages.length === 0}
					className="flex-1 flex items-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white font-medium rounded-md justify-center hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSaving ? (
						<Loader2 size={16} className="animate-spin" />
					) : (
						<Edit2 size={16} />
					)}
					<span>Edit Page</span>
				</button>
			</div>

			{/* Pages Selection Dropdown */}
			{isSelectingPageToEdit && pages.length > 0 && (
				<div className="mt-2 border border-gray-300 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
					{pages.map((page) => (
						<button
							key={page.id}
							onClick={() => {
								setNewPageTitle(page.title);
								setEditingPageId(page.id);
								setIsEditingPage(true);
								setIsSelectingPageToEdit(false);
							}}
							className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0 hover:text-blue-600 font-medium"
						>
							{page.title}
						</button>
					))}
				</div>
			)}

			{/* Add/Edit Page Modal */}
			<Modal
				title={isEditingPage ? "Edit Page" : "Add New Page"}
				open={isAddingPage || isEditingPage}
				onClose={() => {
					setIsAddingPage(false);
					setIsEditingPage(false);
					setEditingPageId(null);
					setNewPageTitle("");
				}}
				width={500}
			>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="pageTitle"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Page Title
						</label>
						<input
							id="pageTitle"
							type="text"
							placeholder="Enter page title..."
							value={newPageTitle}
							onChange={(e) => setNewPageTitle(e.target.value)}
							className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all ${
								newPageTitle.trim()
									? "border-gray-300"
									: "border-red-300"
							}`}
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter" && !isSaving) {
									isEditingPage
										? handleEditPage()
										: handleAddPage();
								}
							}}
						/>
						{!newPageTitle.trim() && (
							<p className="mt-1 text-sm text-red-600">
								Page title is required
							</p>
						)}
					</div>
					<div className="flex items-center gap-3 pt-2">
						<button
							onClick={
								isEditingPage ? handleEditPage : handleAddPage
							}
							disabled={isSaving || !newPageTitle.trim()}
							className="flex-1 px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2
										size={16}
										className="animate-spin"
									/>
									{isEditingPage
										? "Updating..."
										: "Adding..."}
								</span>
							) : isEditingPage ? (
								"Update Page"
							) : (
								"Add Page"
							)}
						</button>
						<button
							onClick={() => {
								setIsAddingPage(false);
								setIsEditingPage(false);
								setEditingPageId(null);
								setNewPageTitle("");
							}}
							disabled={isSaving}
							className="flex-1 px-4 py-2.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default SurveyPage;
