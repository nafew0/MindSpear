/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import Select from "react-select";
import { useSurvey } from "@/contexts/SurveyContext";
import { useParams } from "next/navigation";
import { SurveyPage } from "@/types/surveyTypes";

interface PageOption {
	value: number;
	label: string;
	page: SurveyPage;
}

export interface SurveyPageDropdownRef {
	refetch: () => void;
}

const SurveyPageDropdown = forwardRef<SurveyPageDropdownRef>((_, ref) => {
	const params = useParams();
	const surveyId = params?.id as string;
	const { state, actions, api } = useSurvey();
	const [pages, setPages] = useState<SurveyPage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchPages = useCallback(async () => {
		if (!surveyId) return;
		setIsLoading(true);
		try {
			const response = await api.fetchPagesBySurvey(surveyId);
			console.log("SurveyPageDropdown - Fetched pages:", response);

			const pagesData = response.data?.data?.survey?.pages || [];
			setPages(pagesData);

			// Set the first page as active if none is selected
			if (!state.activePageId && pagesData.length > 0) {
				actions.setActivePage(pagesData[0].id);
			}
		} catch (error) {
			console.error("Error fetching pages:", error);
		} finally {
			setIsLoading(false);
		}
	}, [surveyId, actions, state.activePageId, api]);

	// Fetch pages from server
	useEffect(() => {
		if (!surveyId) return;
		fetchPages();
	}, [surveyId, fetchPages]);

	// Expose refetch method to parent components
	useImperativeHandle(ref, () => ({
		refetch: () => {
			fetchPages();
		},
	}), [fetchPages]);

	const pageOptions: PageOption[] = pages.map((page) => ({
		value: page.id,
		label: page.title,
		page,
	}));

	const selectedOption = pageOptions.find(
		(opt) => opt.value === state.activePageId,
	);

	const handlePageChange = (option: PageOption | null) => {
		if (option) {
			actions.setActivePage(option.value);
		}
	};

	const customStyles = {
		control: (base: any) => ({
			...base,
			minHeight: "40px",
			backgroundColor: "#FFFFFF",
			borderColor: "#E6EBF1",
			borderRadius: "0.5rem",
			padding: "0px 4px",
			cursor: "pointer",
			transition: "all 0.2s",
			"&:hover": {
				borderColor: "#F79945",
			},
			"&:focus": {
				borderColor: "#F79945",
				boxShadow: "0 0 0 3px rgba(247, 153, 69, 0.1)",
			},
		}),
		option: (base: any, state: any) => ({
			...base,
			backgroundColor: state.isSelected
				? "#F79945"
				: state.isFocused
					? "#FEF4EE"
					: "#FFFFFF",
			color: state.isSelected ? "#FFFFFF" : "#333",
			cursor: "pointer",
			padding: "10px 12px",
			transition: "all 0.2s",
			"&:active": {
				backgroundColor: "#F79945",
			},
		}),
		singleValue: (base: any) => ({
			...base,
			color: "#333",
			fontSize: "0.875rem",
		}),
		placeholder: (base: any) => ({
			...base,
			color: "#9CA3AF",
			fontSize: "0.875rem",
		}),
		dropdownIndicator: (base: any) => ({
			...base,
			color: "#F79945",
			"&:hover": {
				color: "#F79945",
			},
		}),
		indicatorSeparator: (base: any) => ({
			...base,
			backgroundColor: "#E6EBF1",
		}),
		menu: (base: any) => ({
			...base,
			borderColor: "#E6EBF1",
			boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
		}),
	};

	return (
		<div className="w-full">
			<label className="block text-xs font-semibold text-[#333] mb-2">
				Select Page
			</label>
			<Select
				options={pageOptions}
				value={selectedOption}
				onChange={handlePageChange}
				styles={customStyles}
				placeholder="Choose a page..."
				isLoading={isLoading}
				isSearchable
				isClearable={false}
				isDisabled={pages.length === 0}
				formatOptionLabel={(option: PageOption) => (
					<div className="flex items-center gap-2">
						{/* <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
							Page {option.page.page_number}
						</span> */}
						<span>{option.label}</span>
					</div>
				)}
			/>
			{pages.length === 0 && !isLoading && (
				<p className="text-xs text-gray-500 mt-2">
					Add pages to get started
				</p>
			)}
		</div>
	);
});

SurveyPageDropdown.displayName = "SurveyPageDropdown";
export default SurveyPageDropdown;
