'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TreeMapDataPoint {
  x: string;
  y: number;
}

interface GlobalGridMapChartProps {
  seriesData: TreeMapDataPoint[];
}

const GlobalGridMapChart: React.FC<GlobalGridMapChartProps> = ({ seriesData }) => {
  const options: ApexOptions = {
    legend: {
      show: false
    },
    chart: {
      height: 350,
      type: 'treemap',
      toolbar: {
        show: false
      },
    },
    plotOptions: {
      treemap: {
        distributed: true,
        enableShades: false,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 50,
              color: '#CD363A'
            },
            {
              from: 51,
              to: 100,
              color: '#52B12C'
            },
            {
              from: 101,
              to: 150,
              color: '#f2f1f0'
            },
            {
              from: 151,
              to: 250,
              color: '#5C6BC0'
            }
          ]
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#000000']
      }
    },
    title: {
      text: '',
      align: 'center'
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 500
          },
          plotOptions: {
            treemap: {
              dataLabels: {
                style: {
                  fontSize: '100px'
                }
              }
            }
          }
        }
      }
    ]
  };


  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
        <div className="col-span-5">
          <ReactApexChart 
            options={options} 
            series={[{ data: seriesData }]} 
            type="treemap" 
            height={350} 
          />
        </div>
      </div>
    </div>
  );
};

export default GlobalGridMapChart;