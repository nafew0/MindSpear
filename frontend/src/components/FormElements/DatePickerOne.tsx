"use client";

import { Calendar } from "@/components/Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";
import "flatpickr/dist/flatpickr.min.css";

type DatePickerOneProps = {
  value?: Date | null;
  lable: string,
  onChange?: (date: Date | null) => void;
};

const DatePickerOne = ({ value, lable, onChange }: DatePickerOneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      flatpickr(inputRef.current, {
        defaultDate: value ?? undefined,
        dateFormat: "M j, Y",
        static: true,
        mode: "single",
        monthSelectorType: "static",
        onChange: (selectedDates) => {
          onChange?.(selectedDates[0] ?? null);
        },
      });
    }
  }, [value, onChange]);

  return (
    <div>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {lable}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          placeholder="mm/dd/yyyy"
        />
        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
          <Calendar className="size-5 text-[#9CA3AF]" />
        </div>
      </div>
    </div>
  );
};

export default DatePickerOne;
