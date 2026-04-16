"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import QuizAttemptForm from "@/components/Liveui/QuizAttemptForm";
import QuestPlay from "@/views/quest/QuestPlay";

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
