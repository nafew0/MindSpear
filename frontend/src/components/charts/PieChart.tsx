"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { baseApexOptions, chartNeutrals, getChartColors } from "./chartTheme";
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
	const values = chartData.map((item) => item.value);
	const hasRenderableData = values.some((value) => Number(value) > 0);

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
					colors: chartNeutrals.chartLegend,
				},
			},
			dataLabels: {
				enabled: true,
				dropShadow: { enabled: false },
				style: {
					fontSize: "13px",
					fontWeight: 700,
					colors: [chartNeutrals.white],
				},
			},
			plotOptions: {
				pie: {
					donut: {
						size: "62%",
					},
				},
			},
			title: {
				...baseApexOptions.title,
				text: title || undefined,
				align: "center",
			},
		}),
		[chartColors, chartData, height, showLegend, title, type, width]
	);

	return (
		<ChartContainer className={className} isLoading={isLoading} minHeight={height}>
			{hasRenderableData ? (
				<ReactApexChart
					options={options}
					series={values}
					type={type}
					width={width}
					height={height}
				/>
			) : (
				<div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
					Waiting for responses...
				</div>
			)}
		</ChartContainer>
	);
}

export function DonutChart(props: Omit<PieChartProps, "type">) {
	return <PieChart {...props} type="donut" />;
}
