"use client";
import React from "react";
import { FaCheckSquare, FaRegDotCircle, FaCaretDown } from "react-icons/fa";
import { RiInputMethodLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTION_TYPES } from "./quest";

type Props = {
	isOpen: boolean;
	onToggle: () => void;
	onPick: (type: (typeof QUESTION_TYPES)[number]["value"]) => void;
};

const icons: Record<string, React.ReactNode> = {
	checkbox: <FaCheckSquare />,
	radio: <FaRegDotCircle />,
	dropdown: <FaCaretDown />,
	"short-answer": <RiInputMethodLine />,
};

const AddQuestionDropdown: React.FC<Props> = ({ isOpen, onToggle, onPick }) => {
	return (
		<div className="mt-2">
			<button
				onClick={onToggle}
				className="w-full px-3 py-4 transform transition-all duration-300 text-sm font-medium rounded-md border border-dashed border-[#2222] hover:border-gray-600"
			>
				Add Question
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						className="relative mt-2 w-50 rounded-md  bg-white ring-1 ring-black ring-opacity-5 z-20"
					>
						<div className="py-2">
							{QUESTION_TYPES.map((qt) => (
								<button
									key={qt.value}
									onClick={() => onPick(qt.value)}
									className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
								>
									{icons[qt.value]} {qt.label}
								</button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default React.memo(AddQuestionDropdown);
