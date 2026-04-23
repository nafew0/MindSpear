"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { ChartContainer } from "./ChartContainer";
import { normalizeWordData } from "./chartData";
import type { NormalizedChartProps, Word } from "./types";

export type WordCloudProps = NormalizedChartProps & {
	words?: Word[];
	width?: number;
	minFont?: number;
	maxFont?: number;
	rotate?: (word: Word) => number;
	padding?: number;
	onWordClick?: (word: Word) => void;
};

const WordCloudClient = dynamic<WordCloudProps>(
	() => import("./WordCloudClient").then((module) => module.WordCloudClient),
	{
		ssr: false,
		loading: () => (
			<div className="h-full min-h-[260px] w-full rounded-xl bg-slate-50" />
		),
	}
);

export function WordCloud({
	data,
	words,
	title,
	height = 420,
	width,
	colors,
	isLoading,
	className,
	minFont = 16,
	maxFont = 72,
	rotate,
	padding,
	onWordClick,
}: WordCloudProps) {
	const chartData = useMemo(() => normalizeWordData(words, data), [words, data]);
	const hasRenderableData = chartData.length > 0;

	return (
		<ChartContainer className={className} isLoading={isLoading} minHeight={height}>
			{title ? (
				<div className="mb-3 text-center text-sm font-semibold text-slate-700">
					{title}
				</div>
			) : null}
			{hasRenderableData ? (
				<WordCloudClient
					data={data}
					words={chartData}
					title={title}
					height={height}
					width={width}
					colors={colors}
					minFont={minFont}
					maxFont={maxFont}
					rotate={rotate}
					padding={padding}
					onWordClick={onWordClick}
				/>
			) : (
				<div
					className="w-full rounded-xl bg-transparent"
					style={{ height, width }}
					aria-hidden="true"
				/>
			)}
		</ChartContainer>
	);
}
