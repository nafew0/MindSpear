
import { getSocket } from "@/features/live/services/realtimeBridge";
import React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const WaitingRoomComponentQuiz: React.FC = () => {
	const searchParams = useSearchParams();
	// const questId = searchParams.get("qid");
	// const userId = searchParams.get("ujid");
	// const userName = searchParams.get("uname");
	console.log(searchParams, "searchParams");
	

	const handleLeave = () => {
		// alert("You have left the waiting room.");
	};

	const existing = getSocket();
	return (
		<div className=" flex flex-col justify-center items-center px-4 text-center">
			<div className="max-w-md w-full space-y-6">
				{/* Animated Pulse Circle */}
				{/* <div className="w-20 h-20 mx-auto rounded-full bg-primary animate-pulse" /> */}
				<div
					className={cn(
						existing?.connected ? "bg-primary" : "bg-[#bc5eb3]",
						"w-20 h-20 mx-auto rounded-full  animate-pulse"
					)}
				/>

				{/* Title */}
				<h2 className="text-2xl font-semibold text-gray-800">
					{`You're in the waiting room`}
				</h2>

				{/* Subtext */}
				<p className="text-gray-600 text-sm">
					{`Please wait while we prepare your session. This won't take
					long.`}
				</p>

				{/* Optional Host Message */}
				<div className="bg-white p-4 rounded-lg text-sm border text-gray-700">
					👋 Welcome! The host will let you in shortly.
				</div>

				{/* Status / Timer / Dot Loading */}
				<div className="flex justify-center space-x-2 pt-2">
					<span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
					<span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
					<span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></span>
				</div>

				{/* Optional leave button */}
				<div className="pt-4">
					<button
						onClick={handleLeave}
						className="text-sm text-gray-500 hover:text-red-500 underline transition"
					>
						Leave waiting room
					</button>
				</div>
			</div>
		</div>
	);
};

export default WaitingRoomComponentQuiz;
