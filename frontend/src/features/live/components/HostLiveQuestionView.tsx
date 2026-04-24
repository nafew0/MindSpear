/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { BarChart as GlobalBarChart } from "@/components/charts";
import { DonutChart as GlobalDonutChart } from "@/components/charts";
import { PieChart as GlobalPieChart } from "@/components/charts";
import { WordCloud as D3WordCloud } from "@/components/charts";
import { HorizontalBarChart as GlobalHorizantalBarChart } from "@/components/charts";
import { AllScalesChart } from "@/components/charts";
import Image from "next/image";
import DOMPurify from "dompurify";
import QuickFormCreatorView from "@/features/live/components/Liveui/QuickFormCreatorView";
import QuickShortAndLongAnswer from "@/features/live/components/Liveui/QuickShortAndLongAnswer";
import { useSelector } from "react-redux";
import type { HostLiveViewModel } from "@/features/live/services/hostLiveViewModel";

type HostLiveQuestionViewProps = {
	isFullscreen: boolean;
	chartType: "bar" | "donut" | "dots" | "pie";
	viewModel: HostLiveViewModel;
};

export default function HostLiveQuestionView({
	isFullscreen,
	chartType = "bar",
	viewModel,
}: HostLiveQuestionViewProps) {
	const { showLeaderboard } = useSelector((state: any) => state.leaderboard);
	const questTimeData = useSelector((state: any) => state.questTime);
	const { questId, questionId, questiQsenTime } = questTimeData;

	const total = useMemo<number>(() => {
		const raw = Number(questiQsenTime);
		return raw > 0 ? raw : 60;
	}, [questiQsenTime]);

	const progressRef = useRef<HTMLSpanElement | null>(null);
	const timeRef = useRef<HTMLSpanElement | null>(null);
	const forceRestartRef = useRef(false);

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
					return 0;
				}

				const currentTime = Date.now();
				const elapsedSeconds = (currentTime - data.startTime) / 1000;
				return Math.max(0, data.totalTime - elapsedSeconds);
			}
		} catch (error) {
			console.error("Error reading cached time:", error);
		}
		return null;
	}, [storageKey]);

	const saveCurrentTime = useCallback(
		(startTime: number, totalTime: number, completed = false) => {
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
						completed,
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
		if (showLeaderboard) {
			clearAllTimerData();
		}
	}, [clearAllTimerData, showLeaderboard]);

	const formatMMSS = (sec: number) => {
		const seconds = Math.max(0, Math.ceil(sec || 0));
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = String(seconds % 60).padStart(2, "0");
		return `${minutes}:${remainingSeconds}`;
	};

	useEffect(() => {
		if (!storageKey) return;

		const previousKey = sessionStorage.getItem("timer_prev_key");

		if (previousKey && previousKey !== storageKey) {
			try {
				localStorage.removeItem(storageKey);
			} catch {}
			forceRestartRef.current = true;
		} else {
			const hasCache = (() => {
				try {
					const cached = localStorage.getItem(storageKey);
					if (!cached) return false;
					const parsed = JSON.parse(cached);
					return parsed?.startTime && parsed?.totalTime;
				} catch {
					return false;
				}
			})();
			forceRestartRef.current = !hasCache;
		}

		sessionStorage.setItem("timer_prev_key", storageKey);
	}, [storageKey]);

	useEffect(() => {
		if (
			!progressRef.current ||
			!timeRef.current ||
			total <= 0 ||
			!storageKey
		) {
			return;
		}

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
				if (progressRef.current) {
					progressRef.current.style.width = "100%";
				}
				if (timeRef.current) {
					timeRef.current.textContent = "0:00";
				}
			}
		};

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [total, storageKey, getCachedTime, saveCurrentTime]);

	const SafeHTML = ({ html }: { html: string }) => {
		const cleanHtml = DOMPurify.sanitize(html);
		return <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
	};

	const waitingForResponses = (
		<div className="w-full min-h-[220px] flex items-center justify-center text-center text-gray-500">
			<div>
				<p className="text-lg font-semibold text-gray-700">
					Waiting for responses
				</p>
				<p className="text-sm">
					Participant answers will appear here in real time.
				</p>
			</div>
		</div>
	);

	const images =
		viewModel.currentView === "single_choice"
			? "/images/icons/Icon-01.svg"
			: viewModel.currentView === "multiple_choice"
			? "/images/icons/Icon-01.svg"
			: viewModel.currentView === "sorting"
			? "/images/icons/sorting.svg"
			: viewModel.currentView === "truefalse"
			? "/images/icons/yes-no.svg"
			: viewModel.currentView === "wordcloud"
			? "/images/icons/word-cloud.svg"
			: viewModel.currentView === "ranking"
			? "/images/icons/ranking.svg"
			: viewModel.currentView === "shortanswer"
			? "/images/icons/Icon-03.svg"
			: viewModel.currentView === "longanswer"
			? "/images/icons/long-answer.svg"
			: viewModel.currentView === "quick_form"
			? "/images/icons/quick-form.svg"
			: viewModel.currentView === "scales"
			? "/images/icons/scales.svg"
			: "/images/placeholder.jpg";

	const shouldShowWaiting =
		viewModel.isResponseDriven && !viewModel.hasResponses;

	const renderChoiceChart = () => {
		if (chartType === "bar") {
			return (
				<div className="w-[80%] m-auto">
					<GlobalBarChart
						data={viewModel.choiceSeries}
						categories={viewModel.categories}
					/>
				</div>
			);
		}

		if (chartType === "pie") {
			return (
				<div className="w-[80%] m-auto flex justify-center items-center pb-[40px]">
					<GlobalPieChart
						series={
							viewModel.choiceSeries.length
								? viewModel.choiceSeries
								: [0]
						}
						labels={
							viewModel.categories.length ? viewModel.categories : [""]
						}
						colors={[]}
					/>
				</div>
			);
		}

		if (chartType === "donut") {
			return (
				<div className="w-[80%] m-auto flex justify-center items-center pb-[40px]">
					<GlobalDonutChart
						series={
							viewModel.choiceSeries.length
								? viewModel.choiceSeries
								: [0]
						}
						labels={
							viewModel.categories.length ? viewModel.categories : [""]
						}
						colors={[]}
					/>
				</div>
			);
		}

		return <div className="w-[80%] m-auto" />;
	};

	const renderBody = () => {
		if (shouldShowWaiting) {
			return waitingForResponses;
		}

		switch (viewModel.displayKind) {
			case "choice":
				return <div className="w-full px-4">{renderChoiceChart()}</div>;

			case "scales":
				return (
					<div className="w-[80%] px-4 h-[900px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] ">
						<AllScalesChart title="" items={viewModel.scaleItems} />
					</div>
				);

			case "ranking":
				return (
					<div className="w-[80%] px-4">
						<GlobalHorizantalBarChart
							data={viewModel.rankingItems.map((item) => item.count)}
							categories={viewModel.rankingItems.map((item) => item.text)}
							colors={viewModel.rankingItems
								.map((item) => item.color)
								.filter(Boolean)}
						/>
					</div>
				);

			case "text":
				return (
					<div className="w-[78%] absolute top-50">
						<QuickShortAndLongAnswer answerData={viewModel.textAnswers} />
					</div>
				);

			case "wordcloud":
				return (
					<div className="min-h-[850px] w-full flex items-center justify-center">
						<D3WordCloud
							words={viewModel.wordCloudWords}
							width={1000}
							height={850}
							minFont={12}
							maxFont={72}
							rotate={() => (Math.random() > 0.85 ? 90 : 0)}
							className=""
						/>
					</div>
				);

			case "quick_form":
				return (
					<div className="w-[78%] absolute top-50">
						<QuickFormCreatorView
							answerData={viewModel.quickFormAnswers}
							quickFromId={viewModel.quickFormId}
						/>
					</div>
				);

			case "content":
				return (
					<div className="w-[78%]">
						<div
							className="overflow-auto flex flex-col justify-center items-center px-4"
							style={{
								backgroundImage: viewModel.imageUrl
									? `url('${viewModel.imageUrl}')`
									: undefined,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						>
							<div className="bg-white p-3 shadow-3 rounded-[10px]">
								<div
									dangerouslySetInnerHTML={{
										__html: viewModel.contentHtml,
									}}
									className="prose max-w-none"
								/>
							</div>
						</div>
					</div>
				);
		}
	};

	return (
		<div
			className={`flex-1 flex flex-col items-center py-4 overflow-y-auto scrollbar-hidden ${
				isFullscreen
					? "h-[calc(100vh-120px)]"
					: chartType === "pie" || chartType === "donut"
					? ""
					: "justify-between"
			}`}
		>
			<div className="w-[80%] flex relative px-4 py-6 shadow text-xl rounded-[10px] font-semibold mb-4 text-center justify-center">
				<span
					className="w-full h-[5px] bg-slate-200/70 absolute top-0 left-0"
					aria-hidden="true"
				/>
				<span
					ref={progressRef}
					className="h-[5px] absolute top-0 left-0 bg-[#f79945]"
					style={{ width: "0%", transition: "width 100ms linear" }}
					aria-label="time progress"
				/>
				<span
					ref={timeRef}
					className="absolute -top-5 right-0 text-sm font-medium tabular-nums select-none"
				>
					{formatMMSS(total)}
				</span>
				<SafeHTML html={viewModel.title} />

				<button
					onClick={clearAllTimerData}
					className="absolute hidden -top-8 left-0 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
					title="Clear all timer cache"
				>
					Clear Timers
				</button>
			</div>

			<Image
				src={images}
				alt="Logo"
				width={206}
				height={62}
				className="mb-4 opacity-[.2] absolute top-[42%] hidden"
			/>

			{renderBody()}
		</div>
	);
}
