import React, { useState } from "react";
import clsx from "clsx";

const FillInTheBlanksComponent: React.FC = () => {
	const [answer, setAnswer] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = () => {
		if (!answer.trim()) {
			setError("Please fill in the blank.");
			return;
		}
		setError("");
		setSubmitted(true);
		// TODO:
	};

	return (
		<div className=" flex flex-col justify-center items-center px-4 pb-10">
			<div className="max-w-xl w-full space-y-6">
				<h2 className="text-2xl font-semibold text-gray-900 text-center">
					Fill in the blank
				</h2>
				<p className="text-sm text-gray-500 text-center">
					Type the correct word to complete the sentence.
				</p>

				<div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
					<p className="text-lg text-gray-800 leading-relaxed">
						The capital of France is{" "}
						<input
							type="text"
							value={answer}
							onChange={(e) => {
								setAnswer(e.target.value);
								if (error) setError("");
								if (submitted) setSubmitted(false);
							}}
							placeholder="your answer"
							className={clsx(
								"border-b-2 outline-none px-2 py-1 text-primary transition-all duration-150",
								error
									? "border-accent focus:border-accent"
									: "border-gray-300 focus:border-primary"
							)}
						/>
						.
					</p>

					{error && <p className="text-sm text-accent">{error}</p>}
					{submitted && (
						<p className="text-sm text-primary">
							Answer submitted: <strong>{answer}</strong>
						</p>
					)}

					<div className="text-center">
						<button
							onClick={handleSubmit}
							disabled={!answer.trim()}
							className="bg-primary text-white px-6 py-2 rounded-lg disabled:opacity-50"
						>
							Submit
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FillInTheBlanksComponent;
