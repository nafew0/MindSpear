"use client";
import React, { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import WaitingRoomComponent from "@/components/Liveui/WaitingRoomComponent";
import ChoiceComponent from "@/components/Liveui/ChoiceComponent";
import MultipleChoiceComponent from "@/components/Liveui/MultipleChoiceComponent";
import ShortAnswerComponent from "@/components/Liveui/ShortAnswerComponent";
import TrueFalseComponent from "@/components/Liveui/TrueFalseComponent";
import FillInTheBlanksComponent from "@/components/Liveui/FillInTheBlanksComponent";
import QuizLiveFooter from "@/components/Layouts/quiz/QuizLiveFooter";
import QuestEnd from "./QuestEnd";
import QuestWaiting from "./QuestWaiting";
import QuickFormPreview from "./QuickFormPreview";

const TABS = [
	"Wating Room",
	"Single Choice",
	"Multiple Choice",
	"True False",
	"Fill In The Blanks",
	"Short Answer",
	"Next Slide",
	"End Quest",
	"Quick Form",
] as const;
type TabType = (typeof TABS)[number];

function QuestPlay() {
	const [activeTab, setActiveTab] = useState<TabType>("Wating Room");
	const renderTabContent = () => {
		switch (activeTab) {
			case "Wating Room":
				return <WaitingRoomComponent />;
			case "Single Choice":
				return <ChoiceComponent />;
			case "Multiple Choice":
				return <MultipleChoiceComponent />;
			case "True False":
				return <TrueFalseComponent />;
			case "Fill In The Blanks":
				return <FillInTheBlanksComponent />;
			case "Short Answer":
				return <ShortAnswerComponent />;
			case "Next Slide":
				return <QuestWaiting />;
			case "End Quest":
				return <QuestEnd />;
			case "Quick Form":
				return <QuickFormPreview />;
			default:
				return null;
		}
	};

	return (
		<div className="h-screen overflow-auto bg-white">
			<div className=" ">
				<div className="py-6 flex items-center justify-center">
					<Link href="/">
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
				</div>
				<div className="flex gap-3 mb-12 justify-center">
					{TABS.map((tab) => (
						<button
							key={tab}
							className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors
									${
										activeTab === tab
											? "bg-primary text-white border-primary"
											: "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
									}`}
							onClick={() => setActiveTab(tab)}
						>
							{tab}
						</button>
					))}
				</div>

				<div className="bg-white w-full">{renderTabContent()}</div>
				<QuizLiveFooter />
			</div>
		</div>
	);
}

export default QuestPlay;
