"use client";
import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { PiWarningCircle } from "react-icons/pi";
import { useParams } from "next/navigation";
import { RiDeleteBin7Fill } from "react-icons/ri";
import Image from "next/image";
import ConfirmDialog from "@/utils/showConfirmDialog";
import { removeSelectedItem } from "@/stores/features/quizItems/quizSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

type TransformedQuestionData = {
	id: string;
	question_text: string;
	question_type: string;
	options: string[];
	is_required: boolean;
	page_id: number;
	serial_number: number;
	owner_id: number;
	visibility: string;
	display_type: string;
};

function Questions() {
	const [questionsData, setQuestionsData] = useState<
		TransformedQuestionData[]
	>([]);

	const dispatch = useDispatch();
	const params = useParams();

	const datafetch = async () => {
		try {
			const responselist = await axiosInstance.get(
				`/surveys/show/${params.id}`,
			);

			const pages = responselist?.data?.data?.survey?.pages || [];
			const allQuestions = pages.flatMap(
				(page: { questions: TransformedQuestionData[] }) =>
					page.questions || [],
			);

			setQuestionsData(allQuestions);
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;
			if (axiosError.response) {
				console.error(
					"Error verifying token:",
					axiosError.response.data,
				);
			} else {
				console.error("Unexpected error:", axiosError.message);
			}
		}
	};

	useEffect(() => {
		if (params?.id) {
			datafetch();
		}
	}, [params?.id]);

	const questionsRemove = async (item: TransformedQuestionData) => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this questions?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				try {
					await axiosInstance.delete(
						`/survey-questions/delete/${item?.id}`,
					);
					datafetch();
					if (item) {
						dispatch(removeSelectedItem(item));
					}

					toast.success("Question deleted successfully.");
				} catch (error) {
					const axiosError = error as AxiosError<{
						message?: string;
					}>;
					if (axiosError.response) {
						console.error(
							"Error deleting question:",
							axiosError.response.data,
						);
						toast.error(
							`Error: ${
								axiosError.response.data?.message ||
								"Deletion failed."
							}`,
						);
					} else {
						console.error("Unexpected error:", axiosError.message);
						toast.error(
							"Unexpected error occurred. Please try again.",
						);
					}
				}
			},
		);
	};

	const getQuestionType = (channel: TransformedQuestionData) => {
		const typeMap: { [key: string]: string } = {
			qsenchoice: "Multiple Choice",
			truefalse: "True/False",
			wordcloud: "Word Cloud",
			scales: "Scales",
			ranking: "Ranking",
			shortanswer: "Short Answer",
			longanswer: "Long Answer",
			sorting: "Sorting",
			quick_form: "Quick Form",
			content: "Content",
		};
		return typeMap[channel.question_type] || channel.question_type;
	};

	const getQuestionImage = (channel: TransformedQuestionData) => {
		const imageMap: { [key: string]: string } = {
			qsenchoice: "/images/icons/Icon-01.svg",
			truefalse: "/images/icons/yes-no.svg",
			wordcloud: "/images/icons/word-cloud.svg",
			scales: "/images/icons/scales.svg",
			ranking: "/images/icons/ranking.svg",
			shortanswer: "/images/icons/Icon-03.svg",
			longanswer: "/images/icons/long-answer.svg",
			sorting: "/images/icons/sorting.svg",
			quick_form: "/images/icons/quick-form.svg",
			content: "/images/icons/content.svg",
		};

		return imageMap[channel.question_type] || "/images/types/default.png";
	};

	const getQuestionTypeColor = (channel: TransformedQuestionData) => {
		const colorMap: { [key: string]: string } = {
			qsenchoice: "bg-blue-100 text-blue-800 border-blue-200",
			truefalse: "bg-green-100 text-green-800 border-green-200",
			wordcloud: "bg-purple-100 text-purple-800 border-purple-200",
			scales: "bg-orange-100 text-orange-800 border-orange-200",
			ranking: "bg-pink-100 text-pink-800 border-pink-200",
			shortanswer: "bg-indigo-100 text-indigo-800 border-indigo-200",
			longanswer: "bg-teal-100 text-teal-800 border-teal-200",
			sorting: "bg-amber-100 text-amber-800 border-amber-200",
			quick_form: "bg-cyan-100 text-cyan-800 border-cyan-200",
			content: "bg-gray-100 text-gray-800 border-gray-200",
		};
		return (
			colorMap[channel.question_type] ||
			"bg-gray-100 text-gray-800 border-gray-200"
		);
	};

	return (
		<div>
			{questionsData.length > 0 ? (
				<Table>
					<TableHeader>
						<TableRow className="border-none uppercase ">
							<TableHead className="min-w-[120px] !text-left">
								Images
							</TableHead>
							<TableHead className="min-w-[120px] !text-left">
								Questions
							</TableHead>
							<TableHead>Type</TableHead>
							<TableHead className="!text-right">
								Action
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{questionsData?.map((channel, i) => (
							<TableRow
								className=" text-base font-medium text-dark dark:text-white"
								key={i}
							>
								<TableCell className="py-4">
									<div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
										<Image
											src={getQuestionImage(channel)}
											alt="Question image"
											width={48}
											height={48}
											className="object-cover w-full h-full"
										/>
									</div>
								</TableCell>

								<TableCell>{channel.question_text}</TableCell>

								<TableCell>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getQuestionTypeColor(
											channel,
										)}`}
									>
										{getQuestionType(channel)}
									</span>
								</TableCell>

								<TableCell className="flex justify-end ">
									<div className="flex gap-3 cursor-pointer">
										<span
											className="w-[30px] h-[30px] bg-primary hover:bg-[#bc5eb3] flex justify-center items-center rounded-full"
											onClick={() =>
												questionsRemove(channel)
											}
										>
											<RiDeleteBin7Fill className="text-[#fff]" />
										</span>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<div className="flex flex-col justify-center items-center py-[20px] ">
					<PiWarningCircle className="text-[40px] text-[#fda14d]" />
					<h3 className="font-bold text-[#333] pt-[5px]">
						No Data Available
					</h3>
				</div>
			)}
		</div>
	);
}

export default Questions;
