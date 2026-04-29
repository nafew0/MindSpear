import React, { useState } from "react";
import clsx from "clsx";

const OPTIONS = ["Yes!", "Yeah, kinda", "Not so much", "No"];

const MultipleChoiceComponent: React.FC = () => {
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

	const handleToggle = (option: string) => {
		setSelectedOptions((prev) =>
			prev.includes(option)
				? prev.filter((item) => item !== option)
				: [...prev, option]
		);
	};

	const isSelected = (option: string) => selectedOptions.includes(option);

	return (
		<div className="min-h-screen flex flex-col justify-center items-center px-4">
			<div className="w-full max-w-xl space-y-6">
				<h2 className="text-2xl font-semibold text-gray-900 text-center">
					Were the training objectives clearly defined?
				</h2>
				<p className="text-sm text-gray-500 text-center">
					You may choose multiple responses.
				</p>

				<div className="space-y-4">
					{OPTIONS.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => handleToggle(option)}
							className={clsx(
								"w-full flex justify-between items-center px-4 py-4 rounded-2xl border transition-all",
								isSelected(option)
									? "bg-primary/10 border-primary text-primary"
									: "bg-white border-gray-200 text-gray-800 hover:border-primary/40"
							)}
						>
							<span className="text-base">{option}</span>
							<span
								className={clsx(
									"w-5 h-5 rounded border flex items-center justify-center",
									isSelected(option)
										? "bg-primary border-primary text-white"
										: "border-gray-400"
								)}
							>
								{isSelected(option) && (
									<svg
										className="w-3 h-3"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								)}
							</span>
						</button>
					))}
				</div>

				<p className="text-sm text-gray-500 text-center">
					{selectedOptions.length < OPTIONS.length
						? `${
								OPTIONS.length - selectedOptions.length
						  } choices left`
						: "All selected"}
				</p>
				<div className="flex items-center justify-center py-2">
					<button className="bg-primary px-4 py-2 rounded-lg text-white">
						Submit
					</button>
				</div>
			</div>
		</div>
	);
};

export default MultipleChoiceComponent;
