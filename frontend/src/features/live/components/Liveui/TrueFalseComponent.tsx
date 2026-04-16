import React, { useState } from "react";
import clsx from "clsx";

const TrueFalseComponent: React.FC = () => {
	const [selectedOption, setSelectedOption] = useState<
		"True" | "False" | null
	>(null);

	const handleSelect = (option: "True" | "False") => {
		setSelectedOption(option);
	};

	return (
		<div className="min-h-screen overflow-auto flex flex-col justify-center items-center px-4">
			<div className="max-w-xl w-full space-y-6">
				<h2 className="text-2xl font-semibold text-gray-900 text-center">
					The training materials were easy to understand.
				</h2>
				<p className="text-sm text-gray-500 text-center">
					Choose True or False.
				</p>

				<div className="space-y-4">
					{["True", "False"].map((option) => (
						<button
							key={option}
							type="button"
							onClick={() =>
								handleSelect(option as "True" | "False")
							}
							className={clsx(
								"w-full flex justify-between items-center px-4 py-4 rounded-2xl border transition-all",
								selectedOption === option
									? "bg-orange-50 border-pimary text-primary"
									: "bg-white border-gray-200 text-gray-800 hover:border-orange-400"
							)}
						>
							<span className="text-base">{option}</span>
							<span
								className={clsx(
									"w-5 h-5 rounded-full border flex items-center justify-center",
									selectedOption === option
										? "bg-primary border-primary text-white"
										: "border-gray-400"
								)}
							>
								{selectedOption === option && (
									<div className="w-2 h-2 rounded-full bg-white"></div>
								)}
							</span>
						</button>
					))}
				</div>

				<div className="text-center text-sm text-gray-500">
					{selectedOption
						? `You selected: ${selectedOption}`
						: "No selection yet"}
				</div>

				<div className="flex items-center justify-center py-2">
					<button
						className="bg-primary px-4 py-2 rounded-lg text-white disabled:opacity-50"
						disabled={!selectedOption}
					>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
};

export default TrueFalseComponent;
