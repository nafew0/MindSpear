/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { IoMdHappy } from "react-icons/io";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Leaderboard from "@/components/Dashboard/Leaderboard";
import { clearAppStorage } from "@/utils/storageCleaner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { Modal } from "@/components/ui";
import AllQuestResult from "@/components/ResultComponent/AllQuestResult";
import { clearCache } from "@/features/live/store/leaderboardSlice";
export type QuestProps = {
	pagesStatus?: string;
};

export const QuestCompletedPages: React.FC<QuestProps> = ({ pagesStatus }) => {
	const dispatch = useDispatch();
	console.log(pagesStatus);
	const searchParams = useSearchParams();
	const router = useRouter();
	const attempId = searchParams.get("aid");
	const sessionIdFromUrl = searchParams.get("sid");
	const [resultShowAttemId, setResultShowAttemId] = useState(0);
	const [isModalStatus, setIsModalStatus] = useState(false);

	const questSession: any = useSelector(
		(state: RootState) => state.questSession.questSession
	);

	const scopeType = useSelector((state: any) => state?.leaderboard);
	const resolvedSessionId = Number(
		sessionIdFromUrl || questSession?.id || 0
	);
	const hasResultSession = Number.isFinite(resolvedSessionId) && resolvedSessionId > 0;

	useEffect(() => {
		if (typeof window !== "undefined") {
			// Clear Local stores
			clearAppStorage();
		}
	}, []);

	const resultView = () => {
		if (!attempId) return;
		router.push(`/result-view/${attempId}`);
	};
	const backToHome = () => {
		dispatch(clearCache());
		router.push("/dashboard");
	};

	console.log("questSession", questSession);

	const openDetails = () => {
		if (!hasResultSession) return;
		setIsModalStatus(true);
		setResultShowAttemId(resolvedSessionId);
	};

	const resultButtonClass = `flex text-[.875rem] items-center text-[#fff] hover:text-[#222] font-bold py-3 px-4 w-full justify-center rounded-md ${
		hasResultSession
			? "bg-primary"
			: "bg-gray-400 cursor-not-allowed"
	}`;

	return (
		<div>
			{pagesStatus === "creator" ? (
				<>
					{scopeType.scope === "slide" ? (
						scopeType.lastSlideReached &&
						scopeType.leaderboard_slider ? (
							<div className="flex flex-col justify-center items-center h-screen overflow-hidden bg-white">
								<IoMdHappy size={100} className="mb-[20px]" />
								<h3 className="text-[30px] font-bold">
									You have reached the end of the
									presentation!
								</h3>

								<div className="flex w-full md:w-[400px] justify-center items-center mt-[20px] gap-4 ">
									<button
										onClick={() => backToHome()}
										className="flex text-[.875rem] items-center bg-[#bc5eb3] text-[#fff] hover:text-[#222] font-bold py-3 px-4 w-full justify-center rounded-md"
									>
										Go to Dashboard
									</button>

									<button
										onClick={() => openDetails()}
										disabled={!hasResultSession}
										className={resultButtonClass}
									>
										Show Results For Quest
									</button>
								</div>
							</div>
						) : (
							// Else show leaderboard
							<Leaderboard scope={"entire"} />
						)
					) : (
						<div className="flex flex-col justify-center items-center h-screen overflow-hidden bg-white">
							<IoMdHappy size={100} className="mb-[20px]" />
							<h3 className="text-[30px] font-bold">
								{" "}
								You have reached the end of the presentation!{" "}
							</h3>

							<div className="flex w-full md:w-[400px] justify-center items-center mt-[20px] gap-4 ">
								<button
									onClick={() => backToHome()}
									className="flex text-[.875rem]  items-center bg-[#bc5eb3] text-[#fff] hover:text-[#222] font-bold py-3 px-4 w-full justify-center rounded-md"
								>
									{" "}
									Go to Dashboard{" "}
								</button>

								<button
									onClick={() => openDetails()}
									disabled={!hasResultSession}
									className={resultButtonClass}
								>
									{" "}
									Show Results For Quest
								</button>
							</div>
						</div>
					)}
				</>
			) : (
				<div className="flex flex-col justify-center items-center h-screen overflow-hidden bg-white">
					<IoMdHappy size={100} className="mb-[20px]" />
					<h3 className="mb-[20px]"> Thanks for joining! </h3>
					<button
						onClick={resultView}
						disabled={!attempId}
						className="px-6 py-3 text-[14px] font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6]"
					>
						{" "}
						View Result{" "}
					</button>
				</div>
			)}

			<Modal size="xl"
				// title="Session Results - Aggregated Analytics"
				title={"Session Results - Aggregated Analytics"}
				open={isModalStatus}
				onClose={() => setIsModalStatus(false)}
			>
				<AllQuestResult attemId={resultShowAttemId} />
			</Modal>
		</div>
	);
};

export default QuestCompletedPages;
