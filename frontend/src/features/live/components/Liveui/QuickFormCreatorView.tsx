/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import QuickFormAnswerView from "./QuickFormAnswerView";

type QuickFormCreatorViewProps = {
	answerData?: any[];
	quickFromId?: number | string | null;
};

function QuickFormCreatorView({ answerData = [] }: QuickFormCreatorViewProps) {
	return (
		<div>
			{answerData.map((answer, index) => (
				<QuickFormAnswerView key={index} data={answer} />
			))}
		</div>
	);
}

export default QuickFormCreatorView;
