"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Template } from "@/types/content";

interface TemplateCardProps {
	template: Template;
	selected: boolean;
	hovered: boolean;
	onHover: (id: number | null) => void;
	onClick: (id: number) => void;
}

export function TemplateCard({ template, selected, hovered, onHover, onClick }: TemplateCardProps) {
	const Icon = template.icon;

	return (
		<motion.div
			whileHover={{ scale: 1.02, y: -2 }}
			whileTap={{ scale: 0.98 }}
			onMouseEnter={() => onHover(template.id)}
			onMouseLeave={() => onHover(null)}
			onClick={() => onClick(template.id)}
			className={cn(
				"cursor-pointer rounded-2xl border p-6 bg-white dark:bg-slate-800 transition-all duration-200 group relative",
				selected
					? "ring-2 ring-primary border-primary/40"
					: "border-slate-200 dark:border-slate-700 hover:border-primary/30"
			)}
		>
			{hovered && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap z-10"
				>
					{template.description}
					<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-800 rotate-45"></div>
				</motion.div>
			)}

			<div className="flex items-center justify-center mb-4">
				<div className={cn(
					"p-3 rounded-xl transition-colors",
					selected
						? "bg-primary/10"
						: "bg-slate-100 dark:bg-slate-700 group-hover:bg-primary/5"
				)}>
					<Icon className={cn(
						"h-6 w-6 transition-colors",
						selected
							? "text-primary"
							: "text-slate-600 dark:text-slate-400 group-hover:text-primary"
					)} />
				</div>
			</div>

			<h3 className={cn(
				"font-semibold text-center transition-colors",
				selected
					? "text-primary"
					: "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
			)}>
				{template.name}
			</h3>
		</motion.div>
	);
}