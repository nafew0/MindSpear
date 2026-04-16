"use client";

// import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
// import { Notification } from "./notification";
// import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { VscPreview } from "react-icons/vsc";
import { MdStars } from "react-icons/md";
import { useSelector } from "react-redux";
import type { Quiz } from "@/types/types";
import QuizeSetting from "@/features/quiz/components/CreateQuiz/QuizeSetting";
import QuestSetting from "@/features/quiz/components/CreateQuiz/QuestSetting";
import QuizeSave from "@/features/quiz/components/CreateQuiz/QuizeSave";
import QuestSave from "@/features/quiz/components/CreateQuiz/QuestSave";
import { usePathname } from "next/navigation";
import { Palette } from "lucide-react";
import SurveySave from "@/features/survey/components/CreateSurvey/SurveySave";
import SurveySetting from "@/features/survey/components/CreateSurvey/SurveySetting";
import QuestDrafSave from "@/features/quiz/components/CreateQuiz/QuestDrafSave";
import { useSurveyOptional } from "@/contexts/SurveyContext";
// import { useState } from "react";
// import { useState } from "react";

interface QuizState {
	quiz: Quiz;
	quest: Quiz;
}
interface RootState {
	quizInformation: {
		quizInformation: QuizState;
	};
}
interface QuizDataType {
	questInformation: {
		questInformation: QuizState;
	};
}

export function CreateQuizHeader() {
	const { toggleSidebar, isMobile } = useSidebarContext();
	// const [isModalOpen, setIsModalOpen] = useState(false);
	const pathname = usePathname();
	const surveyContext = useSurveyOptional();
	const response = useSelector(
		(state: RootState) => state.quizInformation.quizInformation,
	);
	const quizresponse = useSelector(
		(state: QuizDataType) => state.questInformation.questInformation,
	);
	// console.log(response?.quiz?.title, "response?.quiz?.title");

	// Detect types
	const isQuizStatus =
		pathname.includes("/quiz/create/") ||
		pathname.includes("quiz-edit") ||
		pathname.includes("quiz-creator");
	const isQuestStatus =
		pathname.includes("/quest/create/") || pathname.includes("quest/edit");
	const isSurveyStatus =
		pathname.includes("survey/create") || pathname.includes("survey/edit");
	// console.log(isQuizStatus , isQuestStatus, isSurveyStatus, "isQuestionBankPageStatus" );
	// console.log(pathname, "isQuestionBankPageStatus" );
	// Titles limit
	const quizTitle = response?.quiz?.title
		? response.quiz.title.length > 15
			? response.quiz.title.slice(0, 15) + "..."
			: response.quiz.title
		: "";

	const questTitle = quizresponse?.quest?.title
		? quizresponse?.quest.title.length > 15
			? quizresponse?.quest.title.slice(0, 15) + "..."
			: quizresponse?.quest.title
		: "";

	// Get survey title from SurveyContext
	const surveyTitle = surveyContext?.state.surveyInformation?.title
		? surveyContext.state.surveyInformation.title.length > 15
			? surveyContext.state.surveyInformation.title.slice(0, 15) + "..."
			: surveyContext.state.surveyInformation.title
		: "";

	// console.log(quizresponse, "questdefailtValueUse");
	// console.log(quizresponse, "questdefailtValueUse");

	return (
		<header className="sticky top-0 z-99 flex items-center justify-between bg-white px-4 py-3  dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-5">
			<button
				onClick={toggleSidebar}
				className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] lg:hidden"
			>
				<MenuIcon />
				<span className="sr-only">Toggle Sidebar</span>
			</button>
			<Link href="/dashboard" className="mr-6">
				<Image
					src="/images/logo/logo.svg"
					// fill
					className="dark:hidden"
					alt="logo"
					role="presentation"
					quality={100}
					width={176}
					height={42}
				/>
			</Link>
			{isMobile && (
				<Link href="/">
					<Image
						className="hidden dark:block"
						src={"/images/logo/logo.svg"}
						alt="Logo"
						width={176}
						height={32}
					/>
					<Image
						className="dark:hidden"
						src={"/images/logo/logo.svg"}
						alt="Logo"
						width={176}
						height={32}
					/>
				</Link>
			)}

			<div className="max-xl:hidden">
				<div className="relative ">
					{isQuizStatus ? (
						<QuizeSetting defailtValueUse={quizTitle} />
					) : isQuestStatus ? (
						<QuestSetting defailtValueUse={questTitle} />
					) : isSurveyStatus ? (
						<SurveySetting defailtValueUse={surveyTitle} />
					) : null}
				</div>
			</div>

			<div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4 -z-10">
				<button className="group !hidden rounded-full bg-white py-2 px-4 text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current flex items-center">
					<MdStars size={22} />
					<span className="hidden sm:inline text-[0.875rem] ml-[10px] font-medium">
						{" "}
						Upgrade{" "}
					</span>
				</button>

				<button className="group !hidden rounded-full bg-gray-3 py-2 px-4 text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current flex items-center">
					<Palette size={22} className="text-gray-600" />
					<span className="hidden sm:inline text-[0.875rem] ml-[10px] font-medium">
						{" "}
						Themes{" "}
					</span>
				</button>

				{/* response?.quiz?.id */}
				{isQuizStatus && (
					<Link
						href={`/attempt/play/${response?.quiz?.join_code}?jid=${response?.quiz?.join_link}&id=${response?.quiz?.id}&preview=true`}
					>
						<button className="group rounded-full bg-gray-3 py-[8px] px-[12px] text-[#111928] outline-1 outline-primary focus-visible:outline dark:bg-[#020D1A] dark:text-current flex items-center">
							<VscPreview size={30} />
							<span className="hidden sm:inline text-[0.875rem] ml-[10px] font-medium">
								{" "}
								Preview{" "}
							</span>
						</button>
					</Link>
				)}

				<QuestDrafSave />

				{/* {isQuestStatus ? <QuestSave /> : <QuizeSave />} */}
				{isQuizStatus ? (
					<QuizeSave />
				) : isQuestStatus ? (
					<QuestSave />
				) : isSurveyStatus ? (
					<SurveySave />
				) : null}

				{/* <ThemeToggleSwitch /> */}

				{/* <Notification /> */}

				<div className="shrink-0">
					<UserInfo />
				</div>
			</div>
		</header>
	);
}
