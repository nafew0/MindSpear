"use client";

import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

interface HorizontalProgressBarsProps {
  data: number[];
  colors: string[];
  labels: string[];
}

const HorizontalProgressBars: React.FC<HorizontalProgressBarsProps> = ({
  data ,
  colors,
  labels,
}) => {
  const chartRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // only proceed if all refs for current data length are available
    const mounts = chartRefs.current.slice(0, data.length);
    if (mounts.some((el) => !el)) return;

    const commonConfig: ApexCharts.ApexOptions = {
      chart: {
        foreColor: "#222",
        toolbar: { show: false },
        sparkline: { enabled: true },
        animations: { enabled: true, speed: 800 },
      },
      grid: { borderColor: "#f2f1f0" },
      stroke: { width: 0 },
      tooltip: { enabled: false },
      yaxis: { max: 100 },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "15%",
          colors: {
            backgroundBarColors: ["#f2f1f0"],
            backgroundBarRadius: 5,
          },
        },
      },
      title: {
        floating: true,
        offsetX: -10,
        offsetY: 5,
        style: { fontSize: "12px", color: "#222" },
      },
      subtitle: {
        floating: true,
        align: "right",
        offsetY: 0,
        style: { fontSize: "20px", fontWeight: "bold", color: "#222" },
      },
    };

    const charts = mounts.map((mount, index) => {
      const numericValue = Number(data[index] ?? 0);
      const color = colors[index % colors.length];
      const label = labels[index % labels.length];

      const options: ApexCharts.ApexOptions = {
        ...commonConfig,
        chart: {
          ...commonConfig.chart,
          height: 70,
          type: "bar",
          stacked: true,
        },
        colors: [color],
        series: [{ name: label, data: [numericValue] }],
        title: { ...commonConfig.title, text: label },
        subtitle: { ...commonConfig.subtitle, text: `${numericValue}%` },
        xaxis: { categories: [label] },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "horizontal",
            shadeIntensity: 0.5,
            inverseColors: false,
            gradientToColors: [color],
            stops: [0, 100],
          },
        },
      };

      const chart = new ApexCharts(mount!, options);
      chart.render();
      return chart;
    });

    return () => {
      charts.forEach((c) => c.destroy());
    };
  }, [data, colors, labels]);

  const setChartRef = (index: number): React.RefCallback<HTMLDivElement> => {
    return (el) => {
      chartRefs.current[index] = el;
    };
  };

  return (
    <div className="w-full mx-auto rounded-lg">
      <div className="">
        {data.map((_, index) => (
          <div key={index} className=" rounded-lg">
            <div ref={setChartRef(index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalProgressBars;
