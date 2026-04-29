/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import QuickFormAnswerView from "./QuickFormAnswerView";
import { ClipboardList } from "lucide-react";

type QuickFormCreatorViewProps = {
	answerData?: any[];
	quickFromId?: number | string | null;
};

function QuickFormCreatorView({ answerData = [] }: QuickFormCreatorViewProps) {
	if (!answerData.length) {
		return (
			<div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
				<div>
					<div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
						<ClipboardList className="h-7 w-7" />
					</div>
					<h3 className="text-lg font-black text-slate-900">
						No form responses yet
					</h3>
					<p className="mt-2 text-sm font-medium text-slate-500">
						Responses will appear here as participants submit them.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-4">
			{answerData.map((answer, index) => (
				<QuickFormAnswerView key={index} data={answer} />
			))}
		</div>
	);
}

export default QuickFormCreatorView;
