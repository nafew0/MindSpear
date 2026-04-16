"use client";
import Image from "next/image";
import { useState } from "react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import Link from "next/link";

interface AnswerData {
	start_time: string;
	start_time_now: string;
	selected_option: string;
}

interface QuestionOptions {
	color: string[];
	choices: (string | null)[];
	correct_answer: number;
}

interface Question {
	id: number;
	quiz_id: number;
	serial_number: number;
	question_text: string;
	question_type: string;
	time_limit_seconds: number | null;
	points: number | null;
	is_ai_generated: boolean;
	source_content_url: string | null;
	options: QuestionOptions;
	visibility: string;
	deleted_at: string | null;
	deleted_by: string | null;
	created_at: string;
	updated_at: string;
}

interface UserQuizAnswer {
	id: number;
	quiz_participant_id: number;
	question_id: number;
	answer_data: AnswerData;
	time_taken_seconds: number;
	created_at: string;
	updated_at: string;
	question: Question;
}

interface ThankYouComponentProps {
	userQuizAnswersData: UserQuizAnswer[];
	userScore: string;
	total_score: string;
}

const ThankYouComponent: React.FC<ThankYouComponentProps> = ({
	userQuizAnswersData,
	userScore,
	total_score,
}) => {
	const [resultShow, setResultShow] = useState<boolean>(false);

	const pdfRef = useRef<HTMLDivElement>(null);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	const downloadPDF = async () => {
		if (!pdfRef.current) return;

		setIsGeneratingPDF(true);

		try {
			const element = pdfRef.current;

			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				scrollY: -window.scrollY,
			});

			const imgData = canvas.toDataURL("image/png");

			const pdf = new jsPDF("p", "mm", "a4");
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();

			const imgWidth = pdfWidth;
			const imgHeight = (canvas.height * pdfWidth) / canvas.width;

			let heightLeft = imgHeight;
			let position = 0;

			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pdfHeight;

			while (heightLeft > 0) {
				position -= pdfHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pdfHeight;
			}

			pdf.save("quiz_result.pdf");
		} catch (error) {
			console.error("PDF generation failed:", error);
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	return (
		<div className="">
			{resultShow ? (
				<div className="result_inner !w-full md:w-[70%] p-[20px] md:m-auto">
					<div className="bg-[#e7f1f3] md:flex  gap-3 w-full p-3 border border-[#2222] mb-[15px] rounded-[15px]">
						<button
							className={`bg-[#bc5eb3] mb-[10px] md:mb-0 text-white font-bold py-2 px-4 rounded transition-colors duration-200`}
						>
							Results Send in Email
						</button>
						<button
							onClick={downloadPDF}
							disabled={isGeneratingPDF}
							className={`bg-[#ff9f48] text-white font-bold py-2 px-4 rounded transition-colors duration-200 ${
								isGeneratingPDF
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-[#ff9f48]"
							}`}
						>
							{isGeneratingPDF
								? "Generating PDF..."
								: "Download Results as PDF"}
						</button>
					</div>

					<div ref={pdfRef} className="">
						<div className="result_inner2 !w-full  md:p-[80px]">
							<div className="bg-[#f5f5f5]  flex !w-full md:!w-[40%] m-auto md:rounded-full ">
								<div className="bg-[#e2e2e2] md:rounded-full py-[30px] px-[30px] flex items-center text-[15px] md:text-[20px] font-bold text-[#333]">
									Your Score:{" "}
								</div>
								<div className=" flex justify-center items-center !ml-[20px]  md:pl-[50px] text-[15px] md:text-[25px] text-[#333]">
									{userScore} Points Out Of {total_score}{" "}
									Points{" "}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-[30px]">
								{userQuizAnswersData.map((answer, i) => {
									const question = answer.question;
									const choices =
										question.options.choices.filter(
											(choice) => choice !== null
										);
									const correctAnswer =
										question.options.correct_answer;
									const selectedOption =
										answer.answer_data.selected_option;

									const isMultipleSelection =
										selectedOption.includes(",");

									let isCorrectForMultiple = false;
									if (isMultipleSelection) {
										const selectedIndices = selectedOption
											.split(",")
											.map(Number);
										const correctIndices = Array.isArray(
											correctAnswer
										)
											? correctAnswer
											: [correctAnswer];

										isCorrectForMultiple =
											selectedIndices.length ===
												correctIndices.length &&
											selectedIndices.every((index) =>
												correctIndices.includes(index)
											);
									}

									const directMatch = choices.some(
										(choice) =>
											choice !== null &&
											choice.toString().toLowerCase() ===
												selectedOption
													.toString()
													.toLowerCase()
									);

									console.log(
										userQuizAnswersData,
										"userQuizAnswersDatauserQuizAnswersDatauserQuizAnswersData"
									);

									return (
										<div key={answer.id} className="mb-6">
											<div className="bg-[#e7f1f3] p-4 rounded text-left">
												<div className="flex gap-2">
													<span className="font-bold">
														{i + 1}
													</span>
													<h3
														className="font-bold mb-4 capitalize"
														dangerouslySetInnerHTML={{
															__html: question.question_text,
														}}
													/>
												</div>

												<div className="space-y-2">
													{choices.map(
														(choice, index) => {
															let isSelected =
																false;
															let isChoiceCorrect =
																false;

															if (
																isMultipleSelection
															) {
																const selectedIndices =
																	selectedOption
																		.split(
																			","
																		)
																		.map(
																			Number
																		);
																isSelected =
																	selectedIndices.includes(
																		index
																	);
																isChoiceCorrect =
																	Array.isArray(
																		correctAnswer
																	)
																		? correctAnswer.includes(
																				index
																		  )
																		: correctAnswer ===
																		  index;
															} else {
																isSelected =
																	selectedOption.includes(
																		index.toString()
																	) ||
																	(directMatch &&
																		choice.toLowerCase() ===
																			selectedOption.toLowerCase());

																isChoiceCorrect =
																	Array.isArray(
																		correctAnswer
																	)
																		? correctAnswer.includes(
																				index
																		  )
																		: correctAnswer ===
																		  index;
															}

															const showCorrectness =
																isMultipleSelection
																	? isSelected &&
																	  isCorrectForMultiple
																	: isSelected &&
																	  isChoiceCorrect;

															const showIncorrect =
																isMultipleSelection
																	? isSelected &&
																	  !isCorrectForMultiple
																	: isSelected &&
																	  !isChoiceCorrect;

															return (
																<div
																	key={index}
																	className={`flex items-center p-2 rounded ${
																		isSelected
																			? "bg-[#f1fdff]"
																			: ""
																	}`}
																>
																	<span
																		className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${
																			isSelected
																				? showCorrectness
																					? "bg-green-500"
																					: "bg-red-500"
																				: "bg-white"
																		}`}
																	></span>
																	<span className="capitalize">
																		{choice}
																	</span>
																	{isSelected && (
																		<span className="ml-2">
																			{showCorrectness ? (
																				<svg
																					className="w-6 h-6 text-green-500"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth="2"
																						d="M5 13l4 4L19 7"
																					/>
																				</svg>
																			) : showIncorrect ? (
																				<svg
																					className="w-6 h-6 text-red-500"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth="2"
																						d="M6 18L18 6M6 6l12 12"
																					/>
																				</svg>
																			) : null}
																		</span>
																	)}
																</div>
															);
														}
													)}
												</div>
											</div>

											<div className="bg-[#fcf6dc] p-4 rounded mt-3 text-left capitalize">
												<p className="font-semibold">
													The Correct answer is :
													<span className="ml-2 text-[#333]">
														{Array.isArray(
															correctAnswer
														)
															? correctAnswer
																	.map(
																		(idx) =>
																			choices[
																				idx
																			]
																	)
																	.join(", ")
															: choices[
																	correctAnswer
															  ]}
													</span>
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col justify-center items-center w-full text-center h-screen">
					<div className="flex flex-col justify-center items-center text-center h-full">
						<Image
							src={"/images/logo/logo.svg"}
							alt="Logo"
							width={300}
							height={32}
						/>
						<h1 className="text-[20px] md:text-[75px] font-bold text-[#333]  ">
							<span>Thank You</span> For Your Time!
						</h1>
						<span className="text-[17px] md:text-[24px] py-[10px] text-[#f79a47] font-bold">
							Your submission has been received
						</span>

						<p className="w-[95%] md:w-[40%] text-[#333]">
							Lorem Ipsum is simply dummy text of the printing and
							typesetting industry. Lorem Ipsum has been the
							industry s standard dummy text ever since the 1500s,
							when an unknown printer took a galley of type and
							scrambled it to make a type specimen book
						</p>
						<button
							onClick={() => setResultShow(true)}
							className="bg-[#f79a47] px-[20px] py-[10px] mt-[20px] text-[#333] rounded-[10px] font-bold"
						>
							{" "}
							Please Check Your Result{" "}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ThankYouComponent;
