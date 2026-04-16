import React from "react";
import ApexCharts from "react-apexcharts";
interface GlobalDonutChartProps {
  series: number[]; 
  labels: string[]; 
  colors: string[];
  width?: number; 
}

const GlobalDonutChart: React.FC<GlobalDonutChartProps> = ({ series, labels, colors, width = 800 }) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
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
            width: 800,
            height: 800,
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
      type="donut"
      width={width}
    />
  );
};

export default GlobalDonutChart;
