/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { BarChart as GlobalBarChart } from "@/components/charts";
import { DonutChart as GlobalDonutChart } from "@/components/charts";
import { PieChart as GlobalPieChart } from "@/components/charts";
// import AnimatedWordCloud from "@/components/charts/AnimatedWordCloud";
// import HorizontalProgressBars from "@/components/charts";
import { WordCloud as D3WordCloud, type Word } from "@/components/charts";
import { HorizontalBarChart as GlobalHorizantalBarChart } from "@/components/charts";
import Image from "next/image";
import { getSocket } from "@/socket/quest-socket";
import { getSocket as quizgetSocket } from "@/socket/socket";
import DOMPurify from "dompurify";
import QuickFormCreatorView from "@/components/Liveui/QuickFormCreatorView";
// import { ScalesChart } from "@/components/charts";
import QuickShortAndLongAnswer from "@/components/Liveui/QuickShortAndLongAnswer";
import { useSelector } from "react-redux";
import { AllScalesChart } from "@/components/charts";
import { useParams } from "next/navigation";

interface QuestionViewProps {
	currentView: any;
	totalDatat: any;
	isFullscreen: boolean;
	data: any;
	categories: string[];
	colors: any;
	chartType: "bar" | "donut" | "dots" | "pie";
	title?: string;
	phrases?: any;
	currentTask: any;
}

type InputItem = {
	userId: string;
	userName: string;
	value: string | string[];
};

export type WordCloudItem = { text: string; value: number };
export function toWordCloud(
	data: InputItem[],
	opts: { max?: number; min?: number } = {}
): WordCloudItem[] {
	const { max = 60, min = 20 } = opts;

	// 1) Flatten values in order, preserving duplicates
	const flatTexts: string[] = [];
	for (const row of data) {
		const v = row.value;
		if (Array.isArray(v)) {
			for (const s of v) {
				const t = String(s ?? "").trim();
				if (t) flatTexts.push(t);
			}
		} else {
			const t = String(v ?? "").trim();
			if (t) flatTexts.push(t);
		}
	}

	// 2) Compute evenly spaced values from max..min
	const n = flatTexts.length;
	if (n === 0) return [];
	if (n === 1) return [{ text: flatTexts[0], value: max }];

	const step = (max - min) / (n - 1); // e.g. 60..20 across 5 items => 10
	const items: WordCloudItem[] = flatTexts.map((text, i) => ({
		text,
		value: Math.round(max - i * step),
	}));

	return items;
}

type DataMap = { [key: string]: number };
// type ScaleItem = { text: string; value: number };

export default function HostLiveQuestionView({
	currentView,
	isFullscreen,
	data,
	// totalDatat,
	categories = ["test", "new"],
	colors,
	chartType = "bar",
	title = "",
	phrases = [],
	currentTask,
}: QuestionViewProps) {
	const [rankinData, setRankingData] = useState<any>([]);
	const params = useParams();
	const mode = String((params as any)?.id ?? "").toLowerCase();
	// quizgetSocket
	const existing = mode === "quize" ? quizgetSocket() : getSocket();
	console.log(
		existing?.connected,
		"existingexistingexistingexistingexisting"
	);
	console.log(currentTask, "currentTaskcurrentTaskcurrentTaskcurrentTask");
	console.log(data, "dddddddddddddddddddddddddd");
	console.log(categories, "currentTaskcurrentTaskcurrentTaskcurrentTask");
	console.log(currentView, "currentTaskcurrentTaskcurrentTaskcurrentTask");
	const { showLeaderboard } = useSelector((state: any) => state.leaderboard);
	console.log(mode, "modemodemodemodemodemodemode");

	const prevKeyRef = useRef<string | null>(null);
	const forceRestartRef = useRef(false);
	const questTimeData = useSelector((state: any) => state.questTime);
	const { questId, questionId, questiQsenTime } = questTimeData;

	const total = useMemo<number>(() => {
		const raw = Number(questiQsenTime);
		return raw > 0 ? raw : 60;
	}, [questiQsenTime]);

	const progressRef = useRef<HTMLSpanElement | null>(null);
	const timeRef = useRef<HTMLSpanElement | null>(null);

	const storageKey = useMemo(
		() => (questId && questionId ? `timer_${questId}_${questionId}` : null),
		[questId, questionId]
	);

	const getCachedTime = useCallback(() => {
		if (!storageKey) return null;
		try {
			const cached = localStorage.getItem(storageKey);
			if (cached) {
				const data = JSON.parse(cached);

				if (data.completed) {
					console.log("Timer was already completed");
					return 0;
				}

				const currentTime = Date.now();
				const elapsedSeconds = (currentTime - data.startTime) / 1000;
				const remaining = Math.max(0, data.totalTime - elapsedSeconds);

				console.log("Cache debug:", {
					startTime: data.startTime,
					currentTime,
					elapsedSeconds,
					totalTime: data.totalTime,
					remaining,
				});

				return remaining;
			}
		} catch (error) {
			console.error("Error reading cached time:", error);
		}
		return null;
	}, [storageKey]);

	const saveCurrentTime = useCallback(
		(startTime: number, totalTime: number, completed: boolean = false) => {
			if (!storageKey) return;
			try {
				localStorage.setItem(
					storageKey,
					JSON.stringify({
						startTime,
						totalTime,
						questId,
						questionId,
						savedAt: Date.now(),
						completed: completed,
					})
				);
			} catch (error) {
				console.error("Error saving time to localStorage:", error);
			}
		},
		[storageKey, questId, questionId]
	);

	const clearAllTimerData = useCallback(() => {
		try {
			Object.keys(localStorage).forEach((key) => {
				if (key.startsWith("timer_")) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.error("Error clearing timer data:", error);
		}
	}, []);

	useEffect(() => {
		if (showLeaderboard === true) {
			clearAllTimerData();
		}
	}, [showLeaderboard]);

	const formatMMSS = (sec: number) => {
		const s = Math.max(0, Math.ceil(sec || 0));
		const m = Math.floor(s / 60);
		const ss = String(s % 60).padStart(2, "0");
		return `${m}:${ss}`;
	};

	useEffect(() => {
		if (!storageKey) return;

		const prevKeyInSession = sessionStorage.getItem("timer_prev_key");

		if (prevKeyInSession && prevKeyInSession !== storageKey) {
			try {
				localStorage.removeItem(storageKey);
			} catch {}
			forceRestartRef.current = true;
		} else {
			const hasCache = (() => {
				try {
					const c = localStorage.getItem(storageKey);
					if (!c) return false;
					const parsed = JSON.parse(c);
					return parsed?.startTime && parsed?.totalTime;
				} catch {
					return false;
				}
			})();
			forceRestartRef.current = !hasCache;
		}

		sessionStorage.setItem("timer_prev_key", storageKey);
		prevKeyRef.current = storageKey;
	}, [storageKey]);

	useEffect(() => {
		if (
			!progressRef.current ||
			!timeRef.current ||
			total <= 0 ||
			!storageKey
		)
			return;

		if (forceRestartRef.current) {
			const startTime = Date.now();
			saveCurrentTime(startTime, total, false);

			progressRef.current.style.transition = "none";
			progressRef.current.style.width = "0%";
			timeRef.current.textContent = formatMMSS(total);

			forceRestartRef.current = false;
		}

		const cachedRemaining = getCachedTime();
		if (cachedRemaining === 0) {
			progressRef.current.style.transition = "none";
			progressRef.current.style.width = "100%";
			timeRef.current.textContent = "0:00";
			return;
		}

		let startTime: number;
		let initialRemaining: number;

		if (cachedRemaining !== null && cachedRemaining > 0) {
			initialRemaining = cachedRemaining;
			const elapsed = total - cachedRemaining;
			startTime = Date.now() - elapsed * 1000;
		} else {
			initialRemaining = total;
			startTime = Date.now();
			saveCurrentTime(startTime, total, false);
		}

		const initialElapsed = total - initialRemaining;
		progressRef.current.style.transition = "none";
		progressRef.current.style.width = `${(initialElapsed / total) * 100}%`;
		timeRef.current.textContent = formatMMSS(initialRemaining);

		// force reflow
		progressRef.current.getBoundingClientRect();
		progressRef.current.style.transition = "width 100ms linear";

		const endTime = startTime + total * 1000;
		let rafId: number;
		let lastSaveTime = Date.now();

		const tick = () => {
			const currentTime = Date.now();
			const elapsedMs = currentTime - startTime;
			const remainingMs = Math.max(0, endTime - currentTime);
			const remainingSeconds = remainingMs / 1000;
			const elapsedSeconds = elapsedMs / 1000;

			const progressPercent = Math.min(
				100,
				(elapsedSeconds / total) * 100
			);

			if (progressRef.current) {
				progressRef.current.style.width = `${progressPercent}%`;
			}
			if (timeRef.current) {
				timeRef.current.textContent = formatMMSS(remainingSeconds);
			}

			if (currentTime - lastSaveTime > 1000) {
				saveCurrentTime(startTime, total, false);
				lastSaveTime = currentTime;
			}

			if (currentTime < endTime) {
				rafId = requestAnimationFrame(tick);
			} else {
				saveCurrentTime(startTime, total, true);
				if (progressRef.current)
					progressRef.current.style.width = "100%";
				if (timeRef.current) timeRef.current.textContent = "0:00";
			}
		};

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [total, storageKey, getCachedTime, saveCurrentTime]);

	const renderChart = () => {
		if (chartType === "bar") {
			return (
				<div className="w-[80%] m-auto">
					<GlobalBarChart
						data={
							data?.number?.length
								? data?.number
								: Array.from(
										{ length: categories?.length },
										() => 0
								  )
						}
						categories={categories}
					/>
				</div>
			);
		}
		if (chartType === "pie") {
			console.log(data, "datadatadatadatadatadata");
			return (
				<div className="w-[80%] m-auto flex justify-center items-center pb-[40px]">
					<GlobalPieChart
						series={data?.number?.length ? data?.number : [0]}
						labels={categories?.length ? categories : [""]}
						colors={[]}
					/>
				</div>
			);
		}
		if (chartType === "donut") {
			console.log(data, "datadatadatadatadatadata");
			return (
				<div className="w-[80%] m-auto flex justify-center items-center pb-[40px]">
					<GlobalDonutChart
						series={data?.number?.length ? data?.number : [0]}
						labels={categories.length ? categories : [""]}
						colors={[]}
					/>
				</div>
			);
		}

		console.log(data, "datadatadatadatadatadata 000");

		// dots or unknown -> fallback to bar
		return (
			<div className="w-[80%] m-auto">
				{/* <GlobalBarChart data={data?.number} categories={categories} /> */}
			</div>
		);
	};

	function transformData(data: DataMap, categories: string[]) {
		return Object.entries(data)
			.map(([key, value]) => ({
				count: value,
				text: categories[parseInt(key, 10)],
			}))
			.sort((a, b) => b?.count - a.count);
	}

	const values: Word[] = toWordCloud(phrases, { max: 60, min: 20 });

	useEffect(() => {
		if (data === undefined) return;
		const result = transformData(data, categories);
		setRankingData(result);
	}, [data, categories]);

	const SafeHTML = ({ html }: { html: string }) => {
		const cleanHtml = DOMPurify.sanitize(html);
		return <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
	};

	const scaleItems: any = data
		? Object.entries(data)
				.map(([k, v]) => ({ idx: Number(k), value: v }))
				.sort((a: any, b: any) => b.value - a.value || a.idx - b.idx)
				.map(({ idx, value }) => ({ text: categories[idx], value }))
		: [];

	console.log(
		scaleItems,
		"scaleItemsscaleItemsscaleItemsscaleItemsscaleItemsscaleItems"
	);

	const images =
		currentView === "single_choice"
			? "/images/icons/Icon-01.svg"
			: currentView === "multiple_choice"
			? "/images/icons/Icon-01.svg"
			: currentView === "sorting"
			? "/images/icons/sorting.svg"
			: currentView === "truefalse"
			? "/images/icons/yes-no.svg"
			: currentView === "wordcloud"
			? "/images/icons/word-cloud.svg"
			: currentView === "ranking"
			? "/images/icons/ranking.svg"
			: currentView === "shortanswer"
			? "/images/icons/Icon-03.svg"
			: currentView === "longanswer"
			? "/images/icons/long-answer.svg"
			: currentView === "quick_form"
			? "/images/icons/quick-form.svg"
			: currentView === "scales"
			? "/images/icons/scales.svg"
			: "https://admin.dev.mindspear.app/storage/2025/09/22/profile_pictures_1/HD99ziKO3iGXvi25iolLRhnYYUFoxJun5GSYU0AG.svg";
	// const datalist = data !== undefined && data !== null ? data?.text[0].value : []
	console.log(data, "datalist");
	const datalist =
		(data && currentTask?.task_type === "shortanswer") ||
		currentTask?.task_type === "longanswer"
			? data?.text?.flatMap((item: any) => item.value)
			: [];
	console.log(currentTask, "datalist");

	// const datalist =  []
	return (
		<div
			className={`flex-1 flex flex-col  items-center py-4 overflow-y-auto scrollbar-hidden  ${
				isFullscreen
					? "h-[calc(100vh-120px)]"
					: chartType === "pie"
					? ""
					: chartType === "donut"
					? ""
					: "justify-between"
			}`}
		>
			<div className="w-[80%]  flex relative px-4 py-6 shadow text-xl rounded-[10px] font-semibold mb-4 text-center justify-center">
				<span
					className="w-full h-[5px] bg-slate-200/70 absolute top-0 left-0"
					aria-hidden="true"
				/>
				{/* #f79945 */}
				<span
					ref={progressRef}
					className={`h-[5px] absolute top-0 left-0 ${
						existing?.connected ? "bg-[#f79945]" : "bg-[#bc5eb3]"
					}`}
					style={{ width: "0%", transition: "width 100ms linear" }}
					aria-label="time progress"
				/>
				<span
					ref={timeRef}
					className="absolute -top-5 right-0 text-sm font-medium tabular-nums select-none"
				>
					{formatMMSS(total)}
				</span>
				<SafeHTML html={title} />

				<button
					onClick={clearAllTimerData}
					className="absolute hidden -top-8 left-0 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
					title="Clear all timer cache"
				>
					Clear Timers
				</button>
			</div>

			<Image
				src={`${images}`}
				alt="Logo"
				width={206}
				height={62}
				className="mb-4 opacity-[.2] absolute top-[42%] hidden"
			/>

			{currentView === "single_choice" ||
			currentView === "multiple_choice" ||
			currentView === "truefalse" ||
			currentView === "fill_in_the_blanks_choice" ? (
				<div className="w-full px-4">{renderChart()}</div>
			) : currentView === "scales" ? (
				<div className="w-[80%] px-4 h-[900px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] ">
					<AllScalesChart title="" items={scaleItems} />
					{/* <HorizontalProgressBars
						data={data}
						labels={categories}
						colors={uniqueColors}
					/> */}
				</div>
			) : currentView === "ranking" || currentView === "sorting" ? (
				<div className="w-[80%] px-4">
					<GlobalHorizantalBarChart
						data={
							rankinData?.length > 0
								? rankinData?.map((opt: any) => opt?.count)
								: [0, 0, 0, 0]
						}
						categories={rankinData?.map((opt: any) => opt?.text)}
						colors={
							Array.isArray(colors)
								? colors
										.map((opt: any) => opt?.color)
										.filter(Boolean)
								: []
						}
					/>
				</div>
			) : currentView === "quick_form" ? (
				<div className=" w-[78%] absolute top-50  ">
					<QuickFormCreatorView quickFromId={currentTask?.id} />
				</div>
			) : currentView === "shortanswer" ||
			  currentView === "longanswer" ? (
				<div className=" w-[78%]  absolute top-50  ">
					<QuickShortAndLongAnswer answerData={datalist} />
				</div>
			) : currentView === "content" ? (
				<div className=" w-[78%]    ">
					<div
						className=" overflow-auto flex flex-col justify-center items-center px-4"
						style={{
							backgroundImage: `url('${currentTask?.image_url}')`,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					>
						<div className="bg-white p-3 shadow-3 rounded-[10px]">
							<div
								dangerouslySetInnerHTML={{
									__html: currentTask?.contant_title,
								}}
								className="prose max-w-none"
							/>
						</div>
					</div>
				</div>
			) : (
				<div className="min-h-[850px] w-full flex items-center justify-center">
					<D3WordCloud
						words={values}
						width={1000}
						height={850}
						minFont={12}
						maxFont={72}
						rotate={() => (Math.random() > 0.85 ? 90 : 0)}
						// onWordClick={(w) => console.log("Clicked:", w)}
						className=""
					/>
				</div>
			)}
			{/* currentTask */}
		</div>
	);
}
