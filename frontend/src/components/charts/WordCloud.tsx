"use client";

import React, { useMemo } from "react";
import Highcharts from "highcharts";
import WordCloudModule from "highcharts/modules/wordcloud";
import HighchartsReact from "highcharts-react-official";
import { normalizeWordData } from "./chartData";
import { chartPalette } from "./chartTheme";
import type { NormalizedChartProps, Word } from "./types";

const registerWordCloud = WordCloudModule as unknown as
	| ((highcharts: typeof Highcharts) => void)
	| undefined;

if (typeof registerWordCloud === "function") {
	registerWordCloud(Highcharts);
}

type WordCloudProps = NormalizedChartProps & {
	words?: Word[];
	width?: number;
	minFont?: number;
	maxFont?: number;
	rotate?: (word: Word) => number;
	padding?: number;
	onWordClick?: (word: Word) => void;
};

export function WordCloud({
	data,
	words,
	title,
	height = 420,
	width,
	colors = chartPalette,
	isLoading,
	className,
	minFont = 16,
	maxFont = 72,
	onWordClick,
}: WordCloudProps) {
	const chartData = useMemo(() => normalizeWordData(words, data), [words, data]);

	const options = useMemo<Highcharts.Options>(
		() => ({
			chart: {
				height,
				width,
				backgroundColor: "transparent",
				style: {
					fontFamily: "inherit",
				},
			},
			title: {
				text: title || undefined,
			},
			credits: {
				enabled: false,
			},
			tooltip: {
				pointFormat: "<b>{point.name}</b>: {point.weight}",
			},
			colors: colors.filter((color): color is string => Boolean(color)),
			plotOptions: {
				series: {
					cursor: onWordClick ? "pointer" : undefined,
					point: {
						events: {
							click: function () {
								if (!onWordClick) return;
								const point = this as Highcharts.Point & { weight?: number };
								onWordClick({
									text: String(point.name ?? ""),
									value: Number(point.weight ?? point.y ?? 0),
								});
							},
						},
					},
				},
				wordcloud: {
					minFontSize: minFont,
					maxFontSize: maxFont,
					rotation: {
						from: 0,
						to: 90,
						orientations: 2,
					},
				},
			},
			series: [
				{
					type: "wordcloud",
					name: "Responses",
					data: chartData.map((word) => ({
						name: word.text,
						weight: word.value,
					})),
				},
			],
		}),
		[chartData, colors, height, maxFont, minFont, onWordClick, title, width]
	);

	if (isLoading) {
		return (
			<div
				className={className}
				style={{ height, width }}
				aria-busy="true"
				aria-label="Loading word cloud"
			/>
		);
	}

	return (
		<div className={className}>
			<HighchartsReact highcharts={Highcharts} options={options} />
		</div>
	);
}
