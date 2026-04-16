"use client";

import React from "react";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";

function ReportDashboard() {

	return (
		<div>
			<div className="flex-[0_1_calc(33.333%_-_30px)] cursor-pointer mb-[30px] overflow-hidden rounded-[28px]">
				{/* <Link
					href="/quest/create"
				> */}

				<Link href={"/upcoming"}

					className="group relative block overflow-hidden bg-[#f3f3fe] px-5 py-[30px] transition-all duration-300 ease-in-out hover:no-underline"
				>
					{/* Circle background with lower z-index */}
					<div
						className={classNames(
							"absolute top-[-75px] right-[-75px] h-[128px] w-[128px] rounded-full",
							"bg-green-500",
							"group-hover:scale-[10]",
							"transition-transform duration-500 ease-in-out",
							"z-0"
						)}
					></div>

					{/* Title */}
					<div className="relative z-10 text-[0.875rem] font-bold text-[#222] group-hover:text-white transition-colors duration-500 ease-in-out">
						MindSpear Reports
					</div>

					{/* Image with higher z-index and transparent background */}
					<div className="relative z-20 flex items-center justify-center">
						<Image
							src="/images/icons/reports.png"
							alt="Reports"
							width={127}
							height={40}
							className="transition-all duration-500 ease-in-out py-3"
						/>
					</div>

					{/* Click Here */}
					<div className="relative z-10 text-[14px] text-[#f79a46] flex items-center justify-center">
						<span className="pl-1 font-bold text-center group-hover:text-white transition-colors duration-500 ease-in-out">
							Click Here
						</span>
					</div>
				</Link>
			</div>
		</div>
	);
}

export default ReportDashboard;
