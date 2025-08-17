"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

import { X } from "lucide-react";
import RoleStepper from "@/app/newAuth/common/RoleStepper";
import React from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import LoginForm from "./LoginForm";
import RoleSelect from "@/app/newAuth/common/RoleSelectionStep";
import SignUpForm from "./SignUpForm";
import { useLanguage } from "@/context/LanguageContext";
import ForgetPasswordForm from "./ForgotPasswordForm";
import { RoleConfig } from "../common/RoleCOnfig";
export const roleKeys = {
  customer: true,
  delivery: true,
  buyer: true,
};

export type Role = keyof typeof roleKeys;

export default function MainForm() {
  const {
    mode,
    setMode,
    selectedRole,
    setSelectedRole,
    step,
    setStep,
    handleClose,
    resetState,
  } = useAuthenticationContext();
  const { t } = useLanguage();
  const roleConfig = RoleConfig();

  const { handleSubmit, clearErrors } = useFormContext();

  const resetForm = () => {
    resetState();
    setStep(1);
    setSelectedRole("customer");
  };

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };
  // No longer needed with react-hook-form

  const onClose = () => {
    resetForm();
    setMode("login");
    handleClose();
  };

  // const handleSocialAuth = async (provider: string) => {
  //   setLoading(true);
  //   try {
  //     // Implement your social auth logic here
  //     console.log(`Authenticating with ${provider}`);
  //     // onAuth({ provider, role: selectedRole || 'customer' });
  //   } catch (error) {
  //     console.error("Social auth error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Removed unused onSubmit function

  // const nextStep = () => {
  //   if (step < roleConfig[selectedRole]?.steps) {
  //     setStep(step + 1);
  //   }
  // };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
    if (step == 1) {
      const toMode = mode === "signup" ? "role-select" : "login";
      setMode(toMode);
      clearErrors();
    }
  };

  // const renderBasicInfo = () => <BasicInfo />;

  // Stepper labels for each role
  // const stepLabels = {
  //   customer: ["Basic Info", "Address"],
  //   delivery: ["Basic Info", "Vehicle & License", "Identity Verification"],
  //   buyer: ["Basic Info", "Business Info", "Legal & Financial"],
  //   admin: ["Basic Info", "Admin Access"],
  // };

  // const renderSocialButtons = () => (
  //   <SocialButtons loading={loading} onSocialAuth={handleSocialAuth} />
  // );

  return (
    <>
      <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
        <h3 className="text-xl font-semibold">
          {mode === "role-select"
            ? t("auth.login.ChooseYourRole")
            : mode === "login"
            ? t("auth.login.signIn")
            : mode === "forgot-password"
            ? t("auth.login.forgotPassword")
            : selectedRole
            ? roleConfig[selectedRole]?.title
            : t("auth.login.signUp")}
        </h3>
        <button
          className="p-1 ms-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-end text-3xl leading-none font-semibold outline-none focus:outline-none"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      {/* Body */}
      <div className="relative p-6 flex-auto">
        {/* Show the Flowbite stepper for signup mode and selected role */}
        {mode === "signup" && selectedRole && (
          <RoleStepper role={selectedRole} step={step} />
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          {mode === "role-select" && <RoleSelect prevStep={prevStep} />}
          {/* {mode === "complete-signup" && <CompleteSignup />} */}

          {mode === "login" && <LoginForm />}
          {mode === "signup" && selectedRole && <SignUpForm />}
          {mode === "forgot-password" && <ForgetPasswordForm />}
        </form>
      </div>
    </>
  );
}
