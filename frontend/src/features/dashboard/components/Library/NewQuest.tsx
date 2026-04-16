/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import Title from "@/components/ui/Title";
import { Quiz } from "@/types/types";
import GlobalPagination from "@/components/GlobalPagination";
import Link from "next/link";
import { Eye, Pencil, FileQuestion, CalendarDays, Trash2 } from "lucide-react";
import ConfirmDialog from "@/utils/showConfirmDialog";
import QuizSkeleton from "@/components/loading/QuizSkeleton";
import { IoDuplicateOutline } from "react-icons/io5";
import { Tooltip } from "react-tooltip";

export default function NewQuestTwo() {
	const [datalist, setdatalist] = useState<Quiz[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [pageSize, setPageSize] = useState(12);
	const [loading, setLoading] = useState(true);

	const dataFetch = async () => {
		try {
			setLoading(true);
			const responseData = await axiosInstance.get(
				`/quests?page=${currentPage}&order_by_id=desc&per_page=${pageSize}`,
			);
			// console.log(
			// 	responseData,
			// 	"responseDataresponseDataresponseDataresponseData"
			// );

			setdatalist(responseData?.data?.data?.quests?.data);
			setTotal(responseData?.data?.data?.quests?.total || 0);

			// console.log(responseData?.data, "responseData?.data");
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

			if (axiosError.response) {
				console.error(
					"Error verifying token:",
					axiosError.response.data,
				);
				toast.error(
					axiosError.response.data?.message || "Verification failed.",
				);
			} else {
				console.error("Unexpected error:", axiosError.message);
				toast.error(
					axiosError.message ||
						"Unexpected error occurred. Please try again.",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		dataFetch();
	}, [currentPage, pageSize]);
	const handlePageChange = (page: number, newPageSize?: number) => {
		if (newPageSize && newPageSize !== pageSize) {
			setPageSize(newPageSize);
			setCurrentPage(1);
		} else {
			setCurrentPage(page);
		}
	};

	// Quiz Remove
	const quizeRemove = async (id: number) => {
		await ConfirmDialog.show(
			{
				title: "Are you sure you want to delete this quiz?",
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, delete it!",
			},
			async () => {
				try {
					const response = await axiosInstance.delete(
						`/quests/delete/${id}`,
					);
					dataFetch();
					console.log(response, "transformedData");
				} catch (error) {
					const axiosError = error as AxiosError<{
						message?: string;
					}>;

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
						toast.error(
							"Unexpected error occurred. Please try again.",
						);
					}
				} finally {
				}
			},
		);
	};
	const quizeDuplicated = async (list: any, text: any) => {
		await ConfirmDialog.show(
			{
				title: `${text}`,
				text: "This action cannot be undone.",
				confirmButtonText: "Yes, duplicate it!",
				confirmButtonColor: "#bc5eb3",
			},
			async () => {
				try {
					taskDuplicate(list);
				} catch (error) {
					console.log(error);
				} finally {
				}
			},
		);
	};
	if (loading) {
		return (
			<div>
				<Title as="h2">MY QUESTS</Title>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<QuizSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}

	// Check if there are no quests
	if (!loading && datalist.length === 0) {
		return (
			<div>
				<Title as="h2">MY QUESTS</Title>
				<div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
					<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
						<Image
							src="/images/icons/quest.svg"
							alt="No Quests"
							width={48}
							height={48}
							className="text-gray-400"
						/>
					</div>
					<h3 className="text-2xl font-bold text-gray-900 mb-3">
						No Quest Yet
					</h3>
					<p className="text-gray-600 max-w-md mx-auto">
						{`We're working on bringing you amazing quest content. Check back soon!`}
					</p>
				</div>
			</div>
		);
	}

	const taskDuplicate = async ({ id }: any) => {
		try {
			await axiosInstance.post(`/quests/copy-with-tasks/${id}`);
			dataFetch();
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
				console.error("Unexpected error:", axiosError);
				console.error("Unexpected error:", axiosError.message);
				toast.error("Unexpected error occurred. Please try again.");
			}
		} finally {
		}
	};

	const duplicatedText = "You can duplicate it if you want?";
	const whyDuplicatedText =
		"You've already live the Quest, you can duplicate it if you want?";

	return (
		<div>
			<Title as="h2">MY QUESTS</Title>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{datalist.map((list, i) => (
					<div
						key={i}
						className="w-full group relative bg-white border dark:bg-gray-800 border-gray-200 rounded-lg dark:border-gray-700 hover:border-primary transition-all duration-300"
					>
						<div className="p-5">
							<h5 className="text-[16px] flex justify-between font-bold truncate tracking-tight text-gray-900 dark:text-white">
								{list?.title !== "My Quest" ? (
									list?.title.toUpperCase()
								) : (
									<span className="text-primary uppercase">
										{" "}
										Untitled Quest{" "}
									</span>
								)}
							</h5>
							<div
								data-tooltip-id="delete-tooltip"
								data-tooltip-content="Delete Quest"
								data-tooltip-place="top"
								className="absolute cursor-pointer hidden group top-[20px] right-[20px] w-[30px] h-[30px] bg-primary rounded-full group-hover:flex justify-center items-center text-[#fff] hover:bg-red-600 transition-colors"
								onClick={() => quizeRemove(list?.id)}
							>
								<Trash2 className="w-4 h-4" />
							</div>

							<div
								data-tooltip-id="duplicate-tooltip"
								data-tooltip-content="Duplicate Quest"
								data-tooltip-place="top"
								className="absolute cursor-pointer hidden group top-[60px] right-[20px] w-[30px] h-[30px] bg-[#bc5eb3] rounded-full group-hover:flex justify-center items-center text-[#fff] hover:bg-purple-600 transition-colors"
								onClick={() =>
									quizeDuplicated(list, duplicatedText)
								}
							>
								<IoDuplicateOutline className="w-4 h-4" />
							</div>

							{/* Global Tooltips */}
							<Tooltip
								id="delete-tooltip"
								className="z-50 bg-primary"
								variant="error"
								offset={10}
							/>
							<Tooltip
								id="duplicate-tooltip"
								className="z-50 bg-primary"
								variant="warning"
								offset={10}
							/>
						</div>
						<Link
							href={
								list?.title !== "My Quest"
									? `/my-library/quest/${list?.id}`
									: `/quest/edit/${list?.id}`
							}
						>
							<Image
								className="m-auto border-gray-200 rounded-lg py-1 dark:border-none"
								src="/images/icons/quest.svg"
								width={120}
								height={120}
								alt=""
							/>
							<div className="py-2 px-4 border-t flex justify-between">
								<p className="text-sm truncate font-normal text-gray-700 dark:text-gray-400">
									{list?.user?.full_name}
								</p>
								{/* <span
									className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
										list?.is_live
											? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
											: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
									}`}
								>
									{list?.is_live ? "Active" : "Inactive"}
								</span> */}
							</div>
						</Link>

						{/* Optional Info Section */}
						<div className="px-4 text-sm text-gray-600 dark:text-gray-400 space-y-1 pb-2">
							<div className="flex flex-col gap-1">
								<p className="flex items-center gap-2">
									<FileQuestion className="w-4 h-4" />
									<span className="uppercase">
										Total Questions:{" "}
										{list?.tasks_count || 0}
									</span>
								</p>
								{/* <p className="flex items-center gap-2">
									<Gauge className="w-4 h-4" />
									<span>
										Total Points: {list?.total_points || 0}
									</span>
								</p> */}
							</div>
							<p className="flex items-center gap-2">
								<CalendarDays className="w-4 h-4" />
								<span className="uppercase">
									Created:{" "}
									{new Date(list?.created_at).toDateString()}
								</span>
							</p>
						</div>

						{/* Button Section */}
						<div className="px-4 pb-5 flex flex-col xl:flex-row gap-2">
							<Link
								// href={`/my-library/quiz/${list?.id}`}
								href={
									list?.title !== "My Quest"
										? `/my-library/quest/${list?.id}`
										: `/quest/edit/${list?.id}`
								}
								className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white text-sm font-medium py-2 w-full transition"
							>
								<Eye className="w-4 h-4" />
								View
							</Link>

							{list?.sessions_count > 0 ? (
								<button
									// onClick={() => taskDuplicate(list)}
									onClick={() =>
										quizeDuplicated(list, whyDuplicatedText)
									}
									// href={`/quest/edit/${list?.id}`}
									className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white hover:bg-primary-dark text-sm font-medium py-2 w-full transition"
								>
									<Pencil className="w-4 h-4" />
									Edit
									{/* Duplicate */}
								</button>
							) : (
								<Link
									href={`/quest/edit/${list?.id}`}
									className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white hover:bg-primary-dark text-sm font-medium py-2 w-full transition"
								>
									<Pencil className="w-4 h-4" />
									Edit
								</Link>
							)}
						</div>
					</div>
				))}
			</div>

			{/* <WordCloudChart  /> */}

			<div className="dark:bg-gray-900">
				{total > 10 ? (
					<GlobalPagination
						current={currentPage}
						total={total}
						pageSize={pageSize}
						onChange={handlePageChange}
					/>
				) : (
					""
				)}
			</div>
		</div>
	);
}
