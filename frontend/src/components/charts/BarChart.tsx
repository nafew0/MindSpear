"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { baseApexOptions, getChartColors, truncateLabel } from "./chartTheme";
import { normalizeCategoricalData } from "./chartData";
import { ChartContainer } from "./ChartContainer";
import type { LegacyCategoricalProps, NormalizedChartProps } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});

type BarChartProps = NormalizedChartProps &
	LegacyCategoricalProps & {
		horizontal?: boolean;
		rounded?: number;
		valueSuffix?: string;
	};

export function BarChart({
	data,
	categories,
	labels,
	series,
	title,
	height = 350,
	colors,
	showLegend = false,
	isLoading,
	className,
	horizontal = false,
	rounded = 8,
	valueSuffix = "",
}: BarChartProps) {
	const chartData = useMemo(
		() => normalizeCategoricalData({ data, categories, labels, series, colors }),
		[data, categories, labels, series, colors]
	);
	const chartColors = useMemo(
		() => getChartColors(colors, chartData.length),
		[colors, chartData.length]
	);
	const rawLabels = chartData.map((item) => item.label);
	const values = chartData.map((item) => item.value);

	const options: ApexOptions = useMemo(
		() => ({
			...baseApexOptions,
			chart: {
				...baseApexOptions.chart,
				type: "bar",
				height,
			},
			colors: chartColors,
			legend: {
				show: showLegend,
				position: "bottom",
			},
			plotOptions: {
				bar: {
					borderRadius: rounded,
					borderRadiusApplication: "end",
					columnWidth: horizontal ? undefined : "38%",
					barHeight: horizontal ? "60%" : undefined,
					distributed: true,
					horizontal,
					dataLabels: {
						position: horizontal ? "right" : "top",
					},
				},
			},
			dataLabels: {
				enabled: true,
				offsetX: horizontal ? 8 : 0,
				offsetY: horizontal ? 0 : -22,
				formatter: (value: number) => `${value}${valueSuffix}`,
				style: {
					colors: ["#304758"],
					fontSize: "12px",
					fontWeight: 700,
				},
			},
			xaxis: {
				categories: rawLabels.map((label) => truncateLabel(label)),
				labels: {
					show: !horizontal,
					trim: true,
				},
				axisTicks: { show: false },
				axisBorder: { show: false },
			},
			yaxis: {
				labels: {
					show: horizontal,
					style: {
						colors: "#333",
						fontSize: "12px",
						fontWeight: 700,
					},
				},
			},
			tooltip: {
				enabled: true,
				y: {
					formatter: (value: number) => `${value}${valueSuffix}`,
				},
				x: {
					formatter: (_value: number, opts) => rawLabels[opts.dataPointIndex] ?? "",
				},
			},
			title: title
				? {
						text: title,
						align: "center",
						style: { color: "#444" },
					}
				: undefined,
		}),
		[chartColors, height, horizontal, rawLabels, rounded, showLegend, title, valueSuffix]
	);

	return (
		<ChartContainer className={className} isLoading={isLoading} minHeight={height}>
			<ReactApexChart
				options={options}
				series={[{ name: title || "Responses", data: values }]}
				type="bar"
				height={height}
			/>
		</ChartContainer>
	);
}

export function HorizontalBarChart(props: BarChartProps) {
	return <BarChart {...props} horizontal valueSuffix={props.valueSuffix ?? "%"} />;
}
