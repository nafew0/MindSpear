"use client";

import React, { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { Tooltip } from "antd";
import { AiOutlineQuestion } from "react-icons/ai";
import QuestQsenListShow from "./QuestQsenListShow";
import {
	Dropdown,
	DropdownContent,
	DropdownTrigger,
} from "@/components/ui/dropdown";
import { useDispatch, useSelector } from "react-redux";
import {
	setHoveredItem,
	clearHoveredItem,
	addNewQuestItem,
	setSelectedItem,
} from "@/stores/features/quizItems/quizSlice";
import { setDropdownOpen } from "@/stores/features/dropdownSlice";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import PdfModal from "@/components/Dashboard/PdfQuiz/PdfModal";
import { RootState } from "@/stores/store";
import { useParams } from "next/navigation";
import { FilePlus2 } from "lucide-react";

interface MenuItem {
	key: string;
	id: string;
	label: string;
	icon: React.ReactNode;
}

const QuestAddQuestion: React.FC = () => {
	const params = useParams();
	const qId = params?.id as string;
	const [isDropDownOpen, setIsDropDownOpen] = useState(false);
	const [showPdfModal, setShowPdfModal] = useState(false);

	const quesentList = useSelector(
		(state: RootState) => state.quiz.multypleselectedItem,
	);

	const multyplItem = quesentList?.filter(
		(list) => `${list?.quiz_id}` === `${qId}`,
	);
	const nextPosition = multyplItem.length + 1;

	const dispatch = useDispatch();
	const items = [
		{
			key: "qsenchoice",
			id: "1",
			label: "Multiple Choice",
			icon: (
				<Image
					src="/images/icons/Icon-01.svg"
					alt="Multiple Choice"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "truefalse",
			id: "2",
			label: "Yes / No",
			icon: (
				<Image
					src="/images/icons/yes-no.svg"
					alt="Yes / No"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "wordcloud",
			id: "3",
			label: "Word Cloud",
			icon: (
				<Image
					src="/images/icons/word-cloud.svg"
					alt="Word Cloud"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "scales",
			id: "4",
			label: "Scales",
			icon: (
				<Image
					src="/images/icons/scales.svg"
					alt="Scales"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "ranking",
			id: "5",
			label: "Ranking",
			icon: (
				<Image
					src="/images/icons/ranking.svg"
					alt="Ranking"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "shortanswer",
			id: "6",
			label: "Short Answer",
			icon: (
				<Image
					src="/images/icons/Icon-03.svg"
					alt="Short Answer"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},

		{
			key: "longanswer",
			id: "7",
			label: "Long Answer",
			icon: (
				<Image
					src="/images/icons/long-answer.svg"
					alt="Long Answer"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "sorting",
			id: "8",
			label: "Sorting",
			icon: (
				<Image
					src="/images/icons/sorting.svg"
					alt="Sorting"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},
		{
			key: "quick_form",
			id: "9",
			label: "Quick Form",
			icon: (
				<Image
					src="/images/icons/quick-form.svg"
					alt="Quick Form"
					width={20}
					height={20}
					className="mr-2"
				/>
			),
		},

		// {
		// 	key: "content",
		// 	id: "10",
		// 	label: "Content",
		// 	icon: (
		// 		<Image
		// 			src="/images/icons/content.svg"
		// 			alt="Content"
		// 			width={20}
		// 			height={20}
		// 			className="mr-2"
		// 		/>
		// 	),
		// },
	];

	const handleDropdownToggle = (
		value: boolean | ((prev: boolean) => boolean),
	) => {
		if (typeof value === "function") {
			setIsDropDownOpen((prev) => {
				const next = value(prev);
				dispatch(setDropdownOpen(next));
				return next;
			});
		} else {
			setIsDropDownOpen(value);
			dispatch(setDropdownOpen(value));
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			dispatch(setDropdownOpen(false));
			setIsDropDownOpen(false);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [dispatch]);

	const handleMouseEnter = (item: MenuItem) => {
		dispatch(
			setHoveredItem({
				key: item.key,
				id: item.id,
				title: "",
				options: [],
				maxOptions: 0,
				minOptions: 0,
				allowDuplicates: false,
				isMultipleSelection: false,
				timeLimit: "",
				position: nextPosition,
			}),
		);
	};

	const handleItemClick = async (item: MenuItem) => {
		const response = await axiosInstance.post(`/quest-tasks/store`, {
			quest_id: `${qId}`,
			title: "Untitled question",
			task_type: `${item?.key}`,
			visibility: "public",
			serial_number: multyplItem.length + 1,
		});
		dispatch(
			addNewQuestItem({
				key: item.key,
				quiz_id: `${qId}`,
				title: "Untitled question",
				options: [],
				maxOptions: 0,
				minOptions: 0,
				allowDuplicates: false,
				isMultipleSelection: false,
				timeLimit: "",
				contant_title: "",
				image_url: "",
				layout_id: "",
				position: nextPosition,
				id: response.data.data.questTask.id,
			}),
		);
		const newId = response.data.data.questTask.id;
		dispatch(
			setSelectedItem({
				key: item.key,
				id: newId,
				title: "Untitled question",
				options: [],
				maxOptions: 0,
				minOptions: 0,
				allowDuplicates: false,
				isMultipleSelection: false,
				timeLimit: "",
				position: nextPosition,
			}),
		);

		setIsDropDownOpen(false);
	};

	const handleMouseLeave = () => {
		dispatch(clearHoveredItem());
	};

	return (
		<div className="bg-white px-3 py-2 rounded-lg h-[calc(90vh-80px)]">
			<Dropdown isOpen={isDropDownOpen} setIsOpen={handleDropdownToggle}>
				<DropdownTrigger className="w-full">
					<div className="flex justify-center items-center w-full mt-2">
						<div className="flex  text-[.875rem] w-full mb-[20px] px-4 mt-[10px] cursor-pointer items-center justify-center gap-2 rounded-md bg-primary p-2 font-medium text-white transition hover:bg-opacity-90">
							<FilePlus2 size={15} /> <span>Add Question</span>
						</div>
					</div>
				</DropdownTrigger>

				<DropdownContent className="w-[365px] absolute z-9999 left-[190px] ">
					<div className=" bg-[#fff] shadow-default p-[15px] rounded-md">
						<p className="flex items-center justify-between">
							<span className="flex items-center">
								{" "}
								Interactive questions
								<Tooltip
									placement="top"
									title="Get real-time input from your audience with these question formats.Get real-time input from your audience with these question formats."
								>
									<AiOutlineQuestion className="ml-2 cursor-pointer" />
								</Tooltip>
							</span>
							<IoIosClose
								onClick={() => setIsDropDownOpen(false)}
								className="cursor-pointer"
								size={30}
							/>{" "}
						</p>
						<div className="grid grid-cols-2 gap-2 mt-[10px] ">
							{items.map((item) => (
								<div
									key={item.id}
									onMouseEnter={() => handleMouseEnter(item)}
									onMouseLeave={handleMouseLeave}
									onClick={() => handleItemClick(item)}
									className="group flex cursor-pointer px-4 py-3 rounded-lg hover:bg-gray-100 transition"
								>
									<span> {item.icon} </span>
									{}
									<span className="text-sm font-medium text-gray-800">
										{item.label}
									</span>
								</div>
							))}
						</div>
					</div>
				</DropdownContent>
			</Dropdown>

			<div
				className={`w-full xl:h-[calc(72vh-70px)] overflow-y-auto scrollbar-hidden  `}
			>
				<QuestQsenListShow />
				{/* Show PDF Modal */}
				{showPdfModal && (
					<PdfModal onClose={() => setShowPdfModal(false)} />
				)}
			</div>
		</div>
	);
};

export default QuestAddQuestion;
