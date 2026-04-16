import React from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import { addNewItem } from "@/features/quiz/store/quizItems/quizSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

interface MenuItem {
	key: string;
	id: string;
	label: string;
	icon: React.ReactNode;
}

function PopularFeatures() {
	const dispatch = useDispatch();
	const router = useRouter();
	const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const items = [
		{
			key: "quiz",
			id: "1",
			label: "Multiple Choice",
			icon: (
				<Image
					src="/images/icons/Icon-01.svg"
					alt="Multiple Choice"
					width={100}
					height={60}
					className="mr-2"
				/>
			),
		},
		{
			key: "truefalse",
			id: "2",
			label: "True / False",
			icon: (
				<Image
					src="/images/icons/Icon-02.svg"
					alt="True / False"
					width={100}
					height={60}
					className="mr-2"
				/>
			),
		},
		{
			key: "sortanswer",
			id: "3",
			label: "Short Answer",
			icon: (
				<Image
					src="/images/icons/Icon-03.svg"
					alt="Short Answer"
					width={100}
					height={60}
					className="mr-2"
				/>
			),
		},
		{
			key: "fillintheblanks",
			id: "4",
			label: "Fill in the blanks",
			icon: (
				<Image
					src="/images/icons/Icon-04.svg"
					alt="Fill in the blanks"
					width={100}
					height={60}
					className="mr-2"
				/>
			),
		},
	];

	const handleItemClick = async (item: MenuItem) => {
		const quizResponse = await axiosInstance.post("/quizes/store", {
			title: "My Quiz",
			timezone: `${currentTimeZone}`,
			visibility: "public",
			quiztime_mode: true,
		});
		const quizId = quizResponse?.data?.data?.quiz?.id;

		const response = await axiosInstance.post(`/quiz/questions/store`, {
			quiz_id: quizId,
			question_text: ".",
			visibility: "public",
		});

		dispatch(
			addNewItem({
				key: item.key,
				id: response.data.data.question.id,
				quiz_id: `${quizId}`,
				title: "",
				options: [],
				maxOptions: 0,
				minOptions: 0,
				allowDuplicates: false,
				isMultipleSelection: false,
				timeLimit: "",
				position: 1,
			})
		);
		router.push(`/quiz-creator/${quizId}`);
	};

	return (
		<div className="rounded-[10px]">
			<h3 className="text-[0.875rem] font-bold text-[#222]">

				Popular Quiz Features
			</h3>
			<div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full ">
				{items.map((item) => (
					<div
						key={item.id}
						// onMouseEnter={() => handleMouseEnter(item)}
						// onMouseLeave={handleMouseLeave}
						onClick={() => handleItemClick(item)}
						className="group flex flex-col items-center cursor-pointer   py-3 rounded-lg transition"
					>
						<span className="bg-[#fff] border border-[#2222] group-hover:bg-[#f3f3fe] w-full p-[20px] flex justify-center items-center rounded-[10px] mb-[20px]">
							{" "}
							{item.icon}{" "}
						</span>
						<span className="text-sm font-medium group-hover:font-bold text-gray-800">
							{item.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default PopularFeatures;
