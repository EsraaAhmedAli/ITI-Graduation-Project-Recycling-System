"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import React from "react";
import BusinessInfo from "../buyer/BusinessInfo";
import LFInfo from "../buyer/LFInfo";

export default function BuyerSteps() {
  const { step } = useAuthenticationContext();

  return (
    <>
      {/* Step 2: Business Info */}
      {step === 3 && <BusinessInfo />}

      {/* Step 3: Legal & Financial */}
      {step === 4 && <LFInfo />}
    </>
  );
}
