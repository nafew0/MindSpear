"use client";

import QuizTab from "@/features/dashboard/discover/QuizTab";
import Title from "../../../../components/ui/Title";

export default function Discover() {
	return (
		<div className="min-h-screen">
			<Title as="h2">Discover Quizzes</Title>
			<QuizTab />
		</div>
	);
}
