"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import React from "react";
import { DeliveryInfoForm } from "./DeliveryInfo";
import { IdentityVerificationForm } from "./IdentityVerification";

export default function DeliverySteps() {
  const { step } = useAuthenticationContext();
  console.log(step);

  return (
    <>
      {step === 3 && <DeliveryInfoForm />}

      {step === 4 && <IdentityVerificationForm />}
    </>
  );
}
