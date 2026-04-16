"use client";
import React from "react";
import { BarChart as GlobalBarChart } from "@/components/charts";
import { DonutChart as GlobalDonutChart } from "@/components/charts";
import { PieChart as GlobalPieChart } from "@/components/charts";

interface QuestionChartProps {
	chartType: "bar" | "pie" | "donut";
	series: number[];
	labels: string[];
	colors: string[];
}

const QuestionChart: React.FC<QuestionChartProps> = ({
	chartType,
	series,
	labels,
	colors,
}) => {
	if (chartType === "bar") {
		return (
			<div className="w-[80%] m-auto">
				<GlobalBarChart
					data={series}
					categories={labels}
					colors={colors}
				/>
			</div>
		);
	}
	if (chartType === "pie") {
		//console.log("9999999999");

		return (
			<div className="w-[80%] m-auto flex justify-center items-center">
				<GlobalPieChart
					series={series}
					labels={labels}
					colors={colors}
				/>
			</div>
		);
	}
	if (chartType === "donut") {
		return (
			<div className="w-[80%] m-auto flex justify-center items-center">
				<GlobalDonutChart
					series={series}
					labels={labels}
					colors={colors}
				/>
			</div>
		);
	}
	return null;
};

export default QuestionChart;
