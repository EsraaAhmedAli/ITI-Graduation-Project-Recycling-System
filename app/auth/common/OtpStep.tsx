"use client";

import React, { useRef, useState } from "react";
import { Button } from "flowbite-react";
import { initiateSignup, registerUser, verifyOtp } from "@/lib/auth";
import { toast } from "react-hot-toast";
import { Controller, useFormContext } from "react-hook-form";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";
type OTPInputProps = {
  comeFrom: "signup" | "forgot";
};

export default function OTPInput({ comeFrom }: OTPInputProps) {
  const length = 6;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { control, getValues, setValue, watch } = useFormContext();
  const [canSubmit, setCanSubmit] = useState(false);
  const { setStep, step } = useAuthenticationContext();
  const otpValues = watch("otp") || [];
  const { selectedRole, GoogleUser } = useAuthenticationContext();
  const { setUser, setToken } = useUserAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    onChange(value); // ✅ RHF keeps the value

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    validateOtp();
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
    });

    // focus first empty after paste
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    validateOtp();
  };
  const createUser = async () => {
    const values = getValues();
    try {
      const res = await registerUser({
        name: GoogleUser?.name || values.name,
        email: GoogleUser?.email || values.email,
        provider: GoogleUser?.provider,
        imgUrl: GoogleUser?.image,
        password: values.password,
        phoneNumber: values.phoneNumber,
        role: selectedRole,
        attachments: {},
        idToken: values.idToken,
      });

      toast.success(t("auth.register.success"));
      setUser(res.user);
      setToken(res.accessToken);
      router.replace("/");
    } catch (error) {
      toast.error(t("auth.register.fail"));
    }
  };
  const handleSubmit = async () => {
    const values = getValues();
    const otpValue = (values.otp || []).join("");
    const email = values.email;

    if (otpValue.length !== length) return;

    setLoading(true);
    try {
      await verifyOtp({ email, otpCode: otpValue });
      if (selectedRole !== "delivery" && comeFrom === "signup") {
        await createUser();
        return;
      }
      toast.success(t("auth.otp.verified"));
      setStep(step + 1);
    } catch {
      toast.error(t("auth.otp.unVerified"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await initiateSignup(getValues("email"));
      toast(t("resend_success"));
    } catch {
      toast(t("resend_failed"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-500">{t("auth.otp.instruction")}</p>
        <div className="flex gap-2 justify-center" dir="ltr">
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
                  value={field.value || ""}
                  className="w-10 h-10 text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                  dir="ltr" // ✅ always LTR
                  ref={(el) => {
                    inputRefs.current[i] = el;
                    field.ref(el);
                  }}
                  onChange={(e) => handleChange(e, i, field.onChange)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpValues?.[i]) {
                      focusPrev(i);
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (canSubmit) {
                        handleSubmit();
                      }
                    }
                  }}
                  onPaste={handlePaste}
                />
              )}
            />
          ))}
        </div>

        <p className="text-sm text-gray-500">
          {t("auth.otp.resend_question")}
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-green-600 hover:underline font-medium"
          >
            {t("auth.otp.resend_button")}
          </button>
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="bg-green-700 text-white m-auto w-50 h-10 rounded-lg hover:bg-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("auth.otp.confirming") : t("auth.otp.confirm")}
        </Button>
      </div>
    </>
  );
}
