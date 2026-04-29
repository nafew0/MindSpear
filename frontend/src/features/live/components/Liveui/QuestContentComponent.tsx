"use client";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useSelector } from "react-redux";

import { AxiosError } from "axios";
import { TimerCacheManager } from "@/utils/timerCacheUtils";
import SharedQuestTimer from "@/components/SharedQuestTimer";
import {
	ParticipantStage,
	ParticipantTimerPanel,
	WaitingStage,
} from "./participant-ui";
type TaskQuestion = {
	id: number | string;
	text?: string;
	label?: string;
	color?: string;
};
type TaskItem = {
	id?: number | string;
	quiz_id?: number | string;
	serial_number?: number;
	title?: string;
	question_type?: string;
	task_type?: string;
	description?: string | null;
	questions?: TaskQuestion[];
	time_limit_seconds?: number | string;
	source_content_url?: string | null;
};
type Props = {
	task?: TaskItem | any;
	value?: string | null; // kept for backward compat on single-select
	onChange?: (val: string) => void;
};
const QuestContentComponent: React.FC<Props> = ({ task }) => {
	//   const answers = useSelector((state: RootState) => state.answers);
	const searchParams = useSearchParams();
	const joinid = searchParams.get("jid");
	const [watingData, setwatingData] = useState(true);
	const [, setchalangeData] = useState<any>({});
	const questTimeData = useSelector((state: any) => state.questTime);
	useEffect(() => {
		if (typeof window !== "undefined" && !navigator.onLine) {
			console.warn("Offline — skipping API call");
			return;
		}
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get(
					`/quest-attempts-url/show-by-link/${joinid}`,
				);
				setchalangeData(response?.data?.data?.quest);
			} catch (error) {
				const axiosError = error as AxiosError<{
					message?: string;
				}>;
				console.error("Unexpected error:", axiosError.message);
			}
		};
		dataFetch();
	}, [joinid]);
	const dataNew: any = task;
	useEffect(() => {
		if (!task?.id) return;
		const key = `timeExpired_${task.id}`;
		const userStatus: any = localStorage.getItem(key);
		if (userStatus !== null) {
			const savedState = JSON.parse(userStatus);
			if (
				savedState?.status === "completed" ||
				(savedState?.submitStatus === "completed" &&
					task.id === savedState?.taskId)
			) {
				setwatingData(false);
			}
		} else {
			setwatingData(true);
		}
	}, [dataNew?.id]);
	const handleExpire = () => {
		if (!questTimeData?.questionId) return;
		const saved = setTaskExpired(questTimeData.questionId);
		const ok =
			saved?.status === "completed" &&
			String(saved?.taskId ?? questTimeData.questionId) ===
				String(questTimeData.questionId);
		if (ok) {
			setwatingData(false);
		}
	};
	const setTaskExpired = (questionId: string | number) => {
		const key = `timeExpired_${questionId}`;
		const payload = {
			status: "completed",
			submitStatus: "complited",
			taskId: questionId,
			ts: Date.now(),
		};
		localStorage.setItem(key, JSON.stringify(payload));
		setwatingData(false);
		return payload;
	};
	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === `timeExpired_${questTimeData?.questionId}`) {
				// re-run your same logic
				try {
					const parsed = e.newValue ? JSON.parse(e.newValue) : null;
					const ok =
						parsed?.status === "completed" &&
						String(parsed?.taskId ?? questTimeData?.questionId) ===
							String(questTimeData?.questionId);
					setwatingData(!!ok);
				} catch {
					setwatingData(e.newValue === "completed");
				}
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [questTimeData?.questionId]);

	// 4) when the timer truly finishes, mark completed to freeze state forever
	const onExpireWrapped = useCallback(() => {
		if (dataNew?.id != null) TimerCacheManager.markCompleted(dataNew.id);
		if (typeof handleExpire === "function") handleExpire();
	}, [dataNew?.id, handleExpire]);
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
	const handleTimeUpdate = () => {};
	return (
		<>
			{watingData ? (
				<ParticipantStage size="wide">
					<div className="flex min-h-0 flex-1 flex-col">
						<button
							className="hidden"
							onClick={() => onExpireWrapped()}
						>
							{" "}
							All QuizTimer Clear{" "}
						</button>

						<div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
							<div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-start">
								<div className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-primary/10 p-4">
									<p className="text-xs font-black uppercase tracking-wide text-primary">
										Content slide
									</p>
									<h2 className="mt-2 break-words text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
										{htmlToText(task?.title)}
									</h2>
								</div>

								<ParticipantTimerPanel>
									<SharedQuestTimer
										attemptId={`attempt-${dataNew?.id}`}
										onTimeUpdate={handleTimeUpdate}
										onExpire={handleExpire}
									/>
								</ParticipantTimerPanel>
							</div>

							<div
								className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950"
								style={
									task?.image_url?.path
										? {
												backgroundImage: `linear-gradient(rgba(15,23,42,.72), rgba(15,23,42,.72)), url('${task.image_url.path}')`,
												backgroundSize: "cover",
												backgroundPosition: "center",
											}
										: undefined
								}
							>
								<div
									dangerouslySetInnerHTML={{
										__html: task?.contant_title,
									}}
									className="prose max-w-none p-5 text-white prose-headings:text-white prose-p:text-white/90 prose-strong:text-white"
								/>
							</div>
						</div>
					</div>
				</ParticipantStage>
			) : (
				<WaitingStage mode="host" />
			)}
		</>
	);
};
export default QuestContentComponent;
