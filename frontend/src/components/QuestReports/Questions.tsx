/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/Table";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import ConfirmDialog from "@/utils/showConfirmDialog";
import { removeSelectedItem } from "@/stores/features/quizItems/quizSlice";
import { useDispatch } from "react-redux";
import { convertTaskData } from "@/utils/questDataTransformer";
import DOMPurify from "dompurify";
import { Pagination } from "antd";
import {
	AlertCircle,
	Clock,
	FileText,
	Filter,
	ImageIcon,
	Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

type TransformedQuestionData = {
	key: string;
	id: string;
	title: string;
	options: {
		id: string;
		text: string;
		placeholder: string;
		color: string;
		isSelected: boolean;
	}[];
	maxOptions: number;
	minOptions: number;
	position: number;
	allowDuplicates: boolean;
	isMultipleSelection: boolean;
	timeLimit: string;
	quiz_id: string;
	source_content_url: string;
};

function Questions() {
	const [questionsData, setQuestionsData] = useState<
		TransformedQuestionData[]
	>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const dispatch = useDispatch();
	const params = useParams();
	// console.log(params, "paramsparamsparamsparamsparams");

	const datafetch = async () => {
		try {
			const responselist = await axiosInstance.get(
				`/quests/show/${params.id}`
			);

			const datalist = convertTaskData(
				responselist?.data?.data.quest?.tasks
			);
			setQuestionsData(datalist);
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;
			if (axiosError.response) {
				console.error(
					"Error verifying token:",
					axiosError.response.data
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

	// console.log(questionsData, "questionsData questionsData");

	const questionsRemove = async (item: TransformedQuestionData) => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this questions?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				try {
					const response = await axiosInstance.delete(
						`/quest-tasks/delete/${item?.id}`
					);
					datafetch();
					if (item) {
						dispatch(removeSelectedItem(item));
					}
					console.log(response, "transformedData");
				} catch (error) {
					const axiosError = error as AxiosError<{
						message?: string;
					}>;
					if (axiosError.response) {
						console.error(
							"Error verifying token:",
							axiosError.response.data
						);
						toast.error(
							`Error: ${
								axiosError.response.data?.message ||
								"Verification failed."
							}`
						);
					} else {
						console.error("Unexpected error:", axiosError.message);
						toast.error(
							"Unexpected error occurred. Please try again."
						);
					}
				} finally {
				}
			}
		);
	};
	// console.log(
	// 	questionsData,
	// 	"questionsDataquestionsDataquestionsDataquestionsDataquestionsData"
	// );

	const SafeHTML = ({ html }: { html: string }) => {
		const cleanHtml = DOMPurify.sanitize(html);
		return <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
	};

	// Get current page data
	const getCurrentPageData = () => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return questionsData.slice(startIndex, endIndex);
	};
	const getQuestionType = (channel: TransformedQuestionData) => {
		const typeMap: { [key: string]: string } = {
			qsenchoice: channel.isMultipleSelection
				? "Multiple Choice"
				: "Single Choice",
			truefalse: "True/False",
			wordcloud: "Word Cloud",
			scales: "Scales",
			ranking: "Ranking",
			shortanswer: "Short Answer",
			longanswer: "Long Answer",
			sorting: "Sorting",
			quick_form: "Quick Form",
		};
		return typeMap[channel.key] || "Unknown";
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
		};
		return (
			colorMap[channel.key] || "bg-gray-100 text-gray-800 border-gray-200"
		);
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
		};

		return imageMap[channel.key] || "/images/types/default.png";
	};
	const handlePageChange = (page: number, size?: number) => {
		setCurrentPage(page);
		if (size) {
			setPageSize(size);
		}
	};

	const currentPageData = getCurrentPageData();

	return (
		<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<FileText className="w-5 h-5 text-gray-700" />
						<h3 className="text-lg font-semibold text-gray-900">
							Questions ({questionsData.length})
						</h3>
					</div>
					{questionsData.length > 0 && (
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Filter className="w-4 h-4" />
							<span>
								Showing {currentPageData.length} of{" "}
								{questionsData.length}
							</span>
						</div>
					)}
				</div>
			</div>

			{questionsData.length > 0 ? (
				<>
					{/* Table */}
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
									<TableHead className="w-16 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Preview
									</TableHead>
									<TableHead className="py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Question
									</TableHead>
									<TableHead className="py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Type
									</TableHead>
									{/* <TableHead className="py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
										Actions
									</TableHead> */}
								</TableRow>
							</TableHeader>
							<TableBody>
								{currentPageData?.map((channel, i) => (
									<TableRow
										key={channel.id}
										className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
									>
										<TableCell className="py-4">
											<div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
												<Image
													src={
														channel?.source_content_url
															? channel.source_content_url
															: getQuestionImage(
																	channel
															  )
													}
													alt="Question image"
													width={48}
													height={48}
													className="object-cover w-full h-full"
												/>
											</div>
										</TableCell>

										<TableCell className="py-4">
											<div className="max-w-md">
												<div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
													<SafeHTML
														html={channel.title}
													/>
												</div>
												{channel.timeLimit && (
													<div className="flex items-center gap-1 text-xs text-gray-500">
														<Clock className="w-3 h-3" />
														<span>
															{channel.timeLimit}s
															limit
														</span>
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="py-4">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getQuestionTypeColor(
													channel
												)}`}
											>
												{getQuestionType(channel)}
											</span>
										</TableCell>
										{/* <TableCell className="py-4 text-right">
											<button
												onClick={() => questionsRemove(channel)}
												className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
											>
												<Trash2 className="w-4 h-4" />
												Delete
											</button>
										</TableCell> */}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{questionsData.length > pageSize && (
						<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
							<div className="flex items-center justify-between">
								<div className="text-sm text-gray-600">
									Showing {(currentPage - 1) * pageSize + 1}{" "}
									to{" "}
									{Math.min(
										currentPage * pageSize,
										questionsData.length
									)}{" "}
									of {questionsData.length} questions
								</div>
								<Pagination
									current={currentPage}
									total={questionsData.length}
									pageSize={pageSize}
									onChange={handlePageChange}
									showSizeChanger
									pageSizeOptions={["5", "10", "20", "50"]}
									showQuickJumper={false}
									className="ant-pagination-custom"
								/>
							</div>
						</div>
					)}
				</>
			) : (
				/* Empty State */
				<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<AlertCircle className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						No Questions Yet
					</h3>
					<p className="text-gray-600 max-w-sm mb-6">
						Get started by adding questions to your quiz. Questions
						will appear here once you create them.
					</p>
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<FileText className="w-4 h-4" />
						<span>Add questions from the question bank</span>
					</div>
				</div>
			)}
		</div>
	);
}

export default Questions;
