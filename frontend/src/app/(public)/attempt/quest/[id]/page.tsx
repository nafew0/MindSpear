"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import QuizAttemptForm from "@/features/live/components/Liveui/QuizAttemptForm";
import QuestPlay from "@/features/quest/views/QuestPlay";

function QuestLivePage() {
	const searchParams = useSearchParams();
	const statusValue = searchParams.get("status");

	return (
		<div>
			{statusValue === "true" ? <QuestPlay /> : <QuizAttemptForm />}
		</div>
	);
}

export default QuestLivePage;
