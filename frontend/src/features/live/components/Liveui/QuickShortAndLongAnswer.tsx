/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText } from "lucide-react";

const formatAnswer = (answer: any): string => {
	if (answer === null || answer === undefined) return "";
	if (typeof answer === "string" || typeof answer === "number") {
		return String(answer);
	}
	if (Array.isArray(answer)) {
		return answer.map(formatAnswer).filter(Boolean).join(", ");
	}
	if (typeof answer === "object") {
		return formatAnswer(answer.value ?? answer.text ?? answer.label ?? "");
	}
	return String(answer);
};

function QuickShortAndLongAnswer({ answerData }: any) {
	const answers = Array.isArray(answerData)
		? answerData.map(formatAnswer).filter(Boolean)
		: [];

	return (
		<div className="h-full w-full overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] sm:p-5">
			<AnimatePresence initial={false}>
				<motion.div
					layout
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
				>
					{answers.map((answer: string, index: number) => (
						<motion.div
							layout
							key={`${answer}-${index}`}
							initial={{ opacity: 0, y: 24, scale: 0.94 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -16, scale: 0.96 }}
							transition={{
								duration: 0.55,
								ease: "easeOut",
								delay: Math.min(index * 0.035, 0.35),
							}}
							className="group relative min-h-[132px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
						>
							<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary" />
							<div className="mb-4 flex items-center justify-between gap-3">
								<span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
									<MessageSquareText className="h-5 w-5" />
								</span>
								<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500">
									#{index + 1}
								</span>
							</div>
							<p className="break-words text-lg font-black leading-snug text-slate-900">
								{answer}
							</p>
						</motion.div>
					))}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export default QuickShortAndLongAnswer;
