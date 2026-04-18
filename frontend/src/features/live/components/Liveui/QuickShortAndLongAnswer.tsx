/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import {
	getSocket,
	connectSocket,
	waitAnswerSubmittedToQuestCreatorQuickForm,
} from "@/features/live/services/realtimeBridge";
import { motion, AnimatePresence } from "framer-motion";

function QuickShortAndLongAnswer({ answerData }: any) {
	const existing = getSocket();
	console.log(existing?.connected, "existing?.connected");

	useEffect(() => {
		if (existing?.connected) {
			waitAnswerSubmittedToQuestCreatorQuickForm((payload: any) => {
				//console.log("🎉 Question Changed:", payload);
			});
		} else {
			connectSocket()
				.then(async (s) => {
					//console.log("Socket Connected:", s.id);

					waitAnswerSubmittedToQuestCreatorQuickForm(
						(payload: any) => {
							//console.log("🎉 Question Changed:", payload);
						}
					);
				})
				.catch((err) => {
					console.error("Socket Connection failed:", err);
					// alert("Socket connection failed");
				});
		}
	}, []);

	return (
		<div>
			<div className="h-[400px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [-webkit-overflow-scrolling:touch]">
					<AnimatePresence>
						{answerData?.map((u: any, i: number) => {
							const bgColors = [
								"bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-800",
								"bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800",
								"bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-800",
								"bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800",
								"bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 text-pink-800",
								"bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-800",
							];

							const colorClass = bgColors[i % bgColors.length];

							return (
								<motion.div
									key={i}
									initial={{ opacity: 0, scale: 0.8, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.8, y: -20 }}
									transition={{
										duration: 0.3,
										ease: "easeOut",
									}}
									className={`w-full group relative ${colorClass} rounded-lg shadow-lg border-2 hover:scale-105 hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center p-6 min-h-[130px]`}
								>
									<h3 className="font-bold text-lg py-1 text-center">
										{u}
									</h3>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}

export default QuickShortAndLongAnswer;
