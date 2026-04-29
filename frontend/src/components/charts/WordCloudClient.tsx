"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { WordCloudProps } from "./WordCloud";
import type { Word } from "./types";

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const getFontSize = (
	word: Word,
	words: Word[],
	minFont: number,
	maxFont: number,
) => {
	const safeMin = clamp(minFont, 18, 34);
	const safeMax = clamp(maxFont, safeMin, 76);
	const weights = words.map((item) => Number(item.value) || 1);
	const minWeight = Math.min(...weights);
	const maxWeight = Math.max(...weights);

	if (words.length <= 1) return clamp(56, safeMin, safeMax);
	if (maxWeight <= minWeight) return Math.round((safeMin + safeMax) / 2);

	const minLog = Math.log1p(minWeight);
	const maxLog = Math.log1p(maxWeight);
	const ratio = (Math.log1p(Number(word.value) || 1) - minLog) / (maxLog - minLog);
	return Math.round(safeMin + ratio * (safeMax - safeMin));
};

const wordColors = [
	"#F79945",
	"#BC5EB3",
	"#ED3A76",
	"#2563EB",
	"#10B981",
	"#7C3AED",
	"#F59E0B",
	"#0F172A",
	"#06B6D4",
	"#DB2777",
	"#84CC16",
	"#EA580C",
];

export function WordCloudClient({
	words,
	height = 420,
	width,
	minFont = 18,
	maxFont = 72,
	onWordClick,
}: WordCloudProps) {
	const chartWords = useMemo(
		() =>
			[...(words ?? [])].sort((left, right) => {
				if (Number(right.value) !== Number(left.value)) {
					return Number(right.value) - Number(left.value);
				}
				return left.text.localeCompare(right.text);
			}),
		[words],
	);

	if (!chartWords.length) {
		return (
			<div
				className="w-full rounded-xl bg-transparent"
				style={{ height, width: width ?? "100%" }}
			/>
		);
	}

	return (
		<div
			className="flex w-full items-center justify-center overflow-hidden px-4 py-6"
			style={{ minHeight: height, width: width ?? "100%" }}
			role="img"
			aria-label="Word cloud"
		>
			<motion.div
				layout
				className="flex max-h-full w-full flex-wrap items-center justify-center gap-x-6 gap-y-4 overflow-y-auto px-2 py-4"
			>
				{chartWords.map((word, index) => {
					const color = wordColors[index % wordColors.length] ?? "#F79945";
					const fontSize = getFontSize(word, chartWords, minFont, maxFont);
					const count = Math.max(Number(word.value) || 1, 1);

					return (
						<motion.button
							key={`${word.text}-${count}`}
							type="button"
							disabled={!onWordClick}
							initial={{ opacity: 0, y: 18, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.025 }}
							onClick={() => onWordClick?.(word)}
							className="max-w-full bg-transparent px-1 py-1 font-black leading-none transition hover:-translate-y-1 disabled:cursor-default disabled:hover:translate-y-0"
							style={{
								color,
								fontSize,
								textShadow: "0 8px 24px rgba(15,23,42,.10)",
							}}
						>
							<span className="max-w-[36ch] truncate">{word.text}</span>
						</motion.button>
					);
				})}
			</motion.div>
		</div>
	);
}
