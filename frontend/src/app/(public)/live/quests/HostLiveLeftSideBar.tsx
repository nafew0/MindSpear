"use client";

import React from "react";
import { BarChart3, Donut, PieChart } from "lucide-react";
import { Tooltip } from "antd";
import { cn } from "@/lib/utils";

interface HostLiveLeftSideBarProps {
	onChartTypeChange: (type: "bar" | "donut" | "dots" | "pie") => void;
	activeChartType: "bar" | "donut" | "dots" | "pie";
}

const chartOptions = [
	{ label: "Bars", value: "bar", icon: BarChart3 },
	{ label: "Donut", value: "donut", icon: Donut },
	{ label: "Pie", value: "pie", icon: PieChart },
] as const;

function HostLiveLeftSideBar({
	onChartTypeChange,
	activeChartType,
}: HostLiveLeftSideBarProps) {
	return (
		<nav className="flex flex-col gap-2 rounded-2xl border border-white/80 bg-white/[.92] p-2 shadow-[0_18px_60px_rgba(15,23,42,.14)] backdrop-blur">
			{chartOptions.map((option) => {
				const Icon = option.icon;
				const isActive = activeChartType === option.value;

				return (
					<Tooltip key={option.value} placement="right" title={option.label}>
						<button
							type="button"
							onClick={() => {
								onChartTypeChange(option.value);
							}}
							className={cn(
								"grid h-12 w-12 place-items-center rounded-xl border text-slate-600 transition hover:-translate-y-0.5",
								isActive
									? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
									: "border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
							)}
							aria-label={`${option.label} chart`}
						>
							<Icon className="h-5 w-5" />
						</button>
					</Tooltip>
				);
			})}
		</nav>
	);
}

export default HostLiveLeftSideBar;
