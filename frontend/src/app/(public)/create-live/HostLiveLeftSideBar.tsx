"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { SiAnswer } from "react-icons/si";
import { LuLayoutList } from "react-icons/lu";
import { Tooltip } from "antd";
import { MdOutlineBarChart } from "react-icons/md";
import { FaChartPie } from "react-icons/fa";

import { MdDonutSmall } from "react-icons/md";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import { setScope } from "@/features/live/store/leaderboardSlice";

interface HostLiveLeftSideBarProps {
	onChartTypeChange: (type: "bar" | "donut" | "dots" | "pie") => void;
}

function HostLiveLeftSideBar({ onChartTypeChange }: HostLiveLeftSideBarProps) {
	const [chatBarStatus, setChatBarStatus] = useState(false);
	const [isModalStatus, setIsModalStatus] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	const { scope } = useSelector((state: RootState) => state.leaderboard);
	// console.log(scope, "scopescope");

	const options = [
		{ label: "Leader board for the entire presentation.", value: "entire" },
		{ label: "Leader board for this slide.", value: "slide" },
	];

	const handleSelection = (value: "entire" | "slide") => {

		dispatch(setScope(value));
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popupRef.current &&
				!popupRef.current.contains(event.target as Node)
			) {
				setChatBarStatus(false);
			}
		};

		if (chatBarStatus) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [chatBarStatus]);

	return (
		<div>
			<div className="bg-[#f2f1f0] p-3 rounded-full hidden">
				<Tooltip className="hidden" placement="right" title={"Show History"}>
					<IoCopyOutline className="mt-[10px] mb-[20px] cursor-pointer text-[#333]" />
				</Tooltip>

				<div className="hidden">
					<Tooltip placement="right" title={"Result"} >
						<SiAnswer
							onClick={() => setIsModalStatus(true)}
							className="my-[20px] cursor-pointer text-[#333]"
						/>
					</Tooltip>

					<Modal
						title="Result Setting"
						open={isModalStatus}
						onClose={() => setIsModalStatus(false)}
					>
						<p className="pb-[10px]">
							{" "}
							This will reset results (votes, reactions and
							responses). Your previous results are saved and
							accessed from the home screen by clicking on the
							three dots on the right column of the presentation.{" "}
						</p>
						<div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
							<div className="w-full gap-3 flex justify-between mt-4">
								{options.map((option) => (
									<button
										key={option.value}
										onClick={() =>
											handleSelection(
												option.value as
												| "entire"
												| "slide"
											)
										}
										className={`w-full p-3 rounded-md flex items-center justify-between font-semibold
              ${option.value === scope
												? "border-2 border-blue-500 bg-blue-50"
												: "border border-gray-300 bg-white"
											}`}
									>
										{option.label}
										<input
											type="radio"
											name="leaderboard"
											value={option.value}
											checked={option.value === scope}
											readOnly
											className="ml-2"
										/>
									</button>
								))}
							</div>
						</div>
					</Modal>
				</div>

				<div className="!relative mt-2">
					<Tooltip
						placement="right"
						title={"Chart View"}
						open={!chatBarStatus ? undefined : false}

					>
						<LuLayoutList
							onClick={() => setChatBarStatus((prev) => !prev)}
							className="mb-[10px] cursor-pointer text-[#333]"
						/>
					</Tooltip>

					<div
						ref={popupRef}
						className={cn(
							chatBarStatus ? "flex" : "hidden",
							"gap-3 absolute top-[-20px] left-10 bg-[#f2f1f0] px-4 py-2 rounded-[5px] shadow-md"
						)}
					>
						<div
							className="flex flex-col justify-center items-center text-[#333] border border-[#2222] p-3 rounded-[10px] hover:bg-[#e2e1e0]"
							onClick={() => {
								onChartTypeChange("bar");
								setChatBarStatus(false);
							}}
						>
							<MdOutlineBarChart className="cursor-pointer" />
							<span className="text-[12px] font-bold">
								{" "}
								Bars{" "}
							</span>
						</div>


						<div
							className="flex flex-col justify-center items-center text-[#333] border border-[#2222] p-3 rounded-[10px] hover:bg-[#e2e1e0]"
							onClick={() => {
								onChartTypeChange("donut");
								setChatBarStatus(false);
							}}
						>
							<MdDonutSmall className="cursor-pointer" />
							<span className="text-[12px] font-bold">
								{" "}
								Donut{" "}
							</span>
						</div>

						<div
							className="flex flex-col justify-center items-center text-[#333] border border-[#2222] p-3 rounded-[10px] hover:bg-[#e2e1e0]"
							onClick={() => {
								onChartTypeChange("pie");
								setChatBarStatus(false);
							}}
						>
							<FaChartPie className="cursor-pointer" />
							<span className="text-[12px] font-bold"> Pie </span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default HostLiveLeftSideBar;
