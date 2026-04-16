import React from "react";
import { cn } from "@/lib/utils";
import { type HTMLInputTypeAttribute, useId } from "react";

type InputGroupProps = {
  className?: string;
  label: string;
  placeholder: string;
  type: HTMLInputTypeAttribute;
  fileStyleVariant?: "style1" | "style2";
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  name?: string;
  value?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  suffixIcon?: React.ReactNode;
  suffixIconClick?: () => void;
  height?: "sm" | "default";
  error?: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  (
    {
      className,
      label,
      type,
      placeholder,
      required,
      disabled,
      active,
      icon,
      iconPosition = "left",
      suffixIcon,
      suffixIconClick,
      height,
      error,
      ...props
    },
    ref
  ) => {
    const id = useId();

    return (
      <div className={className}>
        <label
          htmlFor={id}
          className="text-body-sm font-medium text-dark dark:text-white"
        >
          {label}
          {required && <span className="ml-1 select-none text-red">*</span>}
        </label>

        <div className="relative mt-3">
          {icon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10 text-xl",
                iconPosition === "left" ? "left-4.5" : "right-4.5",
                error ? "text-red-500" : "text-gray-400"
              )}
            >
              {icon}
            </div>
          )}
          {suffixIcon && (
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10 text-xl cursor-pointer",
                "right-4.5",
                error ? "text-red-500" : "text-gray-400"
              )}
              onClick={suffixIconClick}
            >
              {suffixIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            data-active={active}
            className={cn(
              "w-full rounded-lg border-[1.5px] bg-transparent outline-none transition placeholder:text-dark-6 dark:text-white dark:bg-dark-2 dark:border-dark-3",
              type === "file"
                ? getFileStyles(props.fileStyleVariant ?? "style1")
                : "px-5.5 py-3 text-dark",
              icon && iconPosition === "left" && "pl-12.5",
              (icon && iconPosition === "right") || suffixIcon ? "pr-12.5" : "",
              height === "sm" && "py-2.5",
              error
                ? "border-red-500 focus:border-red-500"
                : "border-stroke focus:border-primary"
            )}
            {...props}
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";
export default InputGroup;

function getFileStyles(variant: "style1" | "style2") {
  switch (variant) {
    case "style1":
      return `file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-[#E2E8F0] file:px-6.5 file:py-[13px] file:text-body-sm file:font-medium file:text-dark-5 file:hover:bg-primary file:hover:bg-opacity-10 dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white`;
    default:
      return `file:mr-4 file:rounded file:border-[0.5px] file:border-stroke file:bg-stroke file:px-2.5 file:py-1 file:text-body-xs file:font-medium file:text-dark-5 file:focus:border-primary dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white px-3 py-[9px]`;
  }
}
