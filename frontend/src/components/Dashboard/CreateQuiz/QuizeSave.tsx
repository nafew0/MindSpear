import React, { useState } from "react";
import GlobalModal from "@/components/globalModal";
// import { QuizItem, FinalData, TransformedQuestion } from '@/types/types';
import { MdDataSaverOn, MdError } from "react-icons/md";
import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { FaEye } from "react-icons/fa6";
import { SiKdenlive } from "react-icons/si";
// import { useRouter } from 'next/router';
import { persistor } from "@/stores/store";
import { convertDataToQuestions } from "@/utils/quizUtils";
import { Quiz } from "@/types/types";
import { clearQuiz } from "@/stores/features/quizInformationSlice";
import { IoSaveSharp } from "react-icons/io5";
interface QuizState {
	quiz: Quiz;
}
interface QuizRootState {
	quizInformation: {
		quizInformation: QuizState;
	};
}

function QuizeSave() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const params = useParams();
	const pathname = usePathname();
	const router = useRouter();
	const isQuizCreate = pathname.includes("quiz-creator");
	const isQuizEdit = pathname.includes("quiz-edit");

	const dispatch = useDispatch();
	const qId = params?.quizId as string;
	const quesentList = useSelector(
		(state: RootState) => state.quiz.multypleselectedItem,
	);
	const multypleselectedItem = quesentList?.filter(
		(list) => `${list?.quiz_id}` === `${qId}`,
	);
	const quizresponse = useSelector(
		(state: QuizRootState) => state?.quizInformation?.quizInformation?.quiz,
	);
	console.log(quizresponse, "quizInformation");

	type ValidationResult = {
		id: string;
		title: string;
		key: string;
		messages: string[];
		hasError: boolean;
	};

	function validateQuestions(data: typeof quesentList): ValidationResult[] {
		console.log(quesentList, "datadatadatadatadatadata");

		return data.map((item) => {
			const messages: string[] = [];

			const filledOptions = item.options.filter(
				(opt) => opt.text?.trim() !== "",
			);
			const selectedOptions = item.options.filter(
				(opt) => opt.isSelected,
			);
			console.log(
				selectedOptions,
				"quesentListquesentListquesentListquesentList",
			);

			if (item.key === "quiz" || item.key === "fillintheblanks") {
				if (!item.title?.trim()) {
					messages.push("Title is required.");
				}
				if (filledOptions.length < 2) {
					messages.push("At least 2 options must have text.");
				}
				if (selectedOptions.length === 0) {
					messages.push("At least 1 option must be selected.");
				}
				if (!item.isMultipleSelection && selectedOptions.length > 1) {
					messages.push("Only 1 option can be selected.");
				}
			}

			if (item.key === "truefalse") {
				if (!item.title?.trim()) {
					messages.push("Title is required.");
				}
				if (selectedOptions.length !== 1) {
					messages.push("Exactly 1 option must be selected.");
				}
			}

			if (item.key === "sortanswer") {
				if (!item.title?.trim()) {
					messages.push("Title is required.");
				}
			}

			return {
				id: item.id,
				title: item.title,
				key: item.key,
				messages,
				hasError: messages.length > 0,
			};
		});
	}

	const validationResults = validateQuestions(multypleselectedItem);
	const transformed = convertDataToQuestions(multypleselectedItem);
	console.log(multypleselectedItem, "validationResultsvalidationResults");
	// console.log(transformed, "validationResultsvalidationResults");

	const isFormValid = validationResults.every((result) => !result.hasError);

	const onSubmit = async () => {
		try {
			const response = await axiosInstance.post(
				`/quiz/questions/${
					isQuizCreate
						? "update-multiple"
						: isQuizEdit
							? "update-multiple"
							: ""
				}   `,
				transformed,
			);
			toast.success(response.data.message);
			setIsModalOpen(false);
			// clearQuiz
			persistor.purge();
			router.push("/my-library/quiz-page");
			dispatch(clearQuiz());
			// console.log(response, "responseData?.data");
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
		}
	};

	return (
		<div>
			{isQuizCreate ? (
				<button
					onClick={() => setIsModalOpen(true)}
					className=" group rounded-full bg-gray-3 py-[8px] px-[12px] text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current flex items-center"
				>
					<MdDataSaverOn size={30} />
					<span className="hidden sm:inline text-[0.875rem] ml-[10px] font-medium">
						{" "}
						Save{" "}
					</span>
				</button>
			) : (
				""
			)}
			{isQuizEdit ? (
				<button
					onClick={() => setIsModalOpen(true)}
					className=" group rounded-full bg-gray-3 py-[8px] px-[12px] text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current flex items-center"
				>
					<MdDataSaverOn size={30} />
					<span className="hidden sm:inline text-[0.875rem] ml-[10px] font-medium">
						{" "}
						Update{" "}
					</span>
				</button>
			) : (
				""
			)}

			{/* isFormValid */}
			<GlobalModal
				// title={`${
				// 	isFormValid
				// 		? "This Eduquize be played"
				// 		: "This Eduquize can&apos;t be played"
				// }  `}
				title={""}
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			>
				{isFormValid ? (
					<div className="">
						{`${quizresponse?.title}` === "My Quiz" ? (
							<>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<Image
											className="border border-[#2222] rounded-[10px]"
											src="/images/placeholder.jpg"
											width={120}
											height={120}
											alt=""
										/>
										<div className="ml-[10px]">
											<h4 className="font-bold">
												{" "}
												Please Update Your Quiz
												Name{" "}
											</h4>
										</div>
									</div>

									<div className="flex flex-col">
										<button className="bg-red-500 text-white px-3 py-1 rounded">
											Fix
										</button>
									</div>
								</div>
							</>
						) : (
							<>
								<div className="flex flex-col justify-center items-center">
									<h3 className="text-[18px] md:text-[25px]  py-[10px] font-bold w-full border border-[#2222] text-center rounded-[10px] mt-[10px] shadow-2">
										{" "}
										Are you sure you want to{" "}
										{isQuizEdit ? "update" : "save"} the
										quiz{" "}
									</h3>
									<IoSaveSharp className="text-[100px] text-primary my-[30px]" />
								</div>
								<div className="hidden">
									<div className="flex cursor-pointer items-center gap-4 bg-[#f2f1f0] shadow-1 p-3 rounded-md mb-[15px]">
										<FaEye className="text-[30px]" />
										<div className=" flex flex-col ">
											<h5 className="text-[17px] font-bold">
												{" "}
												Preview{" "}
											</h5>
											<p className="text-[#858585]">
												{" "}
												Launch a trial session for this
												MindSpear{" "}
											</p>
										</div>
									</div>
									<div className="flex cursor-pointer items-center gap-4 bg-[#f2f1f0] shadow-1 p-3 rounded-md">
										<SiKdenlive className="text-[30px]" />
										<div className=" flex flex-col ">
											<h5 className="text-[17px] font-bold">
												{" "}
												Host live{" "}
											</h5>
											<p className="text-[#858585]">
												{" "}
												Display from a big screen{" "}
											</p>
										</div>
									</div>
								</div>
							</>
						)}
					</div>
				) : (
					<div className="h-[300px] overflow-y-auto  scrollbar-hidden">
						{validationResults.map((result) => (
							<div
								key={result.id}
								className="shadow mt-[10px] p-[10px]"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center">
										<Image
											src="/images/placeholder.jpg"
											width={120}
											height={120}
											alt=""
										/>
										<div className="ml-[10px]">
											<h4 className="font-medium">
												{result.key.toUpperCase()}
											</h4>
											<h4 className="font-bold">
												{result.messages.length > 0
													? ""
													: result.title}
											</h4>
											{result.messages.length > 0 && (
												<h4 className="text-red-500">
													{result.messages[0]}
												</h4>
											)}
										</div>
									</div>

									<div className="flex flex-col">
										{result.hasError ? (
											<button className="bg-red-500 text-white px-3 py-1 rounded">
												Fix
											</button>
										) : (
											<button className="bg-green-500 text-white px-3 py-1 rounded">
												Done
											</button>
										)}
									</div>
								</div>

								{result.hasError && (
									<div className="flex items-center mt-2">
										<MdError className="text-[30px] mr-[10px] text-[#bc5eb3]" />
										<div>
											{result.messages.map(
												(msg, index) => (
													<p
														key={index}
														className="text-sm text-red-600 font-medium"
													>
														{msg}
													</p>
												),
											)}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}

				<div className="flex justify-center items-center mt-[20px] gap-4 ">
					<button
						onClick={() => setIsModalOpen(false)}
						className="flex text-[.875rem]  items-center bg-[#bc5eb3] text-[#fff] hover:text-blue-600 font-bold py-3 px-4 w-full justify-center rounded-md"
					>
						{" "}
						Back to edit{" "}
					</button>

					{isFormValid && quizresponse?.title !== "My Quiz" && (
						<button
							onClick={() => onSubmit()}
							className="flex text-[.875rem]  items-center bg-primary text-[#fff] hover:text-blue-600 font-bold py-3 px-4 w-full justify-center rounded-md"
						>
							{" "}
							{isQuizEdit ? "Update" : "Submit"}{" "}
						</button>
					)}
				</div>
			</GlobalModal>
		</div>
	);
}

export default QuizeSave;
