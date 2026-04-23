/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import QuizLiveFooter from "@/components/Layouts/quiz/QuizLiveFooter";
import QuestChoiceComponent from "./QuestChoiceComponent";
import QuestContentComponent from "./QuestContentComponent";
import QuestRankingComponent from "./QuestRankingComponent";
import QuestShortAnswerComponent from "./QuestShortAnswerComponent";
import QuickFormPreview from "./QuickFormPreview";
import QuestScalesChoiceComponent from "./QuestScalesChoiceComponent";
import WaitingRoomComponent from "./WaitingRoomComponent";
import { FaUser } from "react-icons/fa";
import QuestCompletedPages from "@/features/quest/components/QuestCompletedPages";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { LiveSessionStatus } from "@/features/live/types";

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
		: WaitingRoomComponent;

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
		<div className="h-screen overflow-auto bg-white relative">
			<div className="py-6 flex items-center justify-center">
				<Link href="/">
					<Image
						src="/images/logo/logo.svg"
						className="dark:hidden"
						alt="logo"
						role="presentation"
						quality={100}
						width={176}
						height={42}
					/>
				</Link>
			</div>

			<div className="flex gap-2 absolute top-5 right-5 justify-center items-center font-bold">
				<span className="bg-primary w-[40px] text-white h-[40px] rounded-full flex justify-center items-center">
					<FaUser />
				</span>
				<h3>{userName}</h3>
			</div>

			{isEnded ? (
				<QuestCompletedPages pagesStatus="user" />
			) : (
				<div className="bg-white w-full">
					<div className="mx-auto max-w-4xl px-4">
						{currentTask ? (
							<Body task={currentTask as TaskItem} />
						) : (
							<Body />
						)}
					</div>
				</div>
			)}

			<QuizLiveFooter />
		</div>
	);
};

export default QuestPlayComponent;
