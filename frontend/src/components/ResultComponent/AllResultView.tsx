/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ⬇️ Bring your chart components (adjust paths if needed)
import GlobalHorizantalBarChart from "@/components/Chart/GlobalHorizantalBarChart";
// import HorizontalProgressBars from "@/components/Chart/HorizontalProgressBars";
import D3WordCloud from "@/components/Chart/D3WordCloud";
import GlobalBarChart from "@/components/Chart/GlobalBarChart";
import QuickFromAnswerView from "@/components/Liveui/QuickFromAnswerView";
import QuickShortAndLongAnswer from "@/components/Liveui/QuickShortAndLongAnswer";
import { AllScalesChart } from "../Chart/AllScalesChart";

// -------------------------------- Types --------------------------------
export type TabItem = {
	serial_number?: number;
	images: any;
	id: string;
	label: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	content: React.ReactNode | ((id: string) => React.ReactNode);
};

type Question = { id: number; text: string; color?: string };
type TaskData = {
	maxNumber: number | undefined;
	questions: Question[];
	time_limit?: number;
	time_limit_seconds?: number;
};
type Task = {
	id: number;
	quest_id: number;
	title: string;
	description: string | null;
	task_type:
		| "single_choice"
		| "multiple_choice"
		| "truefalse"
		| "fill_in_the_blanks_choice"
		| "sorting"
		| "scales"
		| "ranking"
		| "wordcloud"
		| "longanswer"
		| "shortanswer"
		| string;
	serial_number: number;
	task_data: TaskData;
	is_required: boolean;
	created_at: string;
	updated_at: string;
};
type CompletionData = {
	start_time?: string;
	selected_option?: number | number[] | string[];
};
type Submission = {
	id: number;
	participant_id: number | null;
	task_id: number;
	status: string;
	completed_at: string | null;
	completion_data: CompletionData;
	created_at: string;
	updated_at: string;
	task: Task;
};

// ------------------------------- Utils ---------------------------------
const FALLBACK_COLORS = [
	"#3b82f6",
	"#ef4444",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#06b6d4",
	"#f97316",
];

const asNumber = (v: unknown) => (typeof v === "number" ? v : Number(v));

const resolveByIdOrIndex = <T extends { id: number }>(v: number, arr: T[]) =>
	arr.find((x) => x.id === v) ??
	(v >= 0 && v < arr.length ? arr[v] : undefined);

// --------------------- Build props for your charts ---------------------
type ViewProps = {
	currentView:
		| "single_choice"
		| "multiple_choice"
		| "truefalse"
		| "fill_in_the_blanks_choice"
		| "sorting"
		| "scales"
		| "ranking"
		| "wordcloud"
		| "quick_form"
		| "shortanswer"
		| "longanswer";
	categories: string[];
	colors: string[];
	uniqueColors: string[];
	data: number[]; // zeros except selected index = 1
	rankinData: { text: string; count: number; color?: string }[];
	values: { text: string; value: number }[]; // wordcloud
};

function buildViewProps(sub: Submission): ViewProps {
	const type = (
		sub.task.task_type || ""
	).toLowerCase() as ViewProps["currentView"];
	const questions = sub.task.task_data?.questions ?? [];
	const categories = questions.map((q) => q.text);
	const colors = questions.map(
		(q, i) => q.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
	);
	const uniqueColors = Array.from(new Set(colors));
	const selected = sub.completion_data?.selected_option;

	// Base zeros array with length = number of options (≥ 1)
	const zeros = Array.from(
		{ length: Math.max(questions.length, 1) },
		() => 0
	);
	let data = zeros.slice();

	if (
		type === "multiple_choice" ||
		type === "single_choice" ||
		type === "truefalse" ||
		type === "fill_in_the_blanks_choice" ||
		type === "sorting" ||
		type === "scales"
	) {
		const arr = Array.isArray(selected) ? selected : [];
		const nums = arr
			.map(asNumber)
			.filter((x) => Number.isFinite(x)) as number[];
		nums.forEach((n) => {
			const resolved = resolveByIdOrIndex(n, questions);
			if (resolved) {
				const idx = questions.findIndex((q) => q === resolved);
				if (idx >= 0) data[idx] = 1;
			}
		});
	}

	let rankinData: { text: string; count: number; color?: string }[] = [];
	if (type === "ranking") {
		const arr = Array.isArray(selected) ? selected : [];
		const N = questions.length || arr.length || 0;
		rankinData = arr.map((v, i) => {
			const n = asNumber(v);
			const item = resolveByIdOrIndex(n, questions);
			const score = N - i;
			return {
				text: item?.text ?? String(v),
				count: score,
				images: "/images/icons/ranking.svg",
				color: item?.color,
			};
		});
	}
	if (type === "sorting") {
		const arr = Array.isArray(selected) ? selected : [];
		const N = questions.length || arr.length || 0;
		rankinData = arr.map((v, i) => {
			const n = asNumber(v);
			const item = resolveByIdOrIndex(n, questions);
			const score = N - i;
			return {
				text: item?.text ?? String(v),
				count: score,
				images: "/images/icons/ranking.svg",
				color: item?.color,
			};
		});
	}

	const values: { text: string; value: number }[] =
		type === "wordcloud" || Array.isArray(selected)
			? (selected as string[]).map((w) => ({ text: w, value: 1 }))
			: [];

	const currentView: ViewProps["currentView"] = [
		"single_choice",
		"multiple_choice",
		"truefalse",
		"fill_in_the_blanks_choice",
		"sorting",
		"scales",
		"ranking",
		"shortanswer",
		"longanswer",
		"quick_form",
		"wordcloud",
	].includes(type)
		? (type as ViewProps["currentView"])
		: "single_choice";

	return {
		currentView,
		categories,
		colors,
		uniqueColors,
		data,
		rankinData,
		values,
	};
}

function transformTaskData(data: any) {
	if (data.task.task_type !== "scales") {
		return [];
	}

	// Extract questions and selected options
	const questions = data?.task?.task_data?.questions;
	const selectedOptions = data?.completion_data?.selected_option;

	// Create an array to store the result
	const result = [];

	// Map each question to its corresponding selected option value
	for (let i = 0; i < questions.length; i++) {
		result.push({
			text: questions[i].text,
			value: selectedOptions[i],
		});
	}

	return result;
}

function ChartPanel({ sub }: { sub: Submission }) {
	const { currentView, categories, colors, rankinData, values } = useMemo(
		() => buildViewProps(sub),
		[sub]
	);
	const scaleItems = transformTaskData(sub);
	console.log(sub, "rankingTextrankingTextrankingTextrankingText");
	console.log(scaleItems, "scaleItemsscaleItemsscaleItemsscaleItems");
	const datalist: any = sub?.completion_data?.selected_option;
	const rankingText: any = sub?.task?.task_data?.questions
		.sort((a, b) => a.id - b.id)
		.map((item) => item.text);

	console.log(
		datalist,
		"currentViewcurrentViewcurrentViewcurrentViewcurrentView"
	);
	console.log(
		values,
		"currentViewcurrentViewcurrentViewcurrentViewcurrentView"
	);
	console.log(
		rankingText,
		"currentViewcurrentViewcurrentViewcurrentViewcurrentView"
	);
	console.log(
		rankinData,
		"currentViewcurrentViewcurrentViewcurrentViewcurrentView"
	);
	console.log(
		sub?.task?.task_data?.questions,
		"currentViewcurrentViewcurrentViewcurrentViewcurrentView"
	);

	// {
	// 	"optionsCount": {
	// 		"0": {
	// 			"count": 40,
	// 			"count_raw": 1,
	// 			"count_position": 4,
	// 			"sum": 2,
	// 			"calculated_value": 10,
	// 			"average": 2,
	// 			"highest_value": 5,
	// 			"my_calculated_value": 40,
	// 			"text": "S1"
	// 		},
	// 		"1": {
	// 			"count": 60,
	// 			"count_raw": 1,
	// 			"count_position": 4,
	// 			"sum": 3,
	// 			"calculated_value": 15,
	// 			"average": 3,
	// 			"highest_value": 5,
	// 			"my_calculated_value": 60,
	// 			"text": "S2"
	// 		},
	// 		"2": {
	// 			"count": 60,
	// 			"count_raw": 1,
	// 			"count_position": 4,
	// 			"sum": 3,
	// 			"calculated_value": 15,
	// 			"average": 3,
	// 			"highest_value": 5,
	// 			"my_calculated_value": 60,
	// 			"text": "S3"
	// 		},
	// 		"3": {
	// 			"count": 80,
	// 			"count_raw": 1,
	// 			"count_position": 4,
	// 			"sum": 4,
	// 			"calculated_value": 20,
	// 			"average": 4,
	// 			"highest_value": 5,
	// 			"my_calculated_value": 80,
	// 			"text": "S4"
	// 		}
	// 	}
	// }

	return (
		<>
			{currentView === "single_choice" ||
			currentView === "multiple_choice" ||
			currentView === "truefalse" ||
			currentView === "fill_in_the_blanks_choice" ? (
				<div className="w-full px-4 h-full">
					<GlobalBarChart data={datalist} categories={categories} />
				</div>
			) : currentView === "scales" ? (
				<div className="w-full px-4 h-min-screen overflow-auto scrollbar-hidden">
					<AllScalesChart title="" items={scaleItems} />
				</div>
			) : currentView === "ranking" ? (
				<div className="w-[80%] px-4 h-full">
					<GlobalHorizantalBarChart
						data={datalist}
						categories={rankingText}
						colors={rankinData
							.map(
								(opt, i) =>
									opt.color || colors[i % colors.length]
							)
							.filter(Boolean)}
					/>
				</div>
			) : currentView === "sorting" ? (
				<div className="w-[80%] px-4 h-full">
					<GlobalHorizantalBarChart
						data={datalist}
						categories={rankingText}
						colors={sub?.task?.task_data?.questions
							?.map((opt) => opt.color)
							.filter(Boolean)}
					/>
				</div>
			) : currentView === "quick_form" ? (
				<div className="">
					<QuickFromAnswerView
						data={{
							id: "",
							time: 120,
							user_name: "",
							answer_data: sub?.completion_data,
						}}
					/>
				</div>
			) : currentView === "wordcloud" ? (
				<div className="min-h-[850px] w-full flex items-center justify-center">
					<D3WordCloud
						words={values}
						width={1000}
						height={850}
						minFont={12}
						maxFont={72}
						rotate={() => (Math.random() > 0.85 ? 90 : 0)}
						// onWordClick={(w: any) => console.log("Clicked:", w)}
						className=""
					/>
				</div>
			) : currentView === "longanswer" ||
			  currentView === "shortanswer" ? (
				<div className="min-h-[850px] w-full flex items-center justify-center">
					<QuickShortAndLongAnswer
						answerData={sub?.completion_data?.selected_option}
					/>
				</div>
			) : null}
		</>
	);
}

const htmlToText = (html?: string) => {
	if (!html) return "";
	const stripped = html.replace(/<[^>]*>/g, " ");
	if (typeof window !== "undefined") {
		const div = document.createElement("div");
		div.innerHTML = stripped;
		const text = div.textContent || div.innerText || "";
		return text
			.replace(/\u00a0/g, " ")
			.replace(/\s+/g, " ")
			.trim();
	}
	return stripped
		.replace(/\u00a0/g, " ")
		.replace(/\s+/g, " ")
		.trim();
};

// Main Display Component
export default function AllResultView({
	resultList,
	loading,
	tabs,
	initialTabId,
	className,
}: {
	resultList: Submission[];
	loading: boolean;
	tabs?: TabItem[];
	initialTabId?: string;
	className?: string;
}) {
	console.log(resultList, "resultListresultListresultListresultList");

	const dynamicTabs: TabItem[] = useMemo(() => {
		if (!Array.isArray(resultList)) return [];
		return resultList.map((sub) => ({
			id: String(sub.task.id),
			label: sub.task.title,
			serial_number: sub.task.serial_number,
			images:
				sub.task.task_type === "single_choice" ||
				sub.task.task_type === "multiple_choice"
					? "/images/icons/Icon-01.svg"
					: sub.task.task_type === "truefalse"
					? "/images/icons/yes-no.svg"
					: sub.task.task_type === "wordcloud"
					? "/images/icons/word-cloud.svg"
					: sub.task.task_type === "ranking"
					? "/images/icons/ranking.svg"
					: sub.task.task_type === "sorting"
					? "/images/icons/sorting.svg"
					: sub.task.task_type === "shortanswer"
					? "/images/icons/Icon-03.svg"
					: sub.task.task_type === "longanswer"
					? "/images/icons/long-answer.svg"
					: sub.task.task_type === "quick_form"
					? "/images/icons/quick-form.svg"
					: sub.task.task_type === "scales"
					? "/images/icons/scales.svg"
					: "",
			content: (
				<div className="space-y-6 flex flex-col justify-between">
					<section className="grid gap-4 md:grid-cols-2">
						<header className="space-y-1">
							<h2 className="text-2xl font-semibold">
								{htmlToText(sub.task.title)}
							</h2>
						</header>
						<div className="rounded-2xl border bg-white p-4 shadow-sm">
							<div className="text-xs uppercase text-gray-500">
								Status
							</div>
							<div className="font-medium">{sub.status}</div>
						</div>
						<div className="rounded-2xl border bg-white p-4 shadow-sm hidden">
							<div className="text-xs uppercase text-gray-500">
								Completed at
							</div>
							<div className="font-medium">
								{sub.completed_at
									? new Date(
											sub.completed_at
									  ).toLocaleString()
									: "—"}
							</div>
						</div>
					</section>

					<div></div>

					{/* <section className="rounded-2xl border bg-white p-4 shadow-sm "> */}
					<section className="rounded-2xl border bg-white p-4 shadow-sm flex overflow-y-auto scrollbar-hidden">
						<ChartPanel sub={sub} />
					</section>
				</div>
			),
		}));
	}, [resultList]);

	const items: TabItem[] = useMemo(
		() => (tabs?.length ? tabs : dynamicTabs),
		[tabs, dynamicTabs]
	);

	const [active, setActive] = useState<string>(
		initialTabId ?? items[0]?.id ?? ""
	);
	const activeIndex = Math.max(
		0,
		items.findIndex((t) => t.id === active)
	);

	useEffect(() => {
		if (!items.length) return;
		const exists = items.some((t) => t.id === active);
		if (!exists) setActive(items[0].id);
	}, [items, active]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (!items.length) return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				const next = (activeIndex + 1) % items.length;
				setActive(items[next].id);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				const prev = (activeIndex - 1 + items.length) % items.length;
				setActive(items[prev].id);
			} else if (e.key === "Home") {
				e.preventDefault();
				setActive(items[0].id);
			} else if (e.key === "End") {
				e.preventDefault();
				setActive(items[items.length - 1].id);
			}
		},
		[activeIndex, items]
	);

	if (!items.length) {
		return (
			<div className={cn("w-full", className)}>
				<div className="rounded-2xl border bg-white p-6 shadow-sm">
					No data found.
				</div>
			</div>
		);
	}
	const truncateChars = (text: string, limit = 10) => {
		const plain = htmlToText(text || "").trim();
		return plain.length > limit ? plain.slice(0, limit) + "..." : plain;
	};

	console.log(items, "itemsitemsitemsitemsitemsitemsitems");

	return (
		<div className={cn("w-full relative min-h-screen", className)}>
			<div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-6">
				<aside
					role="tablist"
					aria-label="Sections"
					onKeyDown={onKeyDown}
					className={cn(
						"fixed inset-x-0 bottom-0 z-40 bg-white border-t shadow-md p-2",
						"flex flex-row gap-2 overflow-x-auto scrollbar-hidden",
						"lg:static lg:z-auto lg:bg-white lg:rounded-2xl lg:border lg:shadow-sm lg:p-3",
						"lg:sticky lg:top-4 lg:self-start lg:h-[calc(92vh-80px)]",
						"lg:flex lg:flex-col lg:gap-0 lg:overflow-y-auto"
					)}
				>
					{items
						?.sort(
							(a, b) =>
								Number(a.serial_number) -
								Number(b.serial_number)
						)
						.map((t) => {
							const Icon = t.icon;
							const isActive = t.id === active;
							return (
								<button
									key={t.id}
									role="tab"
									aria-selected={isActive}
									aria-controls={`panel-${t.id}`}
									id={`tab-${t.id}`}
									onClick={() => setActive(t.id)}
									className={cn(
										"shrink-0 flex flex-col gap-4 items-center justify-center rounded-xl border px-3 py-2 relative",
										"min-w-[92px] h-[84px]",
										"transition active:scale-[0.98]",
										isActive
											? "bg-gray-100 border-gray-300 ring-1 ring-black/5"
											: "bg-white border-gray-200 hover:bg-gray-50",
										"lg:w-full lg:h-[132px] lg:px-5 lg:py-2 lg:mb-3 lg:rounded-[10px] lg:border-2 lg:border-[#2222] lg:hover:border-[#BC5EB3]"
									)}
								>
									<div className=" w-full">
										<div className=" absolute left-0 w-[20px] h-5 top-0 rounded-tl-[7px] rounded-br-[7px] text-[12px] items-center flex text-[#fff] justify-center group-hover:bg-[#BC5EB3] bg-[#BC5EB3] ">
											{t?.serial_number}
										</div>
									</div>
									<div className="flex flex-col justify-center items-center ">
										{Icon ? (
											<Icon className="h-4 w-4 shrink-0 mb-1" />
										) : null}

										{typeof t.images === "string" &&
										t.images.length > 0 ? (
											<Image
												src={t.images}
												alt={`${t.label} icon`}
												width={100}
												height={100}
												className="w-12 h-12 lg:w-16 lg:h-16 object-cover"
												priority={false}
											/>
										) : null}

										<span className="text-xs lg:text-sm font-bold">
											{/* {t.label} */}
											{truncateChars(`${t?.label}`, 30)}
										</span>
									</div>
									{loading ? (
										<span className="mt-1 text-[10px] lg:ml-auto lg:text-xs text-gray-400">
											loading…
										</span>
									) : null}
								</button>
							);
						})}
				</aside>

				<section className="pt-2 pb-28 lg:pb-4 p-4 bg-white border-2 rounded-[10px] min-h-[60vh] lg:h-[calc(92vh-80px)] flex flex-col overflow-y-auto scrollbar-hidden md:p-6 shadow-sm">
					<AnimatePresence mode="wait">
						{items.map((t) => {
							const isActive = t.id === active;
							return (
								isActive && (
									<motion.div
										key={t.id}
										role="tabpanel"
										id={`panel-${t.id}`}
										aria-labelledby={`tab-${t.id}`}
										initial={{ opacity: 0, y: 4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -4 }}
										transition={{ duration: 0.18 }}
										className="focus:outline-none"
									>
										{typeof t.content === "function"
											? t.content(t.id)
											: t.content}
									</motion.div>
								)
							);
						})}
					</AnimatePresence>
				</section>
			</div>
		</div>
	);
}
