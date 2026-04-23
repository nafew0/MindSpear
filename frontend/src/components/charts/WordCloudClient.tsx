"use client";

import React, { useMemo } from "react";
import { WordCloud as ReactWordCloud, type Word as ReactWord } from "@isoterik/react-word-cloud";
import { getChartColors } from "./chartTheme";
import type { WordCloudProps } from "./WordCloud";
import type { Word } from "./types";

const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};

const getEqualWeightFontSize = (minFont: number, maxFont: number, wordCount: number) => {
	if (wordCount <= 1) {
		return maxFont;
	}

	return Math.round((minFont + maxFont) / 2);
};

const createFontSizeResolver = (words: Word[], minFont: number, maxFont: number) => {
	const weights = words.map((word) => Number(word.value) || 0);
	const minWeight = Math.min(...weights);
	const maxWeight = Math.max(...weights);

	if (words.length <= 1) {
		return () => maxFont;
	}

	if (maxWeight <= minWeight) {
		const equalWeightFontSize = getEqualWeightFontSize(
			minFont,
			maxFont,
			words.length
		);
		return () => equalWeightFontSize;
	}

	return (word: ReactWord) => {
		const ratio = (word.value - minWeight) / (maxWeight - minWeight);
		return Math.round(clamp(minFont + ratio * (maxFont - minFont), minFont, maxFont));
	};
};

export function WordCloudClient({
	words,
	height = 420,
	width = 1000,
	colors,
	minFont = 16,
	maxFont = 72,
	rotate,
	padding = 2,
	onWordClick,
}: WordCloudProps) {
	const chartWords = useMemo(() => words ?? [], [words]);
	const chartColors = useMemo(
		() => getChartColors(colors, chartWords.length),
		[colors, chartWords.length]
	);
	const fontSize = useMemo(
		() => createFontSizeResolver(chartWords, minFont, maxFont),
		[chartWords, maxFont, minFont]
	);

	if (!chartWords.length) {
		return <div className="w-full rounded-xl bg-transparent" style={{ height, width }} />;
	}

	return (
		<div
			className="flex w-full items-center justify-center overflow-hidden"
			style={{ height, width }}
		>
			<ReactWordCloud
				words={chartWords}
				width={width}
				height={height}
				padding={padding}
				fontSize={fontSize}
				rotate={(word, _index) => rotate?.(word) ?? 0}
				fill={(_word, index) => {
					return chartColors[index % chartColors.length] ?? chartColors[0] ?? "#2563eb";
				}}
				svgProps={{
					role: "img",
					"aria-label": "Word cloud",
					style: {
						display: "block",
						height: "100%",
						maxWidth: "100%",
						overflow: "visible",
					},
				}}
				onWordClick={(word) => {
					onWordClick?.({
						text: word.text,
						value: Number(word.value) || 0,
					});
				}}
			/>
		</div>
	);
}
