/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
// } from "recharts";

// ----------------------------- Types -----------------------------
export type RankItem = { label: string; value: number; color?: string };
export type RankingProps = {
  title?: string;
  items: RankItem[];
  barSize?: number;
  valueSuffix?: string;
};

export type ScaleItem = { text: string; value: number; color?: string };
export type ScalesProps = {
  title?: string;
  items: ScaleItem[];
  full?: number; // maximum bar value
  height?: number;
};

// ----------------------------- Utils -----------------------------
const defaultPalette: readonly string[] = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
];

// ----------------------------- ScalesChart -----------------------------
export function ScalesChart({ title = "Scales", items, full = 5, height = 420 }: ScalesProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold tracking-tight mb-3">{title}</h2>
      <div className="w-full" style={{ height }}>
        <div className="flex flex-col gap-8">
          {items.map((item, idx) => {
            const percentage = (item.value / full) * 100;
            const color = item.color || defaultPalette[idx % defaultPalette.length];
            
            // Create area chart data that shows the value progression
            // const areaData = [
            //   { x: 0, value: 0 },
            //   { x: 1, value: item.value * 0.3 },
            //   { x: 2, value: item.value * 0.7 },
            //   { x: 3, value: item.value },
            //   { x: 4, value: item.value * 0.7 },
            //   { x: 5, value: item.value * 0.3 },
            //   { x: 6, value: 0 }
            // ];
            
            return (
              <div key={idx} className="relative w-full h-20  bg-gray-50 rounded-lg overflow-hidden p-4">
                {/* Area chart showing the value with beautiful curve */}
               
                
                {/* Content overlay */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Top row with text and value */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800 bg-white bg-opacity-70 px-2 py-1 rounded">
                      {item.text}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 bg-white bg-opacity-70 px-2 py-1 rounded">
                      {item.value}/{full}
                    </span>
                  </div>
                  
                  {/* Progress bar indicator at bottom */}
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}40`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------- Demo Page -----------------------------
// const MentimeterLikeChartsDemo: React.FC = () => {


  // const scaleItems: ScaleItem[] = [
  //   { text: "Statement 1", value: 4 },
  //   { text: "Statement 2", value: 5 },
  //   { text: "Statement 3", value: 5 },
  // ];

//   return (
//     <div className="p-6 grid gap-6 md:grid-cols-2 bg-gray-50 min-h-[60vh]">
//       <ScalesChart title="Scales" items={scaleItems} full={5} />
//     </div>
//   );
// };

// export default MentimeterLikeChartsDemo;