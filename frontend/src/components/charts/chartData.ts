"use client";

import type { ChartDatum, LegacyCategoricalProps, NormalizedChartProps, Word } from "./types";

type CategoricalInput = Pick<NormalizedChartProps, "data" | "colors"> &
	LegacyCategoricalProps;

export const normalizeCategoricalData = ({
	data,
	categories,
	labels,
	series,
	colors,
}: CategoricalInput): ChartDatum[] => {
	if (Array.isArray(data) && data.every((item) => typeof item === "object")) {
		return data.map((item, index) => ({
			label: String(item.label ?? `Option ${index + 1}`),
			value: Number(item.value) || 0,
			color: item.color ?? colors?.[index] ?? undefined,
		}));
	}

	const values = Array.isArray(data) ? data : series ?? [];
	const names = categories ?? labels ?? [];

	return values.map((value, index) => ({
		label: names[index] ?? `Option ${index + 1}`,
		value: Number(value) || 0,
		color: colors?.[index] ?? undefined,
	}));
};

export const normalizeWordData = (words?: Word[], data?: NormalizedChartProps["data"]) => {
	const source =
		words ??
		(Array.isArray(data) && data.every((item) => typeof item === "object")
			? data.map((item) => ({
					text: item.label,
					value: item.value,
				}))
			: []);

	const totals = new Map<string, { text: string; value: number }>();

	for (const word of source) {
		const text = String(word.text ?? "").trim();
		if (!text) continue;

		const key = text.toLowerCase();
		const existing = totals.get(key);
		const value = Math.max(Number(word.value) || 1, 1);

		if (existing) {
			existing.value += value;
		} else {
			totals.set(key, { text, value });
		}
	}

	return Array.from(totals.values());
};
