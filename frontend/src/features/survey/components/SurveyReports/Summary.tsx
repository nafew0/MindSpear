"use client";
import React, { useEffect, useState } from "react";
import { RadialMetricChart as RadialBarCharts } from "@/components/charts";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "@/stores/store";

interface pNumber {
	participantsNumber: number;
	urlnamelive?: string;
}
// participantsNumber

const Summary: React.FC<pNumber> = ({ participantsNumber, urlnamelive }) => {
	const params = useParams();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [response, setresponse] = useState<any | null>(null);
	console.log(response?.quiz, "response?.quiz");
	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedUrl, setCopiedUrl] = useState(false);
	const [origin, setOrigin] = useState("");

	const questSession = useSelector(
		(state: RootState) => state.questSession.questSession,
	);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setOrigin(window.location.origin);
		}
	}, []);

	useEffect(() => {
		const dataFetch = async () => {
			const responseData = await axiosInstance.get(
				`/survey/show/${params?.id}`,
			);
			setresponse(responseData?.data?.data?.survey);
		};
		dataFetch();
	}, [params?.id]);

	const joinCode = response?.join_code;
	const liveurlname =
		urlnamelive !== undefined && urlnamelive !== null ? urlnamelive : "";
	const fullUrl = `${origin}/attempt/${liveurlname}${joinCode}?jid=${response?.join_link}&qid=${response?.id}&secid=${questSession?.id}`;

	const handleCopy = (text: string, type: "code" | "url") => {
		console.log(type, "Invite more participants!");

		navigator.clipboard.writeText(text).then(() => {
			if (type === "code") {
				setCopiedCode(true);
				setTimeout(() => setCopiedCode(false), 2000);
			} else {
				setCopiedUrl(true);
				setTimeout(() => setCopiedUrl(false), 2000);
			}
		});
	};

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch ">
				<div className="md:col-span-7 bg-white">
					<div className="flex flex-col items-center justify-center gap-6 h-full p-6">
						<div className="flex flex-col justify-center">
							<h3 className="text-[1.5rem] font-bold text-[#333333]">
								Invite more participants!
							</h3>
							<p>
								Invite by sharing the URL or Quest Id.
								Participants can join this MindSpear up until
								the deadline.
							</p>
						</div>
						<div className="">
							<RadialBarCharts
								key={participantsNumber}
								participantsNumber={participantsNumber}
							/>
						</div>
					</div>
				</div>

				<div className="md:col-span-5 bg-[#fff] ">
					<div className="flex mt-[10px]">
						<div className="w-full border border-[#2222] rounded-[10px]">
							<QRCodeGenerator url={fullUrl} />
						</div>
					</div>

					<div className="w-full border border-[#2222] rounded-[10px] flex justify-between mt-[10px] p-[20px]">
						<div className="">
							<h5 className=" text-[#7d7d7d]"> Join Code </h5>
							<p className="font-bold text-[#333]">
								{" "}
								{joinCode}{" "}
							</p>
						</div>
						<div className="flex justify-center items-center">
							<button
								className="px-6 py-1 text-[14px] font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6]"
								onClick={() => handleCopy(joinCode, "code")}
							>
								{copiedCode ? "Copied!" : "Copy"}
							</button>
						</div>
					</div>

					<div className="w-full border border-[#2222] rounded-[10px] flex justify-between mt-[10px] p-[20px]">
						<div className="">
							<h5 className=" text-[#7d7d7d]"> Join Link </h5>
							<p className="font-bold text-[#333]">
								{" "}
								{fullUrl.length > 30
									? fullUrl.slice(0, 30) + "..."
									: fullUrl}{" "}
							</p>
						</div>
						<div className="flex justify-center items-center">
							<button
								className="px-6 py-1 text-[14px] font-bold bg-[#ff9f48] text-white rounded hover:bg-[#556fb6]"
								onClick={() => handleCopy(fullUrl, "url")}
							>
								{copiedUrl ? "Copied!" : "Copy"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Summary;
