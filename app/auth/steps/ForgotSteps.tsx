import { useAuthenticationContext } from "@/context/AuhenticationContext";
import React from "react";
import { useFormContext } from "react-hook-form";
import OTPInput from "../common/OtpStep";

export default function ForgotSteps() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { step } = useAuthenticationContext();

  return (
    <>
      {/* {step === 1 && <EmailStep />}
      {step === 2 && <OTPInput comeFrom="forgot" />}
      {step === 3 && <ResetPasswordStep />} */}
    </>
  );
}
