import React from "react";

interface OutlinedFloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export const OutlinedFloatingInput = React.forwardRef<
  HTMLInputElement,
  OutlinedFloatingInputProps
>(({ id, label, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        ref={ref}
        placeholder=" "
        className={`block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer
          ${
            error
              ? "border-red-500 dark:border-red-400 focus:border-red-600 dark:focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500"
          }
        `}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute text-sm duration-300 transform scale-75 top-4 z-10 origin-[0] start-2.5
    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
    peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto
    ${props.value || props.defaultValue ? "-translate-y-4 scale-75" : ""}
    ${
      error
        ? "text-red-600 dark:text-red-400"
        : "text-gray-500 dark:text-gray-400 peer-focus:text-blue-600 dark:peer-focus:text-blue-500"
    }
  `}
      >
        {label}
      </label>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

OutlinedFloatingInput.displayName = "OutlinedFloatingInput";
