"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";

import QuestChoiceCreatorPreview from "./QuestChoiceCreatorPreview";
import QuestTrueFalseCreatorPreview from "./QuestTrueFalseCreatorPreview";
import QuestWordCloudCreatorPreview from "./QuestWordCloudCreatorPreview";
import QuestQuickFormCreatorPreview from "./QuestQuickFormCreatorPreview";
import QuestRankingCreatorPreview from "./QuestRankingCreatorPreview";
import QuestScalesCreatorPreview from "./QuestScalesCreatorPreview";
import QuestshortingCreatorPreview from "./QuestshortingCreatorPreview";
import QuestShortAnswerCreatorPreview from "./QuestShortAnswerCreatorPreview";

import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useParams, usePathname } from "next/navigation";
import { setQuiz } from "@/features/quiz/store/quizInformationSlice";
import type { Quiz } from "@/types/types";
import { convertTaskData } from "@/utils/questDataTransformer";
import { setMultipleSelectedItems } from "@/features/quiz/store/quizItems/quizSlice";
import { PiWarningCircle } from "react-icons/pi";
import { setQuest } from "@/features/quest/store/questInformationSlice";
import QuestContantCreatorPreview from "./QuestContantCreatorPreview";
import { toast } from "react-toastify";
// import ContentType from "./ContentType";
// import ContentType from "./ContentType";
// import ContentType from "./ContentType";

interface QuizItem {
	key: string;
	id: string;
}

interface QuizApiResponse {
	data: Quiz;
}

interface QuizState {
	qseaneType: string;
	quiz: Quiz;
}
interface QuizInformationProps {
	questInformation: {
		questInformation: QuizState;
	};
}

function QuestContantView() {
	const params = useParams();
	const pathname = usePathname();
	const isQuestSttaus = pathname.includes("quest/edit");
	const dispatch = useDispatch();

	const qId = params?.id as string;
	const quesentList = useSelector(
		(state: RootState) => state.quiz.multypleselectedItem,
	);

	const multypleselectedItem = quesentList?.filter(
		(list) => `${list?.quiz_id}` === `${qId}`,
	);

	const quizData = useSelector(
		(state: QuizInformationProps) =>
			state.questInformation.questInformation,
	);

	const hoveredItem = useSelector(
		(state: RootState) => state.quiz.hoveredItem,
	);
	const selectedItem = useSelector(
		(state: RootState) => state.quiz.selectedItem,
	);

	// console.log(
	// 	selectedItem,
	// 	"selectedItemselectedItemselectedItemselectedItemselectedItem"
	// );
	// console.log(
	// 	multypleselectedItem,
	// 	"selectedItemselectedItemselectedItemselectedItemselectedItem"
	// );

	const renderPreview = (item: QuizItem | null) => {
		// console.log(item, "9999999999999");

		if (!item)
			return (
				<div className="h-[calc(90vh-80px)] bg-[#fff] rounded-[10px] flex flex-col justify-center items-center">
					<PiWarningCircle className="text-[60px] text-[#fda14d]" />
					<h3 className="font-bold text-[#333] pt-[15px]">
						Please create you question
					</h3>
				</div>
			);

		switch (item.key) {
			case "qsenchoice":
				return <QuestChoiceCreatorPreview id={item.id} />;
			case "sorting":
				return <QuestshortingCreatorPreview id={item.id} />;
			case "truefalse":
				return <QuestTrueFalseCreatorPreview id={item.id} />;
			case "wordcloud":
				return <QuestWordCloudCreatorPreview id={item.id} />;
			case "scales":
				return <QuestScalesCreatorPreview id={item.id} />;
			case "ranking":
				return <QuestRankingCreatorPreview id={item.id} />;
			case "shortanswer":
				return <QuestShortAnswerCreatorPreview id={item.id} />;
			case "longanswer":
				return <QuestShortAnswerCreatorPreview id={item.id} />;
			case "quick_form":
				return <QuestQuickFormCreatorPreview id={item.id} />;
			case "content":
				return <QuestContantCreatorPreview id={item.id} />;
			// case "content":
			// 	return (
			// 		<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-[10px] h-[calc(90vh-80px)] flex flex-col">
			// 			<ContentType id={item.id} />
			// 		</div>
			// 	);
			default:
				return (
					<div className="flex-1 p-4 bg-white border-2 border-[#bc5eb3] rounded-[10px] h-[calc(90vh-80px)] flex flex-col">
						Coming Soon
					</div>
				);
		}
	};

	const activeItem = hoveredItem ?? selectedItem;

	useEffect(() => {
		const dataFetch = async () => {
			try {
				const response = await axiosInstance.get<QuizApiResponse>(
					`/quests/show/${params?.id}`,
				);

				if (isQuestSttaus) {
					const convertedData = convertTaskData(
						response?.data?.data.quest?.tasks,
					);
					console.log(
						response?.data?.data.quest?.tasks,
						"response?.data?.data.quest?.tasks",
					);
					console.log(
						convertedData,
						"response?.data?.data.quest?.tasks",
					);
					dispatch(setMultipleSelectedItems(convertedData));
					dispatch(setQuest(response?.data?.data));
				}

				const quizDataWithType = {
					...response?.data?.data,
					qseaneType: `${quizData?.qseaneType}`,
				};
				dispatch(setQuiz(quizDataWithType));
			} catch (error) {
				const axiosError = error as AxiosError<{ message?: string }>;
				if (axiosError.response) {
					console.error(
						"Error verifying token:",
						axiosError.response.data,
					);
					toast.error(
						`Error: ${
							axiosError.response.data?.message ||
							"Verification failed."
						}`,
					);
				} else {
					console.error("Unexpected error:", axiosError.message);
					toast.error("Unexpected error occurred. Please try again.");
				}
			}
		};
		// NOTE: you fetch with params.id, so depend on params.id (not params.quizId)
		dataFetch();
	}, [params?.id, dispatch, quizData?.qseaneType]);

	// console.log(
	// 	activeItem,
	// 	"activeItemactiveItemactiveItemactiveItemactiveItem"
	// );

	return (
		<div>
			{multypleselectedItem?.length > 0 ? (
				renderPreview(activeItem)
			) : (
				<div className="h-[calc(90vh-55px)] bg-[#fff] rounded-lg flex flex-col justify-center items-center">
					<PiWarningCircle className="text-[60px] text-[#fda14d]" />
					<h3 className="font-bold text-[#333] pt-[15px]">
						Please create you question
					</h3>
				</div>
			)}
		</div>
	);
}

export default QuestContantView;
