/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { IoIosClose } from "react-icons/io";
import Image from "next/image";
import Link from "next/link";
import { clearCache } from "@/stores/features/leaderboardSlice";
import { useDispatch, useSelector } from "react-redux";
import { emitEndQuest, setCurrentQuest } from "@/socket/quest-socket";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { emitEndQuiz } from "@/socket/socket";

interface HeaderProps {
	onClose?: () => void;
}

export default function HostLiveHeader({ onClose }: HeaderProps) {
	const dispatch = useDispatch();
	const router = useRouter();
	const searchParams = useSearchParams();
	const params = useParams();
	const mode = String((params as any)?.id ?? "").toLowerCase();
	const { showLeaderboard } = useSelector((state: any) => state.leaderboard);
	const quizeIdString = searchParams.get("qid");

	const questId = `${quizeIdString}`;
	const closeFunction = () => {
		localStorage.removeItem("leaderboardState");
		// sessionStorage.removeItem('userSession')
		clearAllTimerStorage();
		if (mode === "quize") {
			quizEndFunction()
			if (showLeaderboard) {
				dispatch(clearCache());

				if (typeof window !== "undefined") {
					sessionStorage.clear();
				}
			}
			router.push(`/my-library/quiz/${questId}`);
		} else {
			questEndFunction();
			if (showLeaderboard) {
				dispatch(clearCache());

				if (typeof window !== "undefined") {
					sessionStorage.clear();
				}
			}
			router.push(`/my-library/quest/${questId}`);
		}

		onClose;
	};

	const quizEndFunction = async () => {
		await emitEndQuiz({
			quizId: `${questId}`,
			quizTitle: "",
		});
		setCurrentQuest(null);
	};
	const questEndFunction = async () => {
		await emitEndQuest({
			questId: `${questId}`,
			questTitle: "",
		});
		setCurrentQuest(null);
	};

	const clearAllTimerStorage = () => {
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith("timer_")) {
				localStorage.removeItem(key);
			}
		});
	};

	return (
		<div className="flex justify-between items-center px-2">
			<div
				className="w-5 h-5 rounded-full flex justify-center items-center bg-[#2222]"
				onClick={() => closeFunction()}
			>
				<IoIosClose className="text-xl cursor-pointer hover:text-[#f00]" />
			</div>

			<Link href="/">
				<Image
					src="/images/logo/logo.svg"
					alt="Logo"
					width={126}
					height={22}
				/>
			</Link>
		</div>
	);
}
