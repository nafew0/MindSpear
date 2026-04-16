/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import GlobalModal from "@/components/globalModal";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { setQuiz } from "@/stores/features/quizInformationSlice";
import { useDispatch, useSelector } from "react-redux";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Switch } from "@/components/FormElements/switch";
import moment from "moment";
import { MdLiveTv } from "react-icons/md";
import {
	connectSocket,
	emitCreateQuiz,
	setCurrentQuiz,
	waitForQuizCreatedOnce,
} from "@/socket/socket";
import { RootState } from "@/stores/store";
import {
	setQuestSession,
	clearQuestSession,
} from "@/stores/features/questSessionSlice";
import { setScope } from "@/stores/features/leaderboardSlice";
import { toast } from "react-toastify";

const quizSchema = z
	.object({
		title: z.string().min(1, "Title is required"),
		is_published: z.boolean(),
		open_datetime: z.date(),
		close_datetime: z.date().refine((date) => date > new Date(), {
			message: "End date cannot be in the past",
		}),
		quiztime_mode: z.boolean(),
		duration: z.number(),
		safe_browser_mode: z.boolean(),
	})
	.refine((data) => data.close_datetime > data.open_datetime, {
		message: "End date must be after start date",
		path: ["close_datetime"],
	})
	.refine(
		(data) => {
			console.log(data.quiztime_mode, "data.quiztime_mode");

			// if (data.quiztime_mode) {
			//   return typeof data.duration === "number" && data.duration >= 1;
			// }
			return true;
		},
		{
			message:
				"Duration is required and must be at least 1 when Quiz Time is enabled",
			path: ["duration"],
		}
	);

type QuizFormValues = z.infer<typeof quizSchema>;

interface UserInfoState {
	id: number;
	full_name: string;
	email: string;
	profile_picture?: string | null;
}

const HostLive: React.FC = () => {
	const params = useParams();
	const router = useRouter();
	const dispatch = useDispatch();
	const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
	const user = useSelector(
		(state: RootState) => state.auth.user
	) as UserInfoState | null;

	const quizId = `${params?.id}`;
	const userId = `${user?.id}`;
	const quizTitle = "quiz Title";
	const userName = `${user?.full_name}`;
	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const {
		control,
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<QuizFormValues>({
		resolver: zodResolver(quizSchema),
		defaultValues: {
			title: "",
			is_published: false,
			open_datetime: new Date(),
			close_datetime: new Date(),
			quiztime_mode: true,
			duration: 1,
			safe_browser_mode: false,
		},
	});

	const isQuizTime = watch("quiztime_mode");
	const dataFetch = async () => {
		try {
			const response = await axiosInstance.get(
				`/quizes/show/${params?.id}`
			);
			setIsModalOpen(true);
			const quizresponse = response?.data?.data;
			console.log(quizresponse, "quizresponsequizresponse");

			reset({
				title: quizresponse.quiz.title,
				is_published: quizresponse.quiz.is_published,
				open_datetime: quizresponse.quiz.open_datetime
					? new Date(
							new Date(
								quizresponse.quiz.open_datetime
							).getTime() +
								new Date().getTimezoneOffset() * 60000
					  )
					: new Date(),

				close_datetime: quizresponse.quiz.close_datetime
					? new Date(
							new Date(
								quizresponse.quiz.close_datetime
							).getTime() +
								new Date().getTimezoneOffset() * 60000
					  )
					: new Date(Date.now() + 24 * 60 * 60 * 1000),

				quiztime_mode: Boolean(quizresponse.quiz.quiztime_mode),
				duration: quizresponse.quiz.duration || 10,
				safe_browser_mode: Boolean(quizresponse.quiz.safe_browser_mode),
			});
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;

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
				toast.error("Unexpected error occurred. Please try again.");
			}
		} finally {
		}
	};

	const handleClearCache = () => {
		dispatch(clearQuestSession());
	};

	useEffect(() => {
		handleClearCache();
	}, []);

	const currentDate = new Date();
	function generateFormattedTitle(baseTitle = quizTitle) {
		const formattedBase = baseTitle.replace(/ /g, "_");
		const momentDate = moment(currentDate);
		const formattedDate = momentDate.format("MMM_D");
		const formattedTime = momentDate.format("HH_mm_A");

		return `${formattedBase}_${formattedDate}_${formattedTime}`;
	}

	function shouldFetch(quiz: any) {
		const now = new Date();
		const start = new Date(quiz.open_datetime);
		const end = new Date(quiz.close_datetime);
		return now >= start && now <= end;
	}

	const hostLiveFunction = async () => {
		const response = await axiosInstance.get(`/quizes/show/${params?.id}`);
		const data_quiz = response?.data?.data?.quiz;
		if (shouldFetch(data_quiz)) {
			dispatch(setQuiz(data_quiz));
			dispatch(setScope("entire"));
			socketConnectAndQuizCreate();
			console.log(data_quiz, "data_questdata_questdata_questdata_quest");

			const endDateTimeString = data_quiz.close_datetime;
			const time = moment(endDateTimeString).format(
				"YYYY-MM-DD HH:mm:ss"
			);
			hostLiveApiCall(time);
		} else {
			dataFetch();
		}
	};

	const hostLiveApiCall = async (endDate: any) => {
		const titleList = generateFormattedTitle(quizTitle);
		const now = moment();
		const formatted = now.format("YYYY-MM-DD HH:mm:ss");
		const obj = {
			title: `${titleList}`,
			timezone: `${currentTimeZone}`,
			start_datetime: `${formatted}`,
			end_datetime: `${endDate}`,
		};

		try {
			const respnson = await axiosInstance.post(
				`/quizes/host-live/${params?.id}`,
				obj
			);
			console.log(
				respnson?.data.data.quizSession,
				"respnsonrespnsonrespnsonrespnsonrespnsonrespnson"
			);

			// Store the quest session data in Redux
			if (respnson?.data.data.quizSession) {
				dispatch(setQuestSession(respnson?.data.data.quizSession));
			}
		} catch (error) {
			console.error("API call failed:", error);
		}
	};

	const HostLiveSubmith = async (data: QuizFormValues) => {
		const obj = {
			...data,
			open_datetime: moment(data.open_datetime).format(
				"YYYY-MM-DD HH:mm:ss"
			),
			close_datetime: moment(data.close_datetime).format(
				"YYYY-MM-DD HH:mm:ss"
			),
			quiztime_mode: data.quiztime_mode ? 1 : 0,
		};
		try {
			const response = axiosInstance.post(
				`/quizes/update/${params?.id}`,
				obj
			);
			// console.log(response, "responseData?.data");
			const responseData = await axiosInstance.get(
				`/quizes/show/${params?.id}`
			);
			// console.log(responseData?.data, "responseData?.data");
			dispatch(setQuiz(responseData?.data?.data));
			socketConnectAndQuizCreate();
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

	const socketConnectAndQuizCreate = async () => {
		setCurrentQuiz({
			quizId,
			userId,
			quizTitle: quizTitle,
			userName,
			isCreator: true,
		});

		connectSocket()
			.then(async (s) => {
				console.log(s);
				await emitCreateQuiz({
					quizId,
					userId,
					quizTitle,
					userName,
				});

				const created = await waitForQuizCreatedOnce();
				//console.log("Quest Created:", created);
				if (created) {
					router.push(`/quiz-play/${params?.id}`);
				} else {
					alert("Quest creation failed");
				}
			})
			.catch((err: any) => {
				console.error("Socket Connection failed:", err);
				// alert("Socket connection failed");
			});
	};

	const onSubmit = (data: QuizFormValues): void => {
		HostLiveSubmith(data);
	};

	return (
		<div>
			<div
				onClick={() => hostLiveFunction()}
				className="flex cursor-pointer items-center gap-4 bg-[#f2f1f0] shadow-1 p-3 rounded-md"
			>
				<MdLiveTv className="text-[30px]" />
				<div className="flex flex-col">
					<h5 className="text-[17px] font-bold"> Host Live </h5>
					<p className="text-[#858585]">
						{" "}
						Display from a big screen{" "}
					</p>
				</div>
			</div>

			<GlobalModal
				title=""
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid relative grid-cols-1 md:grid-cols-12 gap-5 md:h-[410px]">
						<div className="md:col-span-5 p-4 hidden md:block">
							<div className="h-[475px] absolute top-[-45px] left-[-25px] w-[40%] p-[20px] bg-[#bc5eb3] rounded-tl-[13px] rounded-bl-[5px] flex flex-col justify-center items-center text-center">
								<Image
									src="/images/challenge.svg"
									alt="challenge"
									width={176}
									height={32}
									className="mb-6"
								/>
								<h3 className="text-[20px] font-bold pb-[10px] text-[#fff]">
									{" "}
									Assigning MindSpear{" "}
								</h3>
								<p className="text-[0.875rem] text-[#fff]">
									Create a self-paced MindSpear with questions
									and answers displayed on the participant s
									device. Perfect for on the go, or for those
									who can t join the live game.
								</p>
							</div>
						</div>

						<div className="md:col-span-7">
							<h3 className="text-[20px] font-bold pb-[10px] text-[#222]">
								{" "}
								Create an assigned MindSpear
							</h3>

							<p> Participants should complete it before: </p>

							<div className="grid relative grid-cols-1 md:grid-cols-12 gap-2 mt-[10px]">
								<div className="md:col-span-6">
									<h3 className="font-bold text-[14px] pb-[8px]">
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
												className="w-full mb-2 h-[45px] font-bold"
												onChange={(date) =>
													field.onChange(
														date
															? date.toDate()
															: null
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
									{errors.open_datetime && (
										<p className="text-red-500 text-sm">
											{errors.open_datetime.message}
										</p>
									)}
								</div>

								<div className="md:col-span-6">
									<h3 className="font-bold text-[14px] pb-[8px]">
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
												className="w-full mb-2 h-[45px] font-bold"
												onChange={(date) =>
													field.onChange(
														date
															? date.toDate()
															: null
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
									{errors.close_datetime && (
										<p className="text-red-500 text-sm">
											{errors.close_datetime.message}
										</p>
									)}
								</div>
							</div>

							<div className="md:col-span-6">
								<div className="pt-[10px]">
									<div className="mb-3">
										<label className="flex items-center justify-between cursor-pointer">
											<span className="text-[#222] font-bold text-sm">
												{isQuizTime
													? "Quiz Time"
													: "Question Time"}
											</span>
											<Controller
												name="quiztime_mode"
												control={control}
												render={({ field }) => (
													<div className="relative">
														<input
															type="checkbox"
															checked={
																field.value
															}
															onChange={(e) =>
																field.onChange(
																	e.target
																		.checked
																)
															}
															className="sr-only w-[200px]"
														/>
														<div
															className="block w-14 h-8 rounded-full transition-all"
															style={{
																backgroundColor:
																	field.value
																		? "#bc5eb3"
																		: "#d1d5db",
															}}
														/>
														<div
															className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
																field.value
																	? "translate-x-6"
																	: ""
															}`}
														/>
													</div>
												)}
											/>
										</label>
									</div>

									{isQuizTime && (
										<div>
											<input
												type="number"
												{...register("duration", {
													valueAsNumber: true,
													required: isQuizTime
														? true
														: false,
												})}
												placeholder="Enter quiz time (min)"
												className="w-full border mb-[15px] px-3 py-2 rounded-md focus:outline-none focus:ring focus:border-[#bc5eb3]"
											/>
										</div>
									)}
								</div>
							</div>

							<div className="pt-[5px]">
								<div className="mb-3">
									<label className="flex items-center justify-between cursor-pointer w-full">
										<span className="text-[#222] font-bold text-sm">
											Safe browser mode
										</span>
										<Controller
											name="safe_browser_mode"
											control={control}
											render={({ field }) => (
												<div className="relative">
													<input
														type="checkbox"
														checked={field.value}
														onChange={(e) =>
															field.onChange(
																e.target.checked
															)
														}
														className="sr-only"
													/>
													<div
														className="block w-14 h-8 rounded-full transition-colors duration-300"
														style={{
															backgroundColor:
																field.value
																	? "#bc5eb3"
																	: "#d1d5db",
														}}
													/>
													<div
														className={`dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
															field.value
																? "translate-x-6"
																: ""
														}`}
													/>
												</div>
											)}
										/>
									</label>
								</div>
							</div>
							{/* </div> */}

							<div className="pt-[5px]">
								<div className="mb-3">
									<Controller
										name="is_published"
										control={control}
										render={({ field }) => (
											<div className="flex gap-3 items-center font-bold">
												<Switch
													checked={field.value}
													onChange={field.onChange}
												/>
												<span className="text-sm text-dark dark:text-white">
													{field.value
														? "Published"
														: "Private"}
												</span>
											</div>
										)}
									/>
								</div>
							</div>

							<div className="flex gap-2 justify-center items-center">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="bg-[#bc5eb3] hover:bg-[#fff] hover:text-[#222] border border-[#2222] text-[16px] py-[5px] px-[20px] text-white rounded-[10px]"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="bg-[#ffa602] hover:bg-[#fff] hover:text-[#222] border border-[#2222] text-[16px] py-[5px] px-[20px] text-white rounded-[10px]"
								>
									Create
								</button>
							</div>
						</div>
					</div>
				</form>
			</GlobalModal>
		</div>
	);
};

export default HostLive;
