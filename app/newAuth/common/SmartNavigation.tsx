"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import React from "react";
import { roleConfig } from "../Forms/MainForm";
type SmartNavigationProps = {
  nextStep?: () => void;
  prevStep?: () => void;
  onSubmit?: () => void;
};

export default function SmartNavigation({
  nextStep,
  prevStep,
  onSubmit,
}: SmartNavigationProps) {
  const { step, setStep, loading, selectedRole } = useAuthenticationContext();

  if (!nextStep) {
    nextStep = () => {
      setStep(step + 1);
    };
  }
  if (!prevStep) {
    prevStep = () => {
      setStep(step - 1);
    };
  }

  return (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={prevStep}
        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
      >
        Previous
      </button>

      <div className="ml-auto">
        {step < roleConfig[selectedRole]?.steps ? (
          <button
            type="button"
            onClick={nextStep}
            className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            onClick={onSubmit}
            className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        )}
      </div>
    </div>
  );
}
