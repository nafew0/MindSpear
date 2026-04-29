/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo } from "react";
import QuestChoiceComponent from "./QuestChoiceComponent";
import QuestContentComponent from "./QuestContentComponent";
import QuestRankingComponent from "./QuestRankingComponent";
import QuestShortAnswerComponent from "./QuestShortAnswerComponent";
import QuickFormPreview from "./QuickFormPreview";
import QuestScalesChoiceComponent from "./QuestScalesChoiceComponent";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { LiveSessionStatus } from "@/features/live/types";
import AllQuestResult from "@/components/ResultComponent/AllQuestResult";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { ParticipantShell, ParticipantStage, WaitingStage } from "./participant-ui";

export interface TaskItem {
	id: number;
	quest_id: number;
	title: string;
	description?: string | null;
	task_type?: string;
	question_type?: string;
	serial_number: number;
	is_required?: boolean;
	created_at?: string;
	updated_at?: string;
	questions?: any[];
}

const UnsupportedComponent: React.FC<{ task: TaskItem }> = ({ task }) => (
	<div className="max-w-xl mx-auto space-y-3">
		<h3 className="text-2xl font-semibold text-gray-900 text-center">
			Unsupported task type
		</h3>
		<p className="text-center text-sm text-gray-500">
			Type: {task.task_type}
		</p>
		<p className="text-center text-sm text-gray-500">ID: {task.id}</p>
		<p className="text-center text-base">{task.title}</p>
	</div>
);

function QuestParticipantResultStage({
	sessionId,
	questTitle,
}: {
	sessionId: string | null;
	questTitle: string | null;
}) {
	if (!sessionId) {
		return (
			<WaitingStage
				mode="complete"
				title="Quest complete"
				message="Your responses are saved. The live result session could not be resolved on this device."
			/>
		);
	}

	return (
		<ParticipantStage
			size="full"
			className="overflow-visible bg-white/95 p-3 shadow-xl shadow-black/10 sm:p-5"
		>
			<div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
				<div className="flex items-start gap-3">
					<div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
						<BarChart3 className="h-5 w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary">
							<CheckCircle2 className="h-3.5 w-3.5" />
							Quest complete
						</div>
						<h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
							Cumulative results
						</h2>
						<p className="mt-1 text-sm font-medium text-slate-500">
							{questTitle || "Your live quest"} has ended. Review the group
							results below.
						</p>
					</div>
				</div>
			</div>

			<AllQuestResult
				attemId={sessionId}
				className="pb-2"
			/>
		</ParticipantStage>
	);
}

const componentForTaskType = (
	t: string
): React.ElementType<{ task: TaskItem }> => {
	const key = (t || "").toLowerCase();

	if (
		key === "single_choice" ||
		key === "quiz_single_choice" ||
		key === "multiple_choice" ||
		key === "quiz_multiple_choice" ||
		key === "fill_in_the_blanks_choice" ||
		key === "truefalse" ||
		key === "true_false_choice"
	) {
		return QuestChoiceComponent;
	}

	if (key === "content") return QuestContentComponent;
	if (key === "scales") return QuestScalesChoiceComponent;
	if (key === "ranking" || key === "sorting" || key === "shorting") {
		return QuestRankingComponent;
	}
	if (key === "quick_form") return QuickFormPreview;
	if (
		key === "shortanswer" ||
		key === "longanswer" ||
		key === "wordcloud" ||
		key === "sort_answer_choice"
	) {
		return QuestShortAnswerComponent;
	}

	return UnsupportedComponent;
};

export interface NavigatorProps {
	tasks: TaskItem[];
	currentItemId?: number | null;
	sessionStatus?: LiveSessionStatus;
}

const QuestPlayComponent: React.FC<NavigatorProps> = ({
	tasks,
	currentItemId,
	sessionStatus,
}) => {
	const searchParams = useSearchParams();
	const userName = searchParams.get("uname");
	const questTitle = searchParams.get("title");
	const sessionId = searchParams.get("sid");
	const { showLeaderboard } = useSelector((state: any) => state.leaderboard);

	const ordered = useMemo(
		() =>
			[...tasks].sort(
				(a, b) => a.serial_number - b.serial_number || a.id - b.id
			),
		[tasks]
	);

	const currentTask = useMemo(() => {
		if (!currentItemId) return null;
		return (
			ordered.find((task) => Number(task.id) === Number(currentItemId)) ??
			null
		);
	}, [currentItemId, ordered]);

	const isEnded = sessionStatus === "ended" || showLeaderboard;
	const Body: any = currentTask
		? componentForTaskType(
				String((currentTask.question_type || currentTask.task_type) ?? "")
			)
		: null;

	const handleLeaveQuest = useCallback(() => {
		try {
			const keys = Object.keys(localStorage);
			keys.forEach((key) => {
				if (key.startsWith("attempt-")) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
			console.error("Error leaving quest:", error);
		}
	}, []);

	React.useEffect(() => {
		if (isEnded) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			handleLeaveQuest();
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [handleLeaveQuest, isEnded]);

	return (
		<ParticipantShell
			variant="quest"
			title={questTitle}
			participantName={userName}
			sessionStatus={isEnded ? "ended" : sessionStatus}
		>
			{isEnded ? (
				<QuestParticipantResultStage
					sessionId={sessionId}
					questTitle={questTitle}
				/>
			) : (
				<>
					{currentTask && Body ? (
						<Body task={currentTask as TaskItem} />
					) : (
						<WaitingStage
							mode="lobby"
							title="You're in the quest lobby"
							message="Stay ready. The host will open the first task soon."
							statusLabel="Connected to live quest"
						/>
					)}
				</>
			)}
		</ParticipantShell>
	);
};

export default QuestPlayComponent;
