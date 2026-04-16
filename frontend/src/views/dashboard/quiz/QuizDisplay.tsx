import React, { useState } from "react";

interface Question {
	question_text: string;
	question_type:
	| "single_choice"
	| "multiple_choice"
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

interface QuizDisplayProps {
	quiz: QuizData;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz }) => {
	const [answers, setAnswers] = useState<string[]>([""]);

	const handleAddAnswer = () => {
		setAnswers([...answers, ""]);
	};

	const handleChangeAnswer = (index: number, value: string) => {
		const newAnswers = [...answers];
		newAnswers[index] = value;
		setAnswers(newAnswers);
	};

	return (
		<div className="flex">
			<div className="w-3/4 overflow-x-auto">
				{quiz.questions.map((q, index) => (
					<div key={index} className="p-4">
						<div className="flex items-center justify-center gap-4 bg-gray-100 rounded-md px-4 py-4 w-full text-center ">
							<p className="text-lg font-semibold text-center bg-white px-4 py-2 rounded-lg">
								{/* {index + 1}.  */}
								{q.question_text}
							</p>
							<button
								type="button"
								className="bg-primary hover:bg-primary text-white font-bold py-2 px-4 rounded"
							>
								Add
							</button>
						</div>
						<div className="flex items-center justify-center px-4 w-full mx-auto max-h-64 bg-gray-100">
							<img
								src="/images/logo/logo.svg"
								alt={`Question ${index + 1}`}
								className="min-w-20  object-contain border border-gray-300 rounded-lg shadow-sm"
							/>
						</div>

						{q.question_type === "single_choice" ||
							q.question_type === "multiple_choice" ? (
							<ul className="space-y-2 p-3 rounded-b bg-gray-100">
								{q.options.choices.map((choice, i) => {
									const isCorrect = Array.isArray(
										q.options.correct_answer
									)
										? q.options.correct_answer.includes(i)
										: q.options.correct_answer === i;
									return (
										<li
											key={i}
											className={`p-4 rounded-lg ${isCorrect
													? "bg-green-100 border-green-500"
													: "bg-white border-gray-300"
												} border transition duration-200 hover:shadow-md cursor-pointer`}
										>
											{choice}
											{isCorrect && (
												<span className="ml-2 text-green-600 text-sm">
													(Correct)
												</span>
											)}
										</li>
									);
								})}
							</ul>
						) : q.question_type === "true_false" ? (
							<ul className="space-y-4 pl-4 flex">
								{q.options.choices.map((choice, i) => {
									const isCorrect = Array.isArray(
										q.options.correct_answer
									)
										? q.options.correct_answer.includes(i)
										: q.options.correct_answer === i;
									return (
										<li
											key={i}
											className={`p-4 rounded-lg ${isCorrect
													? "bg-green-100 border-green-500"
													: "bg-white border-gray-300"
												} border transition duration-200 hover:shadow-md cursor-pointer`}
										>
											{choice}
											{isCorrect && (
												<span className="ml-2 text-green-600 text-sm">
													(Correct)
												</span>
											)}
										</li>
									);
								})}
							</ul>
						) : q.question_type === "fill_in_the_blanks" ? (
							<div>
								<p className="italic text-sm">
									{q.question_text}
								</p>
								<div className="space-y-2 mt-2">
									{answers.map((answer, i) => (
										<div
											key={i}
											className="flex justify-between items-center"
										>
											<input
												type="text"
												value={answer}
												onChange={(e) =>
													handleChangeAnswer(
														i,
														e.target.value
													)
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
												placeholder={`Add answer ${i + 1
													}`}
											/>
										</div>
									))}
								</div>
								<button
									onClick={handleAddAnswer}
									className="mt-3 text-blue-500 hover:text-blue-700 transition duration-200"
								>
									Add more answers
								</button>
							</div>
						) : null}
						{/* <p className="mt-2 text-sm text-gray-600 italic">
							Type: {q.question_type.replace(/_/g, " ")}
						</p> */}
					</div>
				))}
			</div>
			<div className="w-1/4 mt-6 space-y-3">
				<div>MindSpear</div>
				{/* Add Question Button */}
				<button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
					Add Question
				</button>
				{/* Add All Questions Button */}
				<button className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200">
					Add All Questions
				</button>
				{/* Done Button */}
				<button className="w-full py-2 px-4 border border-primary text-primary rounded hover:bg-primary hover:text-white transition duration-200">
					Done
				</button>
			</div>
		</div>
	);
};

export default QuizDisplay;
