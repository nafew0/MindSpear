/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import GoogleFormStyleSurvey from "@/components/Survey/GoogleFormStyleSurvey";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

export default function SurveyFormPage() {
	const params = useParams();
	const surveyId = params.id as string;

	const handleSurveySubmit = async (data: any) => {
		try {
			const payload = {
				survey_id: Number(data.survey_id ?? surveyId),
				responses: Array.isArray(data.responses)
					? data.responses.map((r: any) => ({
							question_id: r.question_id,
							answer: r.answer,
						}))
					: [],
				submitted_at: data.answered_at,
				...(data.anonymous_details
					? { anonymous_details: data.anonymous_details }
					: {}),
			};

			const response = await axiosInstance.post(
				`/survey-attempts/submit`,
				payload,
			);

			if (response.data.status) {
				return true;
			}
		} catch (error: any) {
			console.error("Survey submission error:", error);
			toast.error(
				error.response?.data?.message || "Failed to submit survey",
			);
		}
	};

	return (
		<GoogleFormStyleSurvey
			surveyId={surveyId}
			onSubmit={handleSurveySubmit}
			showProgressBar={true}
			multiPageView={true}
		/>
	);
}
