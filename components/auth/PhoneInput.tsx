import React, { useState } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [touched, setTouched] = useState(false);

  const isValid = /^(10|11|12|15)[0-9]{8}$/.test(value);
  const showError = touched && !isValid;

  return (
    <div className="w-full">
      <div className="flex">
        {/* Country Code */}
        <span className="w-20 px-4 flex items-center text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg dark:bg-gray-700 dark:text-white dark:border-gray-600">
          🇪🇬 +20
        </span>

        {/* Input */}
        <div className="flex-grow">
          <label htmlFor="phone-input" className="sr-only">
            Phone number
          </label>
          <input
            type="tel"
            id="phone-input"
            name="phone"
            placeholder="10xxxxxxxx"
            value={value}
            onChange={onChange}
            onBlur={() => setTouched(true)}
            maxLength={10}
            required
            className={`block rounded-t-lg px-2.5 pb-2.5 pt-5 pr-10 w-full text-sm text-gray-900 bg-gray-50 border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${
              showError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : isValid
                ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:border-green-500"
            }`}
          />
        </div>
      </div>

      {/* Helper/Error Message */}
      {showError && (
        <p className="mt-1 text-sm text-red-500">
          it must start with any of [10,11,12,15] and be 10 digits long.
        </p>
      )}
    </div>
  );
}
