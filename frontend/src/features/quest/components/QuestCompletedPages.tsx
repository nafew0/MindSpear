/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Leaderboard from "@/components/Dashboard/Leaderboard";
import { clearAppStorage } from "@/utils/storageCleaner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { Modal } from "@/components/ui";
import AllQuestResult from "@/components/ResultComponent/AllQuestResult";
import { clearCache } from "@/features/live/store/leaderboardSlice";
import { BarChart3, Home, Trophy } from "lucide-react";
import { QuestHostResultStage } from "@/features/live/components/quest-host-ui";
export type QuestProps = {
	pagesStatus?: string;
};

export const QuestCompletedPages: React.FC<QuestProps> = ({ pagesStatus }) => {
	const dispatch = useDispatch();
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

	const openDetails = () => {
		if (!hasResultSession) return;
		setIsModalStatus(true);
		setResultShowAttemId(resolvedSessionId);
	};

	const resultButtonClass = `inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black text-white transition hover:-translate-y-0.5 ${
		hasResultSession
			? "bg-primary hover:bg-primary/90"
			: "bg-gray-400 cursor-not-allowed"
	}`;

	const creatorComplete = (
		<QuestHostResultStage
			title="Quest complete"
			subtitle="The live presentation has ended. You can return to the dashboard or review the aggregated session analytics."
			actions={
				<>
					<button
						onClick={() => backToHome()}
						className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-secondary/90"
					>
						<Home className="h-4 w-4" />
						Go to Dashboard
					</button>

					<button
						onClick={() => openDetails()}
						disabled={!hasResultSession}
						className={resultButtonClass}
					>
						<BarChart3 className="h-4 w-4" />
						Show Results
					</button>
				</>
			}
		>
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
					<p className="text-xs font-black uppercase tracking-wide text-slate-500">
						Status
					</p>
					<p className="mt-2 text-2xl font-black text-slate-950">Ended</p>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
					<p className="text-xs font-black uppercase tracking-wide text-slate-500">
						Analytics
					</p>
					<p className="mt-2 text-2xl font-black text-slate-950">
						{hasResultSession ? "Ready" : "Unavailable"}
					</p>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
					<p className="text-xs font-black uppercase tracking-wide text-slate-500">
						Session
					</p>
					<p className="mt-2 text-2xl font-black text-slate-950">
						#{resolvedSessionId || "-"}
					</p>
				</div>
			</div>
		</QuestHostResultStage>
	);

	return (
		<div>
			{pagesStatus === "creator" ? (
				<>
					{scopeType.scope === "slide" ? (
						scopeType.lastSlideReached &&
						scopeType.leaderboard_slider ? (
							creatorComplete
						) : (
							// Else show leaderboard
							<Leaderboard scope={"entire"} />
						)
					) : (
						creatorComplete
					)}
				</>
			) : (
				<QuestHostResultStage
					title="Thanks for joining"
					subtitle="Your quest response has been submitted."
					actions={
						<button
							onClick={resultView}
							disabled={!attempId}
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Trophy className="h-4 w-4" />
							View Result
						</button>
					}
				/>
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
