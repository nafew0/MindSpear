"use client";

import React from "react";
import { chartPalette } from "./chartTheme";

export type ScaleItem = {
	text: string;
	value: number;
	color?: string;
};

type ScaleProgressChartProps = {
	title?: string;
	items: ScaleItem[];
	full?: number;
	height?: number;
	sort?: boolean;
	valueSuffix?: string;
};

export function ScaleProgressChart({
	title = "Scales",
	items,
	full = 5,
	height = 420,
	sort = false,
	valueSuffix,
}: ScaleProgressChartProps) {
	const safeFull = Math.max(Number(full) || 1, 1);
	const displayItems = sort
		? [...items].sort((a, b) => {
				if (b.value !== a.value) return b.value - a.value;
				return a.text.localeCompare(b.text);
			})
		: items;

	return (
		<div className="w-full">
			{title ? (
				<h2 className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
			) : null}
			<div className="w-full overflow-auto" style={{ maxHeight: height }}>
				<div className="flex flex-col gap-6">
					{displayItems.map((item, index) => {
						const rawValue = Number.isFinite(item.value) ? item.value : 0;
						const percentage = Math.max(0, Math.min(100, (rawValue / safeFull) * 100));
						const color = item.color || chartPalette[index % chartPalette.length];
						const valueLabel = valueSuffix
							? `${Math.round(percentage)}${valueSuffix}`
							: `${rawValue}/${safeFull}`;

						return (
							<div
								key={`${item.text}-${index}`}
								className="relative min-h-20 w-full overflow-hidden rounded-lg bg-gray-50 p-4"
							>
								<div className="relative z-10 flex h-full flex-col justify-between gap-4">
									<div className="flex items-center justify-between gap-4">
										<span className="rounded bg-white/75 px-2 py-1 text-sm font-medium text-gray-800">
											{item.text}
										</span>
										<span className="rounded bg-white/75 px-2 py-1 text-sm font-semibold text-gray-800">
											{valueLabel}
										</span>
									</div>
									<div
										className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
										role="progressbar"
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={percentage}
									>
										<div
											className="h-full rounded-full transition-all"
											style={{
												width: `${percentage}%`,
												backgroundColor: color,
												boxShadow: `0 0 8px ${color}40`,
											}}
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export function ScalesChart(props: ScaleProgressChartProps) {
	return <ScaleProgressChart {...props} />;
}

export function AllScalesChart(props: ScaleProgressChartProps) {
	return <ScaleProgressChart {...props} full={100} sort valueSuffix="%" />;
}
