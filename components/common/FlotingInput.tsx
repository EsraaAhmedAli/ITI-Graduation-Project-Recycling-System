import React from "react";

interface FloatingInputProps {
  id: string;
  type: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  color?: "success" | "failure";
  helperText?: string; // will always show as hint or error
  icon?: React.ReactNode;
}

export function FloatingInput({
  id,
  type,
  label,
  value,
  onChange,
  onBlur,
  onPaste,
  required = false,
  maxLength,
  color,
  helperText,
  icon,
}: FloatingInputProps) {
  const borderColorClasses =
    color === "success"
      ? "border-green-500 focus:border-green-600"
      : color === "failure"
      ? "border-red-500 focus:border-red-600"
      : "border-gray-300 focus:border-green-600";

  const labelColorClasses =
    color === "success"
      ? "peer-focus:text-green-700 text-green-700"
      : color === "failure"
      ? "peer-focus:text-red-700 text-red-700"
      : "peer-focus:text-green-700 text-gray-500";

  const hintColorClass =
    color === "failure"
      ? "text-red-500"
      : color === "success"
      ? "text-green-500"
      : "text-gray-400";

  return (
    <div className="w-full">
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onPaste={onPaste}
          required={required}
          maxLength={maxLength}
          title={helperText}
          placeholder=" "
          className={`block rounded-t-lg px-2.5 pb-2.5 pt-5 pr-10 w-full text-sm text-gray-900 bg-gray-50 border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${borderColorClasses}`}
        />

        {icon && <div className="absolute top-4 right-2 z-10">{icon}</div>}

        <label
          htmlFor={id}
          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${labelColorClasses}`}
        >
          {label}
        </label>
      </div>

      {/* Helper or Error Message */}
      {helperText && (
        <p className={`mt-1 text-xs ${hintColorClass}`}>{helperText}</p>
      )}
    </div>
  );
}
