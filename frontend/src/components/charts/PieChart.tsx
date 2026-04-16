"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { baseApexOptions, getChartColors } from "./chartTheme";
import { normalizeCategoricalData } from "./chartData";
import { ChartContainer } from "./ChartContainer";
import type { LegacyCategoricalProps, NormalizedChartProps } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});

type PieChartProps = NormalizedChartProps &
	LegacyCategoricalProps & {
		type?: "pie" | "donut";
	};

export function PieChart({
	data,
	labels,
	categories,
	series,
	title,
	height = 360,
	width,
	colors,
	showLegend = true,
	isLoading,
	className,
	type = "pie",
}: PieChartProps) {
	const chartData = useMemo(
		() => normalizeCategoricalData({ data, labels, categories, series, colors }),
		[data, labels, categories, series, colors]
	);
	const chartColors = useMemo(
		() => getChartColors(colors, chartData.length),
		[colors, chartData.length]
	);

	const options: ApexOptions = useMemo(
		() => ({
			...baseApexOptions,
			chart: {
				...baseApexOptions.chart,
				type,
				width,
				height,
			},
			labels: chartData.map((item) => item.label),
			colors: chartColors,
			legend: {
				show: showLegend,
				position: "bottom",
				labels: {
					colors: "#334155",
				},
			},
			dataLabels: {
				enabled: true,
				dropShadow: { enabled: false },
				style: {
					fontSize: "13px",
					fontWeight: 700,
					colors: ["#fff"],
				},
			},
			plotOptions: {
				pie: {
					donut: {
						size: "62%",
					},
				},
			},
			title: title
				? {
						text: title,
						align: "center",
					}
				: undefined,
		}),
		[chartColors, chartData, height, showLegend, title, type, width]
	);

	return (
		<ChartContainer className={className} isLoading={isLoading} minHeight={height}>
			<ReactApexChart
				options={options}
				series={chartData.map((item) => item.value)}
				type={type}
				width={width}
				height={height}
			/>
		</ChartContainer>
	);
}

export function DonutChart(props: Omit<PieChartProps, "type">) {
	return <PieChart {...props} type="donut" />;
}
