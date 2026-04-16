/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui";
import FileUploadModal from "@/views/dashboard/quiz/FileUploadModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { extractPdfThumbnails } from "@/utils/pdfUtils";
import PageSelector from "@/views/dashboard/quiz/PdfSelector";
import { transformQuestionData } from "@/utils/quizUtils";
import { setMultipleSelectedItems } from "@/stores/features/quizItems/quizSlice";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import { BarLoader, PropagateLoader } from "react-spinners";
import { Quiz } from "@/types/types";
import FileUploadLoader from "@/components/ui/loader/FileUploadLoader";
import GeneratingLoader from "@/components/ui/loader/GeneratingLoader";
import { toast } from "react-toastify";

interface Page {
	id: number;
	thumbnail: string;
	text: string;
}

interface Question {
	question_text: string;
	question_type:
	| "single_choice"
	| "multiple_choice"
	| "short_answer"
	| "true_false"
	| "fill_in_the_blanks";
	options: {
		choices: string[];
		correct_answer: number | number[];
	};
}

interface QuizData {
	questions: Question[];
}

interface QuizState {
	qseaneType: string;
	quiz: Quiz;
}
interface QuizInformationProps {
	quizInformation: {
		quizInformation: QuizState;
	};
}

export default function PdfModal({
	initialOpen = false,
	onClose,
}: {
	initialOpen?: boolean;
	onClose?: () => void;
}) {
	const params = useParams();
	const router = useRouter();

	const quizData = useSelector(
		(state: QuizInformationProps) => state.quizInformation.quizInformation
	);

	const selectedItem = useSelector(
		(state: RootState) => state.quiz.selectedItem
	);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [pages, setPages] = useState<Page[]>([]);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [quiz, setQuiz] = useState<QuizData | null>(null);

	// console.log(
	// 	selectedItem,
	// 	"selectedItemselectedItemselectedItemselectedItemselectedItem"
	// );
	// useEffect(() => {
	// 	if (
	// 		quizData?.qseaneType === "pdf" &&
	// 		quizData?.quiz.questions?.length === 0
	// 	)
	// 		setIsUploadModalOpen(true);
	// }, []);

	useEffect(() => {
		const shouldOpen =
			initialOpen ||
			(quizData?.qseaneType === "pdf" &&
				quizData?.quiz.questions?.length === 0);

		if (shouldOpen) setIsUploadModalOpen(true);
	}, [initialOpen, quizData]);

	const handleFileUpload = async (file: File) => {
		setUploadedFile(file);
		setIsUploadModalOpen(false);
		setUploading(true);

		const thumbs = await extractPdfThumbnails(file);
		setPages(thumbs);
		setUploading(false);
		setIsPageSelectorOpen(true);
	};

	// handleGenerate function to pass audienceLevel and focusArea
	const handleGenerate = async (
		selected: number[],
		topic: string,
		questionCount: string,
		questionType: string[],
		difficulty: string,
		audienceLevel: string,
		focusArea: string
	) => {
		setIsPageSelectorOpen(false);
		setLoading(true);
		const selectedPagesData = pages.filter((page) =>
			selected.includes(page.id)
		);
		const selectedText = selectedPagesData
			.map((page) => page.text)
			.join("\n");

		try {
			const response = await fetch("/api/generate-quiz", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					selectedPages: selected,
					topic,
					questionCount,
					questionType,
					difficulty,
					textData: selectedText,
					audienceLevel,
					focusArea,
				}),
			});
			const data = await response.json();

			if (response.ok) {
				const quizData: QuizData = JSON.parse(data.quiz);
				console.log(
					quizData,
					"quizDataquizDataquizDataquizDataquizData"
				);

				const updatedQuestions = quizData?.questions.map(
					(question, index) => ({
						...question,
						quiz_id: `${params.quizId}`,
						visibility: "private",
						serial_number: index + 1,
					})
				);

				const obj = {
					questions: updatedQuestions,
				};

				try {
					const response = await axiosInstance.post(
						`/quiz/questions/store-multiple`,
						obj
					);

					console.log(response, "response?.data.data.questions");
					console.log(
						response?.data.data.questions,
						"response?.data.data.questions"
					);
					const datalist = transformQuestionData(
						response?.data.data.questions
					);

					console.log(datalist, "response?.data.data.questions");
					dispatch(setMultipleSelectedItems(datalist));
					router.push(`/quiz-edit/${params?.quizId}`);
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
							`Error: ${axiosError.response.data?.message ||
							"Verification failed."
							}`
						);
					} else {
						console.error("Unexpected error:", axiosError.message);
						toast.error("Unexpected error occurred. Please try again.");
					}
				} finally {
				}
				setLoading(false);
			} else {
				console.error("Failed to generate quiz:", data.error);
			}
		} catch (error) {
			console.error("Error while generating quiz:", error);
		}
	};

	return (
		<>
			<Modal
				title="Upload Document"
				open={isUploadModalOpen}
				onClose={() => {
					setIsUploadModalOpen(false);
					onClose?.();
				}}
			>
				<FileUploadModal onFileUpload={handleFileUpload} />
			</Modal>
			{uploading && (
				<div className="fixed inset-0 z_index__1000 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white px-8 py-6 rounded-lg shadow-xl">
						<FileUploadLoader />
					</div>
				</div>
			)}

			<Modal
				title="Select Pages to Generate Quiz"
				open={isPageSelectorOpen}
				onClose={() => setIsPageSelectorOpen(false)}
			>
				<PageSelector pages={pages} onGenerate={handleGenerate} />
			</Modal>
			{loading && (
				<div className="fixed w-full h-full inset-0 bg-white z-[1000] flex items-center justify-center rounded">
					<GeneratingLoader />
				</div>
			)}
		</>
	);
}
