/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { Modal } from "@/components/ui";
import QuickFormAnswerView from "./QuickFormAnswerView";
import {
	getSocket,
	connectSocket,
	waitAnswerSubmittedToQuestCreatorQuickForm,
} from "@/socket/quest-socket";
import { toast } from "react-toastify";

type Option = { id: string; text: string | null };
type AnswerItem = {
	id: string;
	type: "checkbox" | "radio" | "dropdown" | "short-answer";
	label: string | null;
	options: Option[];
	serial_number: string;
	selected_option?: number;
	selected_options?: number[];
	text?: string;
};
type Respondent = {
	id: string;
	user_name: string;
	time: number;
	answer_data: AnswerItem[];
};

// const formatTime = (sec: number) => {
// 	const s = Math.max(0, Math.floor(sec));
// 	const m = Math.floor(s / 60);
// 	const ss = String(s % 60).padStart(2, "0");
// 	return { m, ss };
// };

function QuickFormCreatorView({ quickFromId }: any) {
	console.log(quickFromId);

	const [isModalStatus, setIsModalStatus] = useState(false);
	const [active, setActive] = useState<Respondent | null>(null);
	const [quicFromData, setQuicFromData] = useState<any>([]);
	const existing = getSocket();
	console.log(existing?.connected, "existing?.connected");

	function renameValueToAnswerData(data: any) {
		return data.map((item: any) => {
			const newItem = { ...item };
			newItem.answer_data = newItem.value;
			delete newItem.value;

			return newItem;
		});
	}

	useEffect(() => {
		// Reset data when quickFromId changes
		setQuicFromData([]);

		if (existing?.connected) {
			waitAnswerSubmittedToQuestCreatorQuickForm((payload: any) => {
				const transformedData = renameValueToAnswerData(
					payload?.responses
				);
				setQuicFromData(transformedData);
				//console.log("🎉 Question Changed:", payload);
			});
		} else {
			connectSocket()
				.then(async (s) => {
					//console.log("Socket Connected:", s.id);

					waitAnswerSubmittedToQuestCreatorQuickForm(
						(payload: any) => {
							//console.log("🎉 Question Changed:", payload);
							const transformedData = renameValueToAnswerData(
								payload?.responses
							);
							setQuicFromData(transformedData);
						}
					);
				})
				.catch((err) => {
					console.error("Socket Connection failed:", err);
					toast.error("Socket connection failed");
				});
		}
	}, [quickFromId]);

	// useEffect(() => {
	// 	if (existing?.connected) {
	// 		waitAnswerSubmittedToQuestCreatorQuickForm((payload: any) => {
	// 			const transformedData = renameValueToAnswerData(
	// 				payload?.responses
	// 			);
	// 			setQuicFromData(transformedData);
	// 			//console.log("🎉 Question Changed:", payload);
	// 		});
	// 	} else {
	// 		connectSocket()
	// 			.then(async (s) => {
	// 				//console.log("Socket Connected:", s.id);

	// 				waitAnswerSubmittedToQuestCreatorQuickForm(
	// 					(payload: any) => {
	// 						//console.log("🎉 Question Changed:", payload);
	// 						const transformedData = renameValueToAnswerData(
	// 							payload?.responses
	// 						);
	// 						setQuicFromData(transformedData);
	// 					}
	// 				);
	// 			})
	// 			.catch((err) => {
	// 				console.error("Socket Connection failed:", err);
	// 				alert("Socket connection failed");
	// 			});
	// 	}
	// }, [quickFromId]);

	console.log(quicFromData, "payload?.responses 444");

	const openDetails = (u: Respondent) => {
		setActive(u);
		setIsModalStatus(true);
	};

	return (
		<div>
			<div className="grid grid-cols-5 gap-4">
				{quicFromData.map((u: any, i: number) => {
					// const { m, ss } = formatTime(u.time ?? 0);
					return (
						<div
							key={i}
							className="w-full group relative bg-white border dark:bg-gray-800 border-gray-200 rounded-lg shadow dark:border-gray-700 hover:border-primary transition-all duration-300 flex flex-col justify-center items-center p-5"
						>
							<div className="w-[40px] h-[40px] bg-primary text-white rounded-full flex flex-col justify-center items-center shadow-sm">
								<FaUser />
							</div>
							<h3 className="font-bold py-[4px]">
								{u?.userName}
							</h3>
							<button
								onClick={() => openDetails(u)}
								className="bg-[#bc5eb3] hover:bg-[#fff] hover:text-[#222] border border-[#2222] text-[16px] py-[5px] px-[20px] text-white rounded-[10px] mt-[10px]"
							>
								Details
							</button>
						</div>
					);
				})}
			</div>

			<Modal
				title={active ? `${active.user_name} — Answers` : "Result"}
				open={isModalStatus}
				onClose={() => setIsModalStatus(false)}
			>
				{!active ? (
					<div className="text-gray-500">No data</div>
				) : (
					<div>
						<QuickFormAnswerView data={active} />
					</div>
				)}
			</Modal>
		</div>
	);
}

export default QuickFormCreatorView;
