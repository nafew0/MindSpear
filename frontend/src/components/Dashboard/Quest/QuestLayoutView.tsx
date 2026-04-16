import React from "react";
import QuestLeftSideBar from "./QuestLeftSideBar";
import QuestContantView from "./QuestContantView";

function QuestLayoutView() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
			<div className="md:col-span-2">
				<QuestLeftSideBar />
			</div>
			<div className="md:col-span-10">
				<QuestContantView />
			</div>
		</div>
	);
}

export default QuestLayoutView;
