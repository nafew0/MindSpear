"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useSurveyOptional } from "@/contexts/SurveyContext";
import type { Quiz } from "@/types/types";

interface QuizApiResponse {
	data: Quiz;
}

/**
 * This component fetches and initializes survey data in the context
 * It should be rendered early in the component tree to ensure data is available
 * for downstream components like CreateQuizHeader
 */
export default function SurveyDataInitializer() {
	const params = useParams();
	const surveyContext = useSurveyOptional();

	useEffect(() => {
		const fetchSurveyData = async () => {
			try {
				if (!params?.id || !surveyContext) return;

				// Only fetch if survey information hasn't been loaded yet
				if (surveyContext?.state.surveyInformation?.id) {
					return;
				}

				const response = await axiosInstance.get<QuizApiResponse>(
					`/surveys/show/${params.id}`,
				);

				const surveyData = response?.data?.data?.survey;
				if (surveyData) {
					surveyContext.actions.setSurveyInformation(surveyData);
					surveyContext.actions.setSurveyId(params.id as string);
				}
			} catch (error) {
				console.error("Error fetching survey data:", error);
			}
		};

		fetchSurveyData();
	}, [params?.id]);

	return null;
}
