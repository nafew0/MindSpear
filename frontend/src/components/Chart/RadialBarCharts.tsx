'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import ApexCharts from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  participantsNumber : number
}
const RadialBarCharts: React.FC<Props> = ({participantsNumber}) => {
  console.log(participantsNumber, "participantsNumber");
  
   const value = Math.max(0, Math.min(100, Number(participantsNumber) || 0));
   const ddd = useMemo(() => [value], [value]);
  const series = ddd
  const options: ApexCharts.ApexOptions = {
    chart: {
      height: 350,
      type: 'radialBar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          position: 'front',
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.5,
          },
        },
        track: {
          background: '#fff',
          strokeWidth: '67%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.7,
          },
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            color: '#888',
            fontSize: '17px',
          },
          value: {
            formatter: (val: number) => `${parseInt(val.toString())}`,
            color: '#111',
            fontSize: '36px',
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#bc5eb3'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
        colorStops: [],
      },
    },
    colors: ['#F79945'],
    stroke: {
      lineCap: 'round',
    },
    labels: ['Participants'],
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="radialBar" height={350} />
    </div>
  );
};

export default RadialBarCharts;

