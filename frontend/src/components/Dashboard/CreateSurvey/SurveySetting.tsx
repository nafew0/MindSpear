import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui";
import { PencilSquareIcon, UserIcon } from "@/assets/icons";
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
import { setSurvey } from "@/stores/survey/surveyInformationSlice";
import { useSurveyOptional } from "@/contexts/SurveyContext";
import moment from "moment";
import { DatePicker } from "antd";
import dayjs from "dayjs";

// interface QuizState {
// 	Survey: Quiz;
// }
interface RootState {
	surveyInformation: {
		surveyInformation: Quiz | null;
	};
}

interface QuizeSettingProps {
	// isModalOpen: boolean;
	defailtValueUse: string;
	// setIsModalOpen: (value: boolean) => void;
}

function SurveySetting({ defailtValueUse }: QuizeSettingProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const params = useParams();
	const dispatch = useDispatch();
	const surveyContext = useSurveyOptional();
	const reduxSurvey = useSelector(
		(state: RootState) => state.surveyInformation.surveyInformation,
	);
	const survey = surveyContext?.state.surveyInformation || reduxSurvey;

	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const visibilityStatus = survey?.visibility
		? survey.visibility !== "private"
		: Boolean(survey?.is_published);

	const [sessionList, setSessionList] = useState<number>();

	const formSchema = z.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().optional(),
		open_datetime: z.date().nullable().optional(),
		close_datetime: z.date().nullable().optional(),
		visibility: z.enum(["public", "private"]),
		is_published: z.boolean().optional(),
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
			open_datetime: new Date(),
			close_datetime: null,
			visibility: "private",
			is_published: false,
		},
	});
	useEffect(() => {
		if (!survey && !defailtValueUse) return;

		reset({
			title: survey?.title ?? defailtValueUse ?? "",
			description: survey?.description ?? "",
			open_datetime: survey?.open_datetime
				? dayjs(survey.open_datetime).toDate()
				: null,
			close_datetime: survey?.close_datetime
				? dayjs(survey.close_datetime).toDate()
				: null,
			visibility: visibilityStatus ? "public" : "private",
			is_published: survey?.is_published ?? false,
		});
	}, [survey, defailtValueUse, reset, visibilityStatus]);

	const onSubmit = async (data: FormData) => {
		const formattedData = {
			...data,
			open_datetime: data.open_datetime
				? moment(data.open_datetime).format("YYYY-MM-DD HH:mm:ss")
				: null,
			close_datetime: data.close_datetime
				? moment(data.close_datetime).format("YYYY-MM-DD HH:mm:ss")
				: moment(
						new Date(
							new Date().setFullYear(
								new Date().getFullYear() + 5,
							),
						),
					).format("YYYY-MM-DD HH:mm:ss"),
			timezone: `${currentTimeZone}`,
			is_published: data.is_published,
		};

		try {
			const response = await axiosInstance.post(
				`/surveys/update/${params?.id}`,
				formattedData,
			);
			toast.success(response.data.message);
			setIsModalOpen(false);
			const responseData = await axiosInstance.get(
				`/surveys/show/${params?.id}`,
			);

			const updatedSurvey = responseData?.data?.data?.survey;
			dispatch(setSurvey(updatedSurvey));
			surveyContext?.actions.setSurveyInformation(updatedSurvey);
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

			if (axiosError.response) {
				toast.error(
					axiosError.response.data?.message || "Verification failed.",
				);
			} else {
				toast.error(
					axiosError.message ||
						"Unexpected error occurred. Please try again.",
				);
			}
		}
	};

	const isDisabled = (sessionList ?? 0) > 0;

	return (
		<div className="w-full">
			<div
				onClick={() => {
					if (!isDisabled) setIsModalOpen(true);
				}}
				className="w-full"
			>
				<button
					className={`flex !w-[300px] !h-[50px] font-bold cursor-pointer items-center gap-3.5 rounded-[10px] border bg-white py-3 pl-5 pr-[100px] outline-none transition-colors focus-visible:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 dark:focus-visible:border-primary mr-[20px] ${
						isDisabled
							? "opacity-50 cursor-not-allowed"
							: "hover:bg-gray-200 dark:hover:bg-[#031224]"
					} `}
				>
					{survey?.title || defailtValueUse || ""}
				</button>
				<button
					disabled={isDisabled}
					className={`rounded-sm py-[8px] px-[20px] bg-[#f2f2f2] absolute right-7 top-1/2 -translate-y-1/2 max-[1015px]:size-5 z-999 ${
						isDisabled
							? "opacity-50 cursor-not-allowed"
							: "hover:bg-gray-200 dark:hover:bg-[#031224]"
					}`}
				>
					Survey Title
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
							placeholder="Enter Survey Name"
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
							<div className="flex-1">
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
													date ? date.toDate() : null,
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
							<div className="flex-1">
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
													date ? date.toDate() : null,
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
								name="visibility"
								control={control}
								render={({ field }) => (
									<>
										<Switch
											checked={field.value === "public"}
											onChange={(checked) =>
												field.onChange(
													checked
														? "public"
														: "private",
												)
											}
										/>
										<span className="text-sm text-dark dark:text-white">
											{field.value === "public"
												? "Public"
												: "Private"}
										</span>
									</>
								)}
							/>
						</div>
						<div className="my-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-dark-2">
							<p className="text-sm text-gray-600 dark:text-gray-300">
								Note: Setting this Survey to <b>Public</b> makes
								it available to all users as a template.
							</p>
						</div>

						<div className="mb-5.5 flex items-center gap-4">
							<Controller
								name="is_published"
								control={control}
								render={({ field }) => (
									<>
										<Switch
											checked={field.value ?? false}
											onChange={(checked) =>
												field.onChange(checked)
											}
										/>
										<span className="text-sm text-dark dark:text-white">
											{field.value
												? "Published"
												: "Unpublished"}
										</span>
									</>
								)}
							/>
						</div>
						<div className="my-2 border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-dark-2">
							<p className="text-sm text-gray-600 dark:text-gray-300">
								Note: Toggle <b>Published</b> to make this
								survey available for users to submit responses.
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

export default SurveySetting;
