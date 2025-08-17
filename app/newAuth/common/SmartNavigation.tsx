"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import React from "react";
import { RoleConfig } from "./RoleCOnfig";
import { useLanguage } from "@/context/LanguageContext";
import { useFormContext } from "react-hook-form";
type SmartNavigationProps = {
  nextStep?: () => void;
  prevStep?: () => void;
  onSubmit?: () => void;
  disableNext?: boolean;
};

export default function SmartNavigation({
  nextStep,
  prevStep,
  onSubmit,
  disableNext = false,
}: SmartNavigationProps) {
  const { step, setStep, loading, selectedRole } = useAuthenticationContext();
  const roleConfig = RoleConfig();
  const { t, locale } = useLanguage();
  const { clearErrors } = useFormContext();
  if (!nextStep) {
    nextStep = () => {
      setStep(step + 1);
    };
  }
  if (!prevStep) {
    prevStep = () => {
      setStep(step - 1);
      clearErrors();
    };
  }

  return (
    <div
      className={`mt-4 flex justify-between ${
        locale === "ar" ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      <button
        type="button"
        onClick={prevStep}
        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
      >
        {t("auth.register.previous")}
      </button>

      <div className="ml-auto">
        {step < roleConfig[selectedRole]?.steps ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={disableNext}
            className="text-white bg-primary hover:bg-secondary disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {t("auth.register.next")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            onClick={onSubmit}
            className="text-white bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
          >
            {loading
              ? t("auth.login.createAccount")
              : t("auth.login.signingUp")}
          </button>
        )}
      </div>
    </div>
  );
}
