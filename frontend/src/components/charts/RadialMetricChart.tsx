"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { baseApexOptions } from "./chartTheme";
import { ChartContainer } from "./ChartContainer";
import { theme } from "@/config/theme";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});

type RadialMetricChartProps = {
	value?: number;
	participantsNumber?: number;
	title?: string;
	height?: number;
	isLoading?: boolean;
	className?: string;
};

export function RadialMetricChart({
	value,
	participantsNumber,
	title = "Participants",
	height = 350,
	isLoading,
	className,
}: RadialMetricChartProps) {
	const metricValue = Math.max(0, Math.min(100, Number(value ?? participantsNumber) || 0));
	const series = useMemo(() => [metricValue], [metricValue]);

	const options: ApexOptions = useMemo(
		() => ({
			...baseApexOptions,
			chart: {
				...baseApexOptions.chart,
				height,
				type: "radialBar",
			},
			colors: [theme.colors.primary.DEFAULT],
			fill: {
				type: "gradient",
				gradient: {
					shade: "dark",
					type: "horizontal",
					shadeIntensity: 0.5,
					gradientToColors: [theme.colors.secondary.DEFAULT],
					inverseColors: true,
					opacityFrom: 1,
					opacityTo: 1,
					stops: [0, 100],
				},
			},
			stroke: {
				lineCap: "round",
			},
			labels: [title],
			plotOptions: {
				radialBar: {
					startAngle: -135,
					endAngle: 225,
					hollow: {
						margin: 0,
						size: "70%",
						background: "#fff",
						position: "front",
					},
					track: {
						background: "#fff",
						strokeWidth: "67%",
						margin: 0,
					},
					dataLabels: {
						show: true,
						name: {
							offsetY: -10,
							color: "#64748b",
							fontSize: "16px",
						},
						value: {
							formatter: (labelValue: number) => `${Math.trunc(labelValue)}`,
							color: "#111827",
							fontSize: "34px",
						},
					},
				},
			},
		}),
		[height, title]
	);

	return (
		<ChartContainer className={className} isLoading={isLoading} minHeight={height}>
			<ReactApexChart
				options={options}
				series={series}
				type="radialBar"
				height={height}
			/>
		</ChartContainer>
	);
}
