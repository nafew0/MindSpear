"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type PropsType = {
  label: string;
  items: { value: string; label: string }[];
  value?: string;
  prefixIcon?: React.ReactNode;
  className?: string;
  onChange?: (value: string) => void;
};

export function CustomSelect({
  items,
  label,
  value,
  prefixIcon,
  className,
  onChange,
}: PropsType) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={cn("space-y-3 relative", className)}
    >
      <label className="block text-sm font-medium">
        {label} <span className="font-bold">(Seconds)</span>
      </label>

      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {prefixIcon}
          </div>
        )}

        <input
          type="number"
          value={value || ""}
          placeholder="Type or select seconds"
          onFocus={() => setOpen(true)}
          onChange={(e) =>
            onChange?.(e.target.value.replace(/\D/g, ""))
          }
          className={cn(
            "w-full rounded-lg border px-5 py-3",
            prefixIcon && "pl-11"
          )}
        />

        {open && (
          <ul className="absolute z-10 mt-2 w-full rounded-lg border bg-white shadow-md max-h-48 overflow-auto">
            {items.map((item) => (
              <li
                key={item.value}
                onMouseDown={() => {
                  onChange?.(item.value);
                  setOpen(false);
                }}
                className="cursor-pointer px-4 py-2 bg-[#f2f1f0] hover:bg-gray-200"
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
