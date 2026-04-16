import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui";
import {
	//   CallIcon,
	PencilSquareIcon,
	UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import DatePickerOne from '@/components/FormElements/DatePickerOne';
import { useDispatch, useSelector } from "react-redux";
import { Switch } from "@/components/FormElements/switch";
import { Quiz } from "@/types/types";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { setQuiz } from "@/features/quiz/store/quizInformationSlice";
import moment from "@/lib/dayjs";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface QuizState {
	quiz: Quiz;
}
interface RootState {
	quizInformation: {
		quizInformation: QuizState;
	};
}

interface QuizeSettingProps {
	// isModalOpen: boolean;
	defailtValueUse: string;
	// setIsModalOpen: (value: boolean) => void;
}

function QuizeSetting({ defailtValueUse }: QuizeSettingProps) {
	// console.log(defailtValueUse, "response?.quiz?.title");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const params = useParams();
	const dispatch = useDispatch();
	const response = useSelector(
		(state: RootState) => state.quizInformation.quizInformation
	);
	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	console.log(response, "responseresponseresponseresponse");

	const quiz = response?.quiz;
	const visibilityStatus = quiz?.visibility === "private" ? false : true;
	console.log(quiz, "quiz");

	const formSchema = z.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().optional(),
		open_datetime: z.date().nullable().optional(),
		close_datetime: z.date().nullable().optional(),
		is_published: z.boolean(),
	});

	type FormData = z.infer<typeof formSchema>;

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			open_datetime: null,
			close_datetime: null,
			is_published: false,
		},
	});

	useEffect(() => {
		if (quiz) {
			reset({
				title: quiz.title === "My Quiz" ? "" : quiz.title,
				description: quiz.description ?? "",
				open_datetime: quiz.open_datetime
					? new Date(
							new Date(quiz.open_datetime).getTime() +
								new Date().getTimezoneOffset() * 60000
					  )
					: new Date(),

				close_datetime: quiz.close_datetime
					? new Date(
							new Date(quiz.close_datetime).getTime() +
								new Date().getTimezoneOffset() * 60000
					  )
					: new Date(Date.now() + 24 * 60 * 60 * 1000),

				is_published: visibilityStatus ?? false,
			});
		}
	}, [quiz, reset, visibilityStatus]);

	const onSubmit = async (data: FormData) => {
		const formattedData = {
			...data,
			open_datetime: moment(data.open_datetime).format(
				"YYYY-MM-DD HH:mm:ss"
			),
			close_datetime: moment(data.close_datetime).format(
				"YYYY-MM-DD HH:mm:ss"
			),
			timezone: `${currentTimeZone}`,
		};

		console.log(
			formattedData,
			"formattedDataformattedDataformattedDataformattedData"
		);

		try {
			const response = await axiosInstance.post(
				`/quizes/update/${params?.quizId}`,
				formattedData
			);
			toast.success(response.data.message);
			setIsModalOpen(false);
			const responseData = await axiosInstance.get(
				`/quizes/show/${params?.quizId}`
			);
			// console.log(responseData?.data, "responseData?.data");
			dispatch(setQuiz(responseData?.data?.data));
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

			if (axiosError.response) {
				console.error(
					"Error verifying token:",
					axiosError.response.data
				);
				toast.error(
					axiosError.response.data?.message || "Verification failed."
				);
			} else {
				console.error("Unexpected error:", axiosError.message);
				toast.error(
					axiosError.message ||
						"Unexpected error occurred. Please try again."
				);
			}
		}
	};

	return (
		<div className="w-full">
			<div onClick={() => setIsModalOpen(true)} className="w-full">
				<button className="flex !w-[300px] !h-[50px] font-bold cursor-pointer items-center gap-3.5 rounded-[10px] border bg-white py-3 pl-5 pr-[100px] outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary mr-[20px]">
					{" "}
					{defailtValueUse === "My Quiz" ? "" : defailtValueUse}{" "}
				</button>
				<button className="rounded-sm py-[8px] px-[20px] bg-[#f2f2f2] absolute right-7 top-1/2 -translate-y-1/2 max-[1015px]:size-5 z-999">
					Quiz Title
				</button>
			</div>
			<Modal
				title="MindSpear Setting"
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			>
				<div className="">
					<form onSubmit={handleSubmit(onSubmit)}>
						<InputGroup
							className="mb-5.5"
							type="text"
							label="Title"
							placeholder="Enter Quiz Name"
							icon={<UserIcon />}
							iconPosition="left"
							height="sm"
							{...register("title")}
						/>
						{errors.title && (
							<p className="text-sm text-red-500 mt-[-18px] mb-4">
								{errors.title.message}
							</p>
						)}

						<div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
							<div className="sm:w-1/2">
								<h3 className="text-[14px] pb-[8px]">
									{" "}
									Start Date{" "}
								</h3>
								<Controller
									name="open_datetime"
									control={control}
									render={({ field }) => (
										<DatePicker
											showTime={{ format: "HH:mm" }}
											format="YYYY-MM-DD HH:mm"
											className="w-full mb-2 h-[45px]"
											onChange={(date) =>
												field.onChange(
													date ? date.toDate() : null
												)
											}
											value={
												field.value
													? dayjs(field.value)
													: null
											}
										/>
									)}
								/>
							</div>
							<div className="sm:w-1/2">
								<h3 className="text-[14px] pb-[8px]">
									{" "}
									End date{" "}
								</h3>
								<Controller
									name="close_datetime"
									control={control}
									render={({ field }) => (
										<DatePicker
											showTime={{ format: "HH:mm" }}
											format="YYYY-MM-DD HH:mm"
											className="w-full mb-2 h-[45px]"
											onChange={(date) =>
												field.onChange(
													date ? date.toDate() : null
												)
											}
											value={
												field.value
													? dayjs(field.value)
													: null
											}
										/>
									)}
								/>
							</div>
						</div>

						<TextAreaGroup
							className="mb-5.5"
							label="Description"
							placeholder="Write your description here"
							icon={<PencilSquareIcon />}
							{...register("description")}
						/>

						<div className="mb-5.5 flex items-center gap-4">
							<Controller
								name="is_published"
								control={control}
								render={({ field }) => (
									<>
										<Switch
											checked={field.value}
											onChange={field.onChange}
										/>
										<span className="text-sm text-dark dark:text-white">
											{field.value ? "Public" : "Private"}
										</span>
									</>
								)}
							/>
						</div>
						<div className="my-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-dark-2">
							<p className="text-sm text-gray-600 dark:text-gray-300">
								Note: Setting this Quiz to <b>Public</b> makes
								it available to all users as a template.
							</p>
						</div>
						<div className="flex justify-end gap-3">
							<button
								className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
								type="submit"
							>
								Update
							</button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
}

export default QuizeSetting;
