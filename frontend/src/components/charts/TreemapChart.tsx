"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { baseApexOptions, getChartColors } from "./chartTheme";
import { ChartContainer } from "./ChartContainer";
import type { ChartDatum, NormalizedChartProps } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});

type TreemapDataPoint = {
	x: string;
	y: number;
};

type TreemapChartProps = NormalizedChartProps & {
	seriesData?: TreemapDataPoint[];
};

export function TreemapChart({
	data,
	seriesData,
	title,
	height = 350,
	colors,
	isLoading,
	className,
}: TreemapChartProps) {
	const points = useMemo<TreemapDataPoint[]>(() => {
		if (seriesData?.length) return seriesData;
		if (Array.isArray(data) && data.every((item) => typeof item === "object")) {
			return (data as ChartDatum[]).map((item) => ({
				x: item.label,
				y: Number(item.value) || 0,
			}));
		}

		return [];
	}, [data, seriesData]);

	const chartColors = useMemo(() => getChartColors(colors, points.length), [colors, points.length]);

	const options: ApexOptions = useMemo(
		() => ({
			...baseApexOptions,
			chart: {
				...baseApexOptions.chart,
				type: "treemap",
				height,
			},
			legend: { show: false },
			colors: chartColors,
			plotOptions: {
				treemap: {
					distributed: true,
					enableShades: false,
				},
			},
			dataLabels: {
				enabled: true,
				style: {
					colors: ["#111827"],
					fontSize: "13px",
					fontWeight: 700,
				},
			},
			title: title
				? {
						text: title,
						align: "center",
					}
				: undefined,
		}),
		[chartColors, height, title]
	);

	return (
		<ChartContainer className={className ?? "p-4"} isLoading={isLoading} minHeight={height}>
			<ReactApexChart
				options={options}
				series={[{ data: points }]}
				type="treemap"
				height={height}
			/>
		</ChartContainer>
	);
}
