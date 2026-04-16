/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type BarChartProps = {
  data: any;
  categories: string[];
  height?: number;
  horizontal?: boolean;
  rounded?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  colors?: any[];
};

export default function GlobalHorizantalBarChart({
  data,
  categories,
  height = 400,
  horizontal = true,
  rounded = 4,
  className,
  title,
  colors = [],
}: BarChartProps) {
  // SAFE values
  const safeData = Array.isArray(data) ? data : [];
  const safeCats = Array.isArray(categories) ? categories : [];

  // console.log(colors, "datadatadatadata");
  // console.log(data, "datadatadatadata");
  // console.log(categories, "datadatadatadata");
  

  
  const sorted = useMemo(() => {
  return safeData
    .map((value, index) => ({ value, label: safeCats[index] }))
    .sort((a, b) => b.value - a.value);
}, [safeData, safeCats]);


  const sortedData = sorted.map((item) => item.value);
  const sortedCategories = sorted.map((item) => item.label);

  const defaultColors = [
    "#008FFB",
    "#00E396",
    "#FEB019",
    "#FF4560",
    "#775DD0",
    "#546E7A",
    "#26a69a",
    "#D10CE8",
    "#FF9F43",
    "#00D9E9",
  ];

  const options: ApexOptions = useMemo(() => {
    const titleObj =
      typeof title === "string" && title.trim().length
        ? {
            text: title,
            align: "left" as const,
            margin: 12,
            offsetX: 0,
            offsetY: 0,
            floating: false,
          }
        : undefined;

    return {
      chart: {
        type: "bar",
        height,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal,
          borderRadius: rounded,
          borderRadiusApplication: "end",
          distributed: true,
          dataLabels: { position: "right" },
        },
      },
      colors:
        colors.length > 0 ? colors : defaultColors.slice(0, sortedData.length),

      dataLabels: { 
        enabled: true,
        textAnchor: "start",
        offsetX: 10,
        formatter: (val: number) => `${val}%`,
        style: {
          colors: ["#304758"],
          fontSize: "12px",
          fontWeight: "bold",
        },
      },
      xaxis: {
        categories: sortedCategories,
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        labels: {
          show: true,
          style: {
            colors: "#333",
            fontSize: "12px",
            fontWeight: "bold",
          },
        },
      },
      grid: { show: false },
      tooltip: {
        enabled: false,
      },
      ...(titleObj ? { title: titleObj } : {}),
    };
  }, [height, horizontal, rounded, title, colors, sortedData, sortedCategories]);

  const series = useMemo(
    () => [{ name: "Value", data: sortedData }],
    [sortedData]
  );

  return (
    <div className={className}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
}
