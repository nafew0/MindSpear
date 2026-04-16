"use client";
import { useRef } from "react";
import SurveyAddQuestion from "./SurveyAddQuestion";
import SurveyPage from "./SurveyPage";
import SurveyPageDropdown, {
	SurveyPageDropdownRef,
} from "./SurveyPageDropdown";

function SurveyLeftSideBar() {
	const dropdownRef = useRef<SurveyPageDropdownRef>(null);

	const handlePageUpdated = () => {
		// Refetch pages in dropdown when a page is updated
		dropdownRef.current?.refetch();
	};

	return (
		<aside className="bg-white border border-[#e6e6e6] rounded-xl shadow-sm p-4 h-[calc(90vh-80px)] flex flex-col gap-4">
			{/* Pages Section */}
			<div className="flex-none space-y-3">
				<h1 className="text-xl font-semibold text-[#333] mb-3">
					Survey Pages
				</h1>
				{/* Page Management Modal Trigger */}
				<div>
					<SurveyPage onPageUpdated={handlePageUpdated} />
				</div>
				<div>
					<SurveyPageDropdown ref={dropdownRef} />
				</div>
			</div>

			{/* Add Questions Section */}
			<div className="border-t border-[#f0f0f0] pt-4 flex-1 min-h-0 flex flex-col">
				<h3 className="text-sm font-semibold text-[#333] mb-3">
					Add Questions
				</h3>
				<SurveyAddQuestion />
			</div>
		</aside>
	);
}

export default SurveyLeftSideBar;
