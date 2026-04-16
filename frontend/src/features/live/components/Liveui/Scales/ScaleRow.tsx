"use client";
import React from "react";
import clsx from "clsx";
import ScaleProgress from "./ScaleProgress";
import { Slider } from 'antd';

export type ScaleOption = {
  id: number | string;
  text?: string;
  label?: string;
  color?: string;
};

type Props = {
  option: ScaleOption;
  index: number;
  min: number;
  max: number;
  value: number;
  onChange: (index: number, next: number) => void;
  onSkip: (index: number) => void;
};

const ScaleRow: React.FC<Props> = ({
  option,
  index,
  min,
  max,
  value,
  onChange,
  onSkip,
}) => {
  const displayText = option.text ?? option.label ?? `Option ${index + 1}`;
  const sliderValue = value === 0 ? min : value;

  return (
    <div className="w-full rounded-lg border border-gray-200 p-4 bg-white space-y-3 shadow">
      <div className="flex items-center justify-between">
        <div className="text-base font-medium text-gray-800">{displayText}</div>
        <div
          className={clsx(
            "px-2 py-1 rounded-lg text-xs font-semibold",
            value === 0 ? "bg-slate-100 text-slate-500" : "bg-[#bc5eb3] text-white"
          )}
          title={value === 0 ? "Skipped" : `Selected: ${value}`}
        >
          {value === 0 ? "Skipped" : `Value: ${value}`}
        </div>
      </div>

      <ScaleProgress value={value} min={min} max={max} />

      <div className="flex items-center gap-3">
        <Slider
          min={min}
          max={max}
          step={1}
          value={sliderValue}
          onChange={(newValue) => onChange(index, Number(newValue))}
          className="w-full"
          styles={{
            track: {
              height: '10px',
              backgroundColor: '#bc5eb3'
            },
            rail: {
              height: '10px'
            },
            handle: {
              borderColor: '#f00',
              // borderWidth: '2px',
              // height: '20px',
              // width: '20px',
              // marginTop: '-5px'
            }
          }}
        />
        <button
          type="button"
          onClick={() => onSkip(index)}
          className="px-3 py-1.5 rounded-lg border text-sm bg-slate-50 hover:bg-slate-100"
          title="Skip this option (set to 0)"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default ScaleRow;