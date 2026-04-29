"use client";

import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type ParticipantTimerPanelProps = {
	children: React.ReactNode;
	label?: string;
	className?: string;
};

export function ParticipantTimerPanel({
	children,
	label = "Remaining time",
	className,
}: ParticipantTimerPanelProps) {
	return (
		<div
			className={cn(
				"relative mx-auto flex w-full max-w-[180px] items-center justify-center p-0 text-slate-950",
				className,
			)}
		>
			<div className="flex flex-col items-center gap-1.5">
				<div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
					<Clock3 className="h-3.5 w-3.5" />
					{label}
				</div>
				<div className="[&_.text-xs]:text-slate-500 [&_.text-2xl]:!text-xl [&_.text-3xl]:!text-2xl [&_.text-white]:!text-slate-950">
					{children}
				</div>
			</div>
		</div>
	);
}
