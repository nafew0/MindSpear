"use client";

import GoogleFormStyleSurvey from "@/features/survey/components/Survey/GoogleFormStyleSurvey";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";

interface SurveySubmissionData {
	survey_id: string | number;
	responses: Array<{
		question_id: number;
		answer: any;
	}>;
	answered_at: string;
}

export default function PublicSurveyPage() {
	const params = useParams();
	const surveyId = params?.id as string;

	const handleSurveySubmit = async (data: SurveySubmissionData) => {
		try {
			// Format the response for your API
			const formattedData = {
				survey_id: parseInt(data.survey_id as string),
				response_data: data.responses.reduce(
					(acc: Record<string, any>, item) => {
						acc[item.question_id] = item.answer;
						return acc;
					},
					{},
				),
				submitted_at: data.answered_at,
			};

			const response = await axiosInstance.post(
				`/surveys/${surveyId}/submit`,
				formattedData,
			);

			if (response.data.status) {
				return true;
			}
		} catch (error: any) {
			console.error("Survey submission error:", error);
			const errorMsg =
				error.response?.data?.message ||
				"Failed to submit survey. Please try again.";
			toast.error(errorMsg);
			throw error;
		}
	};

	if (!surveyId) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-lg p-8 text-center">
					<h2 className="text-xl font-semibold text-gray-900">
						Invalid Survey Link
					</h2>
					<p className="text-gray-600 mt-2">
						The survey you are looking for could not be found.
					</p>
				</div>
			</div>
		);
	}

	return (
		<GoogleFormStyleSurvey
			surveyId={surveyId}
			onSubmit={handleSurveySubmit}
			showProgressBar={true}
			multiPageView={true}
		/>
	);
}
