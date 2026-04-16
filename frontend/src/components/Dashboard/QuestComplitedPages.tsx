/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import { IoMdHappy } from "react-icons/io";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Leaderboard from "./Leaderboard";
import { clearAppStorage } from "@/utils/storageCleaner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import GlobalBigModal from "../globalBigModal";
import AllQuestResult from "../ResultComponent/AllQuestResult";
import { clearCache } from "@/stores/features/leaderboardSlice";
import useLatestQuestSession from "@/hooks/useLatestQuestSession";
export type QuestProps = {
	pagesStatus?: string;
};

export const QuestComplitedPages: React.FC<QuestProps> = ({ pagesStatus }) => {
	const dispatch = useDispatch();
	console.log(pagesStatus);
	const searchParams = useSearchParams();
	const router = useRouter();
	const attempId = searchParams.get("aid");
	const qId = searchParams.get("qid");
	const sId = searchParams.get("sid");
	const [resultShowAttemId, setResultShowAttemId] = useState(0);
	const [isModalStatus, setIsModalStatus] = useState(false);

	const { latestSessionId } = useLatestQuestSession(qId ?? undefined);

	console.log("latestSessionId", latestSessionId);

	const questSession: any = useSelector(
		(state: RootState) => state.questSession.questSession
	);

	const scopeType = useSelector((state: any) => state?.leaderboard);

	useEffect(() => {
		if (typeof window !== "undefined") {
			// Clear Local stores
			clearAppStorage();
		}

		const dataFetch = async () => {
			const payload = { status: "Completed" };
			await axiosInstance.put(
				`/quest-attempts/${attempId}/status`,
				payload
			);
		};
		if (pagesStatus === "user") {
			dataFetch();
		}
	}, []);

	const resultView = () => {
		router.push(`/result-view/${attempId}`);
	};
	const backToHome = () => {
		dispatch(clearCache());
		router.push("/dashboard");
	};

	console.log("questSession", questSession);

	const openDetails = () => {
		console.log("questSession", questSession);
		setIsModalStatus(true);
		setResultShowAttemId(
			questSession?.id || parseInt(latestSessionId || "0")
		);
	};

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
										className="flex text-[.875rem] items-center bg-primary text-[#fff] hover:text-[#222] font-bold py-3 px-4 w-full justify-center rounded-md"
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
									className="flex text-[.875rem]  items-center bg-primary text-[#fff] hover:text-[#222] font-bold py-3 px-4 w-full justify-center rounded-md"
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
						className="px-6 py-3 text-[14px] font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6]"
					>
						{" "}
						View Result{" "}
					</button>
				</div>
			)}

			<GlobalBigModal
				// title="Session Results - Aggregated Analytics"
				title={"Session Results - Aggregated Analytics"}
				open={isModalStatus}
				onClose={() => setIsModalStatus(false)}
			>
				<AllQuestResult attemId={resultShowAttemId} />
			</GlobalBigModal>
		</div>
	);
};

export default QuestComplitedPages;
