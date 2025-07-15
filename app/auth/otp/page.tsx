// components/OTPInput.tsx
"use client";

import React, { useRef, useState } from "react";
import { Button } from "flowbite-react";
import Wrapper from "@/components/auth/Wrapper";
import { useRouter } from "next/navigation";
import { resetPassword, verifyOtpAndRegister } from "@/lib/auth";
import { useUserAuth } from "@/context/AuthFormContext";
import { useSearchParams } from "next/navigation";

type OTPInputProps = {
  length?: number;
  onSubmit: (value: string) => void;
};

export default function OTPInput({ length = 6, onSubmit }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otp = useRef<string[]>(Array(length).fill(""));
  const [canSubmit, setCanSubmit] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUserAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // "signup" or "forgot"
  // console.log(user);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return;
    otp.current[index] = value;
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    setCanSubmit(otp.current.every((digit) => digit !== ""));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp.current[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .slice(0, length)
      .replace(/[^0-9]/g, "");
    if (paste.length > 0) {
      paste.split("").forEach((char, i) => {
        otp.current[i] = char;
        const input = inputRefs.current[i];
        if (input) input.value = char;
      });
      const nextEmptyIndex = otp.current.findIndex((val) => val === "");
      if (nextEmptyIndex === -1) {
        inputRefs.current[length - 1]?.focus();
        setCanSubmit(true);
      } else {
        inputRefs.current[nextEmptyIndex]?.focus();
        setCanSubmit(false);
      }
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.current.join("");

    if (otpValue.length !== length) return;
    if (from === "forgot") {
      // Handle forgot password case
      try {
        router.push(`/auth/resetpassword?otp=${otpValue}`);
      } catch (error) {
        console.error("Password reset failed:", error);
      }
      return;
    }

    try {
      const res = await verifyOtpAndRegister({
        name: user?.fullName || "",
        email: user?.email || "",
        password: user?.password || "",
        phoneNumber: user?.phoneNumber?.padStart(11, "0") || "",
        otpCode: otpValue,
      });
      console.log(res);

      // Store token in localStorage (or cookies)
      localStorage.setItem("token", res.token);

      // Optionally store user in global context
      setUser(res.user); // if using React Context

      router.push("/cart");
    } catch (error) {
      console.error("OTP submission failed:", error);
    }
  };

  return (
    <Wrapper>
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-500">
          Enter the 6-digit code. You can paste the full code directly.
        </p>
        <div className="flex gap-2 justify-center">
          {Array.from({ length }).map((_, i) => (
            <input
              key={i}
              maxLength={1}
              className="w-10 h-10 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[i] = el)}
            />
          ))}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-green-700 text-white m-auto w-50 h-10 rounded-lg hover:bg-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </Button>
      </div>
    </Wrapper>
  );
}
