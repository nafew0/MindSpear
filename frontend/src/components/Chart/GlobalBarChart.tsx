'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GlobalBarChartProps {
  data: number[];
  categories: string[];
  title?: string;
  colors?: string[];
}

const GlobalBarChart: React.FC<GlobalBarChartProps> = ({ data, categories, title, colors }) => {
  console.log(categories, "categoriescategoriescategoriescategories");
  
  const barColors = colors;
  const truncatedCategories = categories.map((item) =>
    item.length > 10 ? item.slice(0, 10) + "..." : item
  );

  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'bar',
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        horizontal: false,
        distributed: true,
        dataLabels: {
          position: 'top',
        },
        columnWidth: '30%',
      },
    },
    colors: barColors,
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val?.toString();
      },
      offsetY: -25,
      style: {
        fontSize: '12px',
        colors: ["#304758"],
      }
    },
    xaxis: {
      categories: truncatedCategories,
      position: 'bottom',
      axisBorder: {
        show: true
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: true,
      },
      labels: {
        show: false,
        formatter: function (val) {
          return val.toString();
        }
      }
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
      custom: ({ dataPointIndex }) => {
        return `
          <div class="apexcharts-tooltip">
            <span><strong>${categories[dataPointIndex]}: ${data[dataPointIndex]}</strong></span>
          </div>
        `;
      },
    },
    title: {
      text: title || '',
      floating: true,
      offsetY: 330,
      align: 'center',
      style: {
        color: '#444'
      }
    },
  };

  const series = [{
    name: title,
    data: data
  }];

  return (
    <ReactApexChart options={options} series={series} type="bar" height={350} />
  );
};

export default GlobalBarChart;

