import React from "react";
import ApexCharts from "react-apexcharts";

interface GlobalPieChartProps {
  series: number[];
  labels: string[];
  colors: string[];
  width?: number | string; 
  height?: number | string; 
}

const GlobalPieChart: React.FC<GlobalPieChartProps> = ({
  series,
  labels,
  colors,
  width = 800,
  height = 800, 
}) => {
  if (!series || !labels || !colors || series.length === 0) {
    console.error("Invalid chart data:", { series, labels, colors });
    return <div>Loading chart data...</div>;
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "pie",
      width: width,
    },
    labels: labels,
    colors: colors,
    legend: {
      labels: {
        colors: colors, 
        useSeriesColors: false
      },
      // markers: {
      //   width: 12,
      //   height: 12,
      //   radius: 6,
      // }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 'bold',
        colors: ['#fff'] 
      },
      dropShadow: {
        enabled: false 
      }
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -10, // Adjust label position
        }
      }
    },
    responsive: [
      {
        breakpoint: 380,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
      <ApexCharts
        options={options}
        series={series}
        type="pie"
        width={width}
        height={height} 
      />
  );
};

export default GlobalPieChart;