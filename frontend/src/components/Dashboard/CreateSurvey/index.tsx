"use client";

import React from "react";
import classNames from "classnames";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import { Survey } from "@/types/types";
import { useDispatch } from "react-redux";
import { setSurvey } from "@/stores/survey/surveyInformationSlice";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import moment from "moment";
import { toast } from "react-toastify";
import { createSurvey } from "@/services/surveyService";

interface SurveyApiResponse {
	data: Survey;
}

function CreateSurvey() {
	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const dispatch = useDispatch();
	const router = useRouter();

	const handleItemClick = async (surveytypename: string, status: string) => {
		console.log(surveytypename, status);
		const endTime = new Date(
			new Date().setFullYear(new Date().getFullYear() + 5),
		);

		try {
			const surveyResponse = await createSurvey({
				title: "Untitled Survey",
				timezone: `${currentTimeZone}`,
				visibility: "public",
				surveytime_mode: true,
				start_datetime: moment(new Date()).format(
					"YYYY-MM-DD HH:mm:ss",
				),
				end_datetime: moment(endTime)
					.add(24, "hours")
					.format("YYYY-MM-DD HH:mm:ss"),
			});
			const surveyId = surveyResponse?.data?.data?.survey.id;
			if (!surveyId) {
				throw new Error("Survey creation failed: missing survey ID.");
			}
			const response = await axiosInstance.get<SurveyApiResponse>(
				`/surveys/show/${surveyId}`,
			);
			const surveyDataWithType = {
				...response?.data?.data,
				quiz_mode: "survey",
				qseaneType: `${surveytypename}`,
			};
			dispatch(setSurvey(surveyDataWithType));
			router.push(`/survey/create/${surveyId}`);

			// router.push(`/upcoming`);
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

			if (axiosError.response) {
				console.error("API error:", axiosError.response.data);
				toast.error(
					`Error: ${
						axiosError.response.data?.message || "Request failed."
					}`,
				);
			} else {
				console.error("Unexpected error:", axiosError.message);
				toast.error("Unexpected error occurred. Please try again.");
			}
		} finally {
		}
	};

	return (
		<section>
			<div className="flex-[0_1_calc(33.333%_-_30px)] cursor-pointer mb-[30px] overflow-hidden rounded-[28px]">
				<div
					onClick={() => handleItemClick("blank", "false")}
					className="group relative block overflow-hidden bg-[#f3f3fe] px-5 py-[30px] transition-all duration-300 ease-in-out hover:no-underline"
				>
					{/* Circle background with lower z-index */}
					<div
						className={classNames(
							"absolute top-[-75px] right-[-75px] h-[128px] w-[128px] rounded-full",
							"bg-[#f79a46]",
							"group-hover:scale-[10]",
							"transition-transform duration-500 ease-in-out",
							"z-0",
						)}
					></div>

					{/* Title */}
					<div className="relative z-10 text-[0.875rem] font-bold text-[#222] group-hover:text-white transition-colors duration-500 ease-in-out">
						New Survey
					</div>

					{/* Image with higher z-index and transparent background */}
					<div className="relative z-20 flex items-center justify-center">
						<Image
							src="/images/icons/survey.svg"
							alt="survey"
							width={150}
							height={60}
							className="transition-all duration-500 ease-in-out"
						/>
					</div>

					{/* Click Here */}
					<div className="relative z-10 text-[14px] text-[#f79a46] flex items-center justify-center">
						<span className="pl-1 font-bold text-center group-hover:text-white transition-colors duration-500 ease-in-out">
							Click Here
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

export default CreateSurvey;
