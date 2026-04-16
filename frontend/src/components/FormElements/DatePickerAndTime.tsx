"use client";

import { Calendar } from "@/components/Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef, useState } from "react";
import "flatpickr/dist/flatpickr.min.css";

type DatePickerOneProps = {
  value?: Date | null;
  lable: string;
  mode?: "date" | "time";
  onChange: (date: Date | null) => void;
};

const DatePickerAndTime = ({ value, lable, mode = "date", onChange }: DatePickerOneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showTimeList, setShowTimeList] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
  });

  // Generate time options from 12:00 AM to 11:45 PM in 15-minute increments
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      timeOptions.push(
        time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    }
  }

  useEffect(() => {
    if (inputRef.current && mode === "date") {
      const fp = flatpickr(inputRef.current, {
        defaultDate: value ?? new Date(), // Default to current date if no value provided
        dateFormat: "M j, Y",
        static: true,
        mode: "single",
        monthSelectorType: "static",
        onChange: (selectedDates) => {
          const date = selectedDates[0] ?? null;
          onChange?.(date);
          if (date) {
            setSelectedDate(date.toLocaleDateString([], { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric' 
            }));
          }
        },
      });

      // Set initial display value
      if (!value) {
        fp.setDate(new Date());
      }
    }
  }, [value, onChange, mode]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowTimeList(false);
    
    // Convert to 24-hour format and create Date object
    const [timePart, period] = time.split(' ');
    // eslint-disable-next-line prefer-const
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const newDate = new Date();
    newDate.setHours(hours, minutes, 0, 0);
    onChange?.(newDate);
  };

  if (mode === "time") {
    return (
      <div>
        <label className="mb-1 font-bold block text-body-sm  text-dark dark:text-white">
          {lable}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-bold outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
            placeholder="hh:mm AM/PM"
            value={selectedTime}
            readOnly
            onClick={() => setShowTimeList(!showTimeList)}
          />
          <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
            <Calendar className="size-5 text-[#9CA3AF]" />
          </div>
          
          {showTimeList && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-dark-2 py-1 shadow-lg">
              {timeOptions.map((time) => (
                <div
                  key={time}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 ${
                    time === selectedTime ? 'bg-gray-200 dark:bg-dark-4' : ''
                  }`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-body-sm font-bold text-dark dark:text-white">
        {lable}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-bold outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          placeholder="mm/dd/yyyy"
          defaultValue={selectedDate}
        />
        <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
          <Calendar className="size-5 text-[#9CA3AF]" />
        </div>
      </div>
    </div>
  );
};

export default DatePickerAndTime;