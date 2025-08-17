"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { FloatingInput } from "@/components/common/FlotingInput";
import SmartNavigation from "./SmartNavigation";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

export default function CompleteSignup() {
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext();

  const { GoogleUser, setMode, setLoading } = useAuthenticationContext();

  const handleCompleteSignup = async () => {
    const isValid = await trigger(["phoneNumber"]);
    if (!isValid) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!GoogleUser) {
      toast.error("Google user data is missing.");
      return;
    }

    setMode("role-select");
  };

  const handleGoBack = () => {
    setMode("login"); // or "role-select" based on your flow
  };

  return (
    <>
      <div className="space-y-4">
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
          error={errors.phoneNumber?.message as string}
          maxLength={11}
        />
      </div>

      <SmartNavigation
        nextStep={handleCompleteSignup}
        prevStep={handleGoBack}
      />
    </>
  );
}
