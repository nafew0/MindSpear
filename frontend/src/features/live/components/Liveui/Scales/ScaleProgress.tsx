"use client";
import React from "react";
// import clsx from "clsx";

type Props = {
  value: number; // current value (0 means skipped)
  min: number;   // e.g., 1
  max: number;   // e.g., 5
};

const ScaleProgress: React.FC<Props> = ({  min, max }) => {
  // const pct =
  //   value <= 0
  //     ? 0
  //     : max === min
  //     ? 100
  //     : Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="w-full">
      {/* <div className="w-full h-2 rounded-full bg-slate-200/70 relative overflow-hidden">
        <div
          className={clsx(
            "h-2 absolute left-0 top-0 rounded-full transition-all",
            value === 0 ? "bg-slate-300" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div> */}
      <div className="mt-1 text-xs text-gray-500 flex justify-between">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default ScaleProgress;
