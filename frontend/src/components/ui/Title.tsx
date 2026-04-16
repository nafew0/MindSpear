import React from "react";
import { cn } from "@/lib/utils";

type TitleProps = {
	children: React.ReactNode;
	as?: React.ElementType;
	/** Tailwind color class, e.g. 'text-primary' or 'text-red-600' */
	colorClass?: string;
	className?: string;
};

export default function Title({
	children,
	as: Component = "h1",
	colorClass = "",
	className = "",
}: TitleProps) {
	const toTitleCase = (value: string) => {
		const str = String(value).trim();
		if (!str) return str;
		return str
			.split(/\s+/)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(" ");
	};
	return (
		<Component
			className={cn(
				// base styles: bold + responsive extra-large text
				`${colorClass} font-bold text-3xl sm:text-3xl md:text-3xl mb-8`,
				className,
			)}
		>
			{typeof children === "string" ? toTitleCase(children) : children}
		</Component>
	);
}
