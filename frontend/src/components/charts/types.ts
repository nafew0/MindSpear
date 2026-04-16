"use client";

import type { ApexOptions } from "apexcharts";

export type ChartDatum = {
	label: string;
	value: number;
	color?: string;
};

export type Word = {
	text: string;
	value: number;
};

export type ChartColorInput = ReadonlyArray<string | null | undefined>;

export type NormalizedChartProps = {
	data?: ChartDatum[] | number[];
	title?: string;
	height?: number;
	colors?: ChartColorInput;
	showLegend?: boolean;
	isLoading?: boolean;
	className?: string;
};

export type LegacyCategoricalProps = {
	categories?: string[];
	labels?: string[];
	series?: number[];
	width?: number | string;
};

export type ApexChartType = NonNullable<ApexOptions["chart"]>["type"];
