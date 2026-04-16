"use client";

import React from "react";
import { getChartColors } from "./chartTheme";

type HorizontalProgressBarsProps = {
	data: number[];
	colors?: string[];
	labels: string[];
};

export default function HorizontalProgressBars({
	data,
	colors,
	labels,
}: HorizontalProgressBarsProps) {
	const chartColors = getChartColors(colors, data.length);

	return (
		<div className="mx-auto w-full rounded-lg">
			<div className="space-y-3">
				{data.map((value, index) => {
					const numericValue = Math.max(0, Math.min(100, Number(value) || 0));
					const label = labels[index] ?? `Option ${index + 1}`;
					const color = chartColors[index];

					return (
						<div key={`${label}-${index}`} className="rounded-lg">
							<div className="mb-1 flex items-center justify-between gap-4 text-sm">
								<span className="font-medium text-gray-700">{label}</span>
								<span className="font-semibold text-gray-900">{numericValue}%</span>
							</div>
							<div className="h-3 overflow-hidden rounded-full bg-gray-100">
								<div
									className="h-full rounded-full transition-all duration-500"
									style={{
										width: `${numericValue}%`,
										background: `linear-gradient(90deg, ${color}, ${color}cc)`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
