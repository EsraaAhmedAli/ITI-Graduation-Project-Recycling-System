"use client";

import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { FloatingInput } from "@/components/common/FlotingInput";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import SmartNavigation from "./SmartNavigation";
import toast from "react-hot-toast";
import { initiateSignup } from "@/lib/auth";
import { useUserAuth } from "@/context/AuthFormContext";

export default function BasicInfo() {
  const {
    register,
    watch,
    formState: { errors },
    getValues,
    trigger,
  } = useFormContext();

  const password = watch("password");
  const {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    setStep,
    step,
    setMode,
    GoogleUser,
  } = useAuthenticationContext();
  const nextStep = async () => {
    const fields = GoogleUser
      ? ["phoneNumber"]
      : ["name", "email", "phoneNumber", "password", "confirmPassword"];
    const isValid = await trigger(fields);

    if (!isValid) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (GoogleUser) {
      setStep(step + 2);
      return;
    }
    const email = getValues("email");

    try {
      await initiateSignup(email);
      setStep(step + 1);
      toast.success("The OTP has been sent");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const prevStep = () => {
    setMode("role-select");
  };

  return (
    <>
      {!GoogleUser?.email ? (
        <div className="space-y-4">
          {/* Full Name */}
          <FloatingInput
            id="name"
            label="Full Name"
            type="text"
            {...register("name", { required: "Full name is required" })}
            error={errors.name?.message}
            maxLength={20}
          />

          {/* Email */}
          <FloatingInput
            id="email"
            label="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
            error={errors.email?.message}
            maxLength={30}
          />

          {/* Phone Number */}
          <FloatingInput
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value:
                  /^((01[0125][0-9]{8})|(0(2|3|4[04578]|5[057]|6[245689]|8[24569]|9[2356])[0-9]{7}))$/,
                message: "Enter a valid Egyptian mobile or landline number",
              },
            })}
            error={errors.phoneNumber?.message}
            maxLength={11}
          />

          {/* Password */}
          <FloatingInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
              pattern: {
                value:
                  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
                message:
                  "8–20 chars, 1 uppercase, 1 number, 1 special character",
              },
            })}
            error={errors.password?.message}
            icon={
              showPassword ? (
                <EyeOff
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowPassword(true)}
                />
              )
            }
            maxLength={20}
          />

          {/* Confirm Password */}
          <FloatingInput
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
            icon={
              showConfirmPassword ? (
                <EyeOff
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <Eye
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )
            }
            maxLength={20}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Phone Number */}
          <FloatingInput
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value:
                  /^((01[0125][0-9]{8})|(0(2|3|4[04578]|5[057]|6[245689]|8[24569]|9[2356])[0-9]{7}))$/,
                message: "Enter a valid Egyptian mobile or landline number",
              },
            })}
            error={errors.phoneNumber?.message}
            maxLength={11}
          />
        </div>
      )}
      <SmartNavigation nextStep={nextStep} prevStep={prevStep} />
    </>
  );
}
