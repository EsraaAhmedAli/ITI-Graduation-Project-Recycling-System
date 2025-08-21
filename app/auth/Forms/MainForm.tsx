"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { X } from "lucide-react";
import React, { Suspense, lazy, useMemo } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/LanguageContext";
import { RoleConfig } from "../common/RoleConfig";

// Lazy load heavy components
const RoleStepper = lazy(() => import("@/app/auth/common/RoleStepper"));
const LoginForm = lazy(() => import("./LoginForm"));
const RoleSelect = lazy(() => import("@/app/auth/common/RoleSelectionStep"));
const SignUpForm = lazy(() => import("./SignUpForm"));
const ForgetPasswordForm = lazy(() => import("./ForgotPasswordForm"));

// Loading fallback component
const FormSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
    <div className="h-10 bg-gray-200 rounded"></div>
    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const roleKeys = {
  customer: true,
  delivery: true,
  buyer: true,
  none: true,
} as const;

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
    setGoogleUser,
  } = useAuthenticationContext();
  const { t } = useLanguage();

  // Memoize roleConfig to prevent unnecessary recalculations
  const roleConfig = useMemo(() => RoleConfig(), []);

  const { handleSubmit, clearErrors, reset } = useFormContext();

  // Memoize resetForm to prevent recreation on every render
  const resetForm = useMemo(
    () => () => {
      resetState();
      reset();
      setStep(1);
      setSelectedRole("customer");
    },
    [resetState, reset, setStep, setSelectedRole]
  );

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };

  // Memoize onClose to prevent recreation
  const onClose = useMemo(
    () => () => {
      resetForm();
      handleClose();
      setGoogleUser(null);
      setMode("login");
    },
    [resetForm, handleClose, setGoogleUser, setMode]
  );

  const prevStep = useMemo(
    () => () => {
      if (step > 1) {
        setStep(step - 1);
      }
      if (step === 1) {
        const toMode = mode === "signup" ? "role-select" : "login";
        if (toMode === "login") {
          setGoogleUser(null);
          resetForm();
        }
        setMode(toMode);
        clearErrors();
      }
    },
    [step, mode, setStep, setGoogleUser, resetForm, setMode, clearErrors]
  );

  // Memoize header title calculation
  const headerTitle = useMemo(() => {
    switch (mode) {
      case "role-select":
        return t("auth.login.ChooseYourRole");
      case "login":
        return t("auth.login.signIn");
      case "forgot-password":
        return t("auth.login.forgotPassword");
      default:
        return selectedRole
          ? roleConfig[selectedRole]?.title
          : t("auth.login.signUp");
    }
  }, [mode, selectedRole, roleConfig, t]);

  // Render form content based on mode
  const renderFormContent = () => {
    switch (mode) {
      case "role-select":
        return (
          <Suspense fallback={<FormSkeleton />}>
            <RoleSelect prevStep={prevStep} />
          </Suspense>
        );
      case "login":
        return (
          <Suspense fallback={<FormSkeleton />}>
            <LoginForm />
          </Suspense>
        );
      case "signup":
        return selectedRole ? (
          <Suspense fallback={<FormSkeleton />}>
            <SignUpForm />
          </Suspense>
        ) : null;
      case "forgot-password":
        return (
          <Suspense fallback={<FormSkeleton />}>
            <ForgetPasswordForm />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
        <h3 className="text-xl font-semibold">{headerTitle}</h3>
        <button
          className="p-1 ms-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-end text-3xl leading-none font-semibold outline-none focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="relative p-6 flex-auto">
        {/* Show the stepper only for signup mode with selected role */}
        {mode === "signup" && selectedRole && (
          <Suspense
            fallback={
              <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
            }
          >
            <RoleStepper role={selectedRole} step={step} />
          </Suspense>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>{renderFormContent()}</form>
      </div>
    </>
  );
}
