import React from "react";
import SurveyLeftSideBar from "./SurveyLeftSideBar";
import SurveyContantView from "./SurveyContantView";
function SurveyLayoutView() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
			<div className="md:col-span-2">
				<SurveyLeftSideBar />
			</div>
			<div className="md:col-span-10">
				<SurveyContantView />
			</div>
		</div>
	);
}

export default SurveyLayoutView;
