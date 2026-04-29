"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type AnswerOptionButtonProps = {
	children: React.ReactNode;
	index: number;
	selected?: boolean;
	multi?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	className?: string;
};

const optionAccents = [
	"from-primary to-primary-dark",
	"from-secondary to-secondary-dark",
	"from-accent to-accent-dark",
	"from-slate-900 to-slate-700",
	"from-primary-dark to-secondary-dark",
	"from-accent-dark to-slate-900",
];

export function AnswerOptionButton({
	children,
	index,
	selected = false,
	multi = false,
	disabled = false,
	onClick,
	className,
}: AnswerOptionButtonProps) {
	const letter = String.fromCharCode(65 + (index % 26));
	const accent = optionAccents[index % optionAccents.length];

	return (
		<motion.button
			type="button"
			whileTap={disabled ? undefined : { scale: 0.985 }}
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"group relative flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-lg border p-3 text-left transition",
				selected
					? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
					: "border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
				disabled && "cursor-not-allowed opacity-60",
				className,
			)}
		>
			<span
				className={cn(
					"absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b",
					accent,
				)}
			/>
			<span
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-sm font-black text-white shadow-sm",
					accent,
				)}
			>
				{letter}
			</span>
			<span className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug sm:text-base">
				{children}
			</span>
			<span
				className={cn(
					"flex h-7 w-7 shrink-0 items-center justify-center border",
					multi ? "rounded-md" : "rounded-full",
					selected
						? "border-white bg-white text-primary"
						: "border-slate-300 bg-slate-50 text-transparent",
				)}
				aria-hidden
			>
				<Check className="h-4 w-4" />
			</span>
		</motion.button>
	);
}
