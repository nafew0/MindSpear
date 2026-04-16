"use client";

import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

const ProgressCharts = () => {
  const progress1Ref = useRef<HTMLDivElement>(null);
  const progress2Ref = useRef<HTMLDivElement>(null);
  const progress3Ref = useRef<HTMLDivElement>(null);

  // Helper function to generate random values
  const getRangeRandom = (yrange: { min: number; max: number }) => {
    return Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
  };

  useEffect(() => {
    if (!progress1Ref.current || !progress2Ref.current || !progress3Ref.current) {
      return;
    }

    // Common chart configuration
    const commonConfig = {
      chart: {
        foreColor: "#fff",
        toolbar: { show: false },
        sparkline: { enabled: true }
      },
      grid: { borderColor: "#40475D" },
      stroke: { width: 0 },
      tooltip: { enabled: false },
      yaxis: { max: 100 },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "20%",
          colors: { backgroundBarColors: ["#40475D"] }
        }
      },
      title: {
        floating: true,
        offsetX: -10,
        offsetY: 5,
        style: { fontSize: "12px" }
      },
      subtitle: {
        floating: true,
        align: "right",
        offsetY: 0,
        style: { fontSize: "20px" }
      }
    };

    // Progress 1 Chart
    const optionsProgress1 = {
      ...commonConfig,
      chart: {
        ...commonConfig.chart,
        height: 70,
        type: "bar",
        stacked: true
      },
      series: [{ name: "Process 1", data: [44] }],
      title: { ...commonConfig.title, text: "Process 1" },
      subtitle: { ...commonConfig.subtitle, text: "44%" },
      xaxis: { categories: ["Process 1"] },
      fill: { opacity: 1 }
    };

    // Progress 2 Chart
    const optionsProgress2 = {
      ...commonConfig,
      chart: {
        ...commonConfig.chart,
        height: 70,
        type: "bar",
        stacked: true
      },
      colors: ["#17ead9"],
      series: [{ name: "Process 2", data: [80] }],
      title: { ...commonConfig.title, text: "Process 2" },
      subtitle: { ...commonConfig.subtitle, text: "80%" },
      xaxis: { categories: ["Process 2"] },
      fill: {
        type: "gradient",
        gradient: {
          inverseColors: false,
          gradientToColors: ["#6078ea"]
        }
      }
    };

    // Progress 3 Chart
    const optionsProgress3 = {
      ...commonConfig,
      chart: {
        ...commonConfig.chart,
        height: 70,
        type: "bar",
        stacked: true
      },
      colors: ["#f02fc2"],
      series: [{ name: "Process 3", data: [74] }],
      title: { ...commonConfig.title, text: "Process 3" },
      subtitle: { ...commonConfig.subtitle, text: "74%" },
      xaxis: { categories: ["Process 3"] },
      fill: {
        type: "gradient",
        gradient: { gradientToColors: ["#6094ea"] }
      }
    };

    // Initialize charts
    const chartProgress1 = new ApexCharts(progress1Ref.current, optionsProgress1);
    chartProgress1.render();

    const chartProgress2 = new ApexCharts(progress2Ref.current, optionsProgress2);
    chartProgress2.render();

    const chartProgress3 = new ApexCharts(progress3Ref.current, optionsProgress3);
    chartProgress3.render();

    // Update charts at interval
    const intervalId = setInterval(() => {
      const p1Data = getRangeRandom({ min: 10, max: 100 });
      chartProgress1.updateOptions({
        series: [{ data: [p1Data] }],
        subtitle: { text: `${p1Data}%` }
      });

      const p2Data = getRangeRandom({ min: 10, max: 100 });
      chartProgress2.updateOptions({
        series: [{ data: [p2Data] }],
        subtitle: { text: `${p2Data}%` }
      });

      const p3Data = getRangeRandom({ min: 10, max: 100 });
      chartProgress3.updateOptions({
        series: [{ data: [p3Data] }],
        subtitle: { text: `${p3Data}%` }
      });
    }, 3000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      chartProgress1.destroy();
      chartProgress2.destroy();
      chartProgress3.destroy();
    };
  }, []);

  return (
    <div className="progress-charts-container">
      <div className="box">
        <div className="mt-4">
          <div ref={progress1Ref}></div>
        </div>
        <div className="mt-4">
          <div ref={progress2Ref}></div>
        </div>
        <div className="mt-4">
          <div ref={progress3Ref}></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;