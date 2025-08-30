"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Wrapper from "@/components/auth/Wrapper";
import { FloatingInput } from "@/components/common/FlotingInput";
import Button from "@/components/common/Button";
import { forgotPassword } from "@/lib/auth";
import { toast } from "react-hot-toast";
import { useUserAuth } from "@/context/AuthFormContext";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useFormContext } from "react-hook-form";

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useFormContext();
  const { t } = useLanguage();
  const { showPassword, setShowPassword, setMode } = useAuthenticationContext();

  // const validateEmail = (email: string) => {
  //   const trimmed = email.trim();
  //   if (trimmed === "") return false;
  //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  // };

  const onSubmit = async () => {
    setLoading(true);

    try {
      await forgotPassword(email);
      setUser({ ...user!, email });
      toast.success("OTP sent! Check your email to continue.");
      router.push(`/auth/otp?from=forgot`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper bg="white">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-1">
          Forgot your password?
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter your email to receive a reset code.
        </p>
      </div>

      <FloatingInput
        id="email"
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email", {
          required: "Email is required",
          maxLength: {
            value: 30,
            message: "Email must be at most 30 characters",
          },
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email format",
          },
        })}
        maxLength={30}
      />

      <Button
        onClick={handleSubmit(onSubmit)}
        type="submit"
        loading={loading}
        className="bg-primary text-base-100 m-auto mt-5 p-2 w-full rounded-lg hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Reset Code"}
      </Button>

      <div className="mt-6 text-center text-xs text-gray-400">
        Don’t worry, your information is 100% secure.
      </div>
    </Wrapper>
  );
}
