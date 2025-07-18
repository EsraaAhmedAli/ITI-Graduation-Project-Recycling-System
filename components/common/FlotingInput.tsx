import React from "react";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  value?: string;
  error?: string;
  icon?: React.ReactNode;
  maxLength?: number;
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(({ id, maxLength, type, label, value, error, icon, ...props }, ref) => {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          id={id}
          ref={ref}
          value={value}
          maxLength={maxLength}
          type={type}
          placeholder=" "
          className={`block rounded-t-lg px-2.5 pb-2.5 pt-5 pr-10 w-full text-sm text-gray-900 bg-gray-50 border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer
              ${
                error
                  ? "border-b-2 border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-green-600"
              }`}
          {...props}
        />

        {icon && (
          <div className="absolute top-4 right-2 z-10 cursor-pointer">
            {icon}
          </div>
        )}

        <label
          htmlFor={id}
          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5
              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
              peer-focus:scale-75 peer-focus:-translate-y-4
              ${
                error
                  ? "text-red-600 peer-focus:text-red-700"
                  : "text-gray-500 peer-focus:text-green-700"
              }`}
        >
          {label}
        </label>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

FloatingInput.displayName = "FloatingInput";
