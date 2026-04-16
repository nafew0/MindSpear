import React from "react";
import { MdOutlineBarChart, MdDonutSmall } from "react-icons/md";
import { FaChartPie } from "react-icons/fa6";

interface ChartTypeSelectorProps {
  chartType: "bar" | "pie" | "donut";
  setChartType: (type: "bar" | "pie" | "donut") => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ chartType, setChartType }) => {
  const chartButtonClass = (type: string) =>
    `flex flex-col justify-center items-center p-3 rounded-[10px] border border-[#2222] cursor-pointer hover:bg-[#e2e1e0] ${
      chartType === type ? "bg-[#fff] border-[#bc5eb3]" : "bg-white"
    }`;

  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className={chartButtonClass("bar")} onClick={() => setChartType("bar")}>
        <MdOutlineBarChart className="text-[#171717] text-[40px]" />
      </div>
      <div className={chartButtonClass("donut")} onClick={() => setChartType("donut")}>
        <MdDonutSmall className="text-[#171717] text-[40px]" />
      </div>
      <div className={chartButtonClass("pie")} onClick={() => setChartType("pie")}>
        <FaChartPie className="text-[#171717] text-[40px]" />
      </div>
    </div>
  );
};

export default ChartTypeSelector;
