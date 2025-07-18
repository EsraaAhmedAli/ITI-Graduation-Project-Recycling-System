"use client";

import React, { useRef } from "react";

type OTPInputProps = {
  length?: number;
  value: string | boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name: string;
  error?: string;
};

export default function OTPInput({
  length = 6,
  value,
  onChange,
  onBlur,
  name,
  error,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const char = e.target.value;
    if (!/^[0-9]?$/.test(char)) return;

    const newOtp = value.split("");
    newOtp[index] = char;
    onChange(newOtp.join(""));

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .slice(0, length)
      .replace(/[^0-9]/g, "");
    if (paste) {
      const newOtp = value.split("");
      paste.split("").forEach((char, i) => {
        newOtp[i] = char;
        const input = inputRefs.current[i];
        if (input) input.value = char;
      });
      onChange(newOtp.join(""));
    }
  };

  return (
    <div className="space-y-2 text-center">
      <p className="text-sm text-gray-500">
        Enter the 6-digit code. You can paste the full code directly.
      </p>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            maxLength={1}
            name={`${name}-${i}`}
            className="w-10 h-10 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={value[i] || ""}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            onBlur={onBlur}
            ref={(el) => (inputRefs.current[i] = el)}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
