"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "flowbite-react";
import Wrapper from "@/components/auth/Wrapper";
import { useRouter } from "next/navigation";
import { initiateSignup, verifyOtp } from "@/lib/auth";
import { toast } from "react-hot-toast";
import { Controller, useFormContext } from "react-hook-form";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

type OTPInputProps = {
  comeFrom: "signup" | "forgot";
};

export default function OTPInput({ comeFrom }: OTPInputProps) {
  const length = 6;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { control, getValues, setValue, watch } = useFormContext();
  const [canSubmit, setCanSubmit] = useState(false);
  const { setStep, step } = useAuthenticationContext();
  const otpValues = watch("otp") || [];
  // 1. Helper function for validating the full OTP array
  const validateOtp = () => {
    const values = getValues("otp") || [];
    const isValid =
      values.length === 6 && values.every((v) => /^[0-9]$/.test(v));
    setCanSubmit(isValid);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    onChange: (value: string) => void
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    onChange(value);

    const input = inputRefs.current[index];
    if (input) input.value = value;

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    validateOtp();
  };

  const focusNext = (index: number) => {
    if (index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, length);

    pasted.split("").forEach((char, i) => {
      setValue(`otp[${i}]`, char);
      const input = inputRefs.current[i];
      if (input) input.value = char;
    });

    // Focus the first empty input after paste
    const nextIndex = pasted.length < length ? pasted.length : length - 1;
    inputRefs.current[nextIndex]?.focus();

    validateOtp();
  };

  const handleSubmit = async () => {
    const values = getValues();
    const otpValue = (values.otp || []).join("");
    const email = values.email;

    if (otpValue.length !== length) return;

    if (comeFrom === "forgot") {
      router.push(`/auth/resetpassword?otp=${otpValue}`);
      return;
    }

    try {
      await verifyOtp({ email, otpCode: otpValue });
      setStep(step + 1);
      toast("GO AHEAD => ");
    } catch {
      toast.error("OTP submission failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      await initiateSignup(getValues("email"));
      toast("Resend OTP Successfully");
    } catch {
      toast.error("OTP Resend failed");
    }
  };

  return (
    <>
      <Wrapper bg="white">
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-500">
            Enter the 6-digit code. You can paste the full code directly.
          </p>
          <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, i) => (
              <Controller
                key={i}
                name={`otp[${i}]`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className="w-10 h-10 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    ref={(el) => {
                      inputRefs.current[i] = el;
                      field.ref(el);
                    }}
                    onChange={(e) => handleChange(e, i, field.onChange)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValues?.[i]) {
                        focusPrev(i);
                      }
                    }}
                    onPaste={handlePaste}
                  />
                )}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Didn’t receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-green-600 hover:underline font-medium"
            >
              Resend OTP
            </button>
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-green-700 text-white m-auto w-50 h-10 rounded-lg hover:bg-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </Button>
        </div>
      </Wrapper>
    </>
  );
}
