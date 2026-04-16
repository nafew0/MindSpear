"use client";

import React from "react";
import { Skeleton } from "@/components/ui";

type ChartContainerProps = {
	children: React.ReactNode;
	className?: string;
	isLoading?: boolean;
	minHeight?: number;
};

export function ChartContainer({
	children,
	className,
	isLoading,
	minHeight = 320,
}: ChartContainerProps) {
	if (isLoading) {
		return (
			<div className={className} style={{ minHeight }}>
				<Skeleton className="h-full min-h-[260px] w-full rounded-xl" />
			</div>
		);
	}

	return (
		<div className={className} style={{ minHeight }}>
			{children}
		</div>
	);
}
