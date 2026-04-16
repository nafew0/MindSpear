"use client";

import type { ApexOptions } from "apexcharts";
import { theme } from "@/config/theme";
import type { ChartColorInput } from "./types";

export const chartPalette = theme.chart.palette;

export const getChartColors = (
	colors?: ChartColorInput,
	count: number = chartPalette.length
) => {
	const palette = colors?.filter(Boolean).length ? colors.filter(Boolean) : chartPalette;

	return Array.from({ length: Math.max(count, 1) }, (_, index) => {
		return palette[index % palette.length] ?? chartPalette[index % chartPalette.length];
	});
};

export const chartResponsive: ApexOptions["responsive"] = [
	{
		breakpoint: theme.chart.responsive.mobile.breakpoint,
		options: {
			chart: {
				height: theme.chart.responsive.mobile.height,
			},
			legend: {
				position: "bottom",
				fontSize: "11px",
			},
			dataLabels: {
				style: {
					fontSize: "11px",
				},
			},
			xaxis: {
				labels: {
					rotate: -35,
					trim: true,
				},
			},
		},
	},
	{
		breakpoint: theme.chart.responsive.tablet.breakpoint,
		options: {
			chart: {
				height: theme.chart.responsive.tablet.height,
			},
			legend: {
				position: "bottom",
			},
		},
	},
];

export const baseApexOptions: ApexOptions = {
	chart: {
		background: "transparent",
		toolbar: { show: false },
		animations: { enabled: true, speed: 450 },
		fontFamily: "inherit",
	},
	grid: {
		borderColor: "#edf1f5",
		strokeDashArray: 4,
	},
	states: {
		hover: {
			filter: { type: "lighten" },
		},
		active: {
			filter: { type: "none" },
		},
	},
	tooltip: {
		theme: "light",
	},
	responsive: chartResponsive,
};

export const truncateLabel = (label: string, maxLength = 18) => {
	return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
};
