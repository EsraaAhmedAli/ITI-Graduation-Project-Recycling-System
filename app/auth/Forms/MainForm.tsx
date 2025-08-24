"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { X } from "lucide-react";
import React, { Suspense, lazy, useMemo } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/LanguageContext";
import { useRoleConfig } from "../common/RoleConfig";

// Lazy load heavy components
const RoleStepper = lazy(() => import("@/app/auth/common/RoleStepper"));
const LoginForm = lazy(() => import("./LoginForm"));
const RoleSelect = lazy(() => import("@/app/auth/common/RoleSelectionStep"));
const SignUpForm = lazy(() => import("./SignUpForm"));
const ForgetPasswordForm = lazy(() => import("./ForgotPasswordForm"));

// Form-specific loading skeletons
const LoginFormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      {/* Email field - matching FloatingInput structure */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Password field with icon - matching FloatingInput with eye icon */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
        {/* Eye icon placeholder */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>

    {/* Submit button - matching the actual button height and styling */}
    <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>

    {/* Forgot password link */}
    <div className="flex justify-end">
      <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
    </div>

    {/* Social buttons section - matching SocialButtons component */}
    <div className="space-y-4">
      {/* Divider */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-gray-200 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="flex-1 h-px bg-gray-200 animate-pulse"></div>
      </div>

      {/* Google sign in button */}
      <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>

    {/* Sign up link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
    </div>
  </div>
);

const SignUpFormSkeleton = () => (
  <div className="space-y-6">
    {/* BasicInfo fields - matching your actual step 1 */}
    <div className="space-y-4">
      {/* First Name & Last Name - grid layout like your actual form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="absolute top-2 left-3 h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="relative">
          <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="absolute top-2 left-3 h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Email field */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Phone field with country code selector */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-28 mb-1 animate-pulse"></div>
        <div className="flex">
          <div className="h-14 w-20 bg-gray-200 rounded-l-lg animate-pulse"></div>
          <div className="h-14 flex-1 bg-gray-200 rounded-r-lg animate-pulse"></div>
        </div>
      </div>

      {/* Password field with icon */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Confirm Password field with icon */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-32 bg-gray-300 rounded animate-pulse"></div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>

    {/* Terms checkbox - matching your actual terms section */}
    <div className="flex items-start space-x-3">
      <div className="h-5 w-5 bg-gray-200 rounded mt-1 animate-pulse"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>

    {/* Submit button */}
    <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>

    {/* Social divider - only show on step 1 */}
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gray-200 animate-pulse"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <div className="px-2 bg-white">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Social buttons */}
    <div className="space-y-3">
      <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>

    {/* Footer link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
    </div>
  </div>
);

const ForgotPasswordFormSkeleton = () => (
  <div className="space-y-6">
    {/* Role Stepper skeleton */}
    <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>

    {/* Step content - could be email input, OTP, or reset form */}
    <div className="space-y-4">
      {/* Main input field (email/OTP/password depending on step) */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Optional second field (for password reset step) */}
      <div className="relative">
        <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="absolute top-2 left-3 h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>

    {/* Action button */}
    <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>

    {/* Back link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-28 mx-auto animate-pulse"></div>
    </div>
  </div>
);

const RoleSelectSkeleton = () => (
  <ol className="flex items-center justify-center w-full mb-5">
    {/* Generate 2-4 step circles (average of different roles) */}
    {[1, 2, 3].map((idx) => {
      const isLast = idx === 3;
      return (
        <li
          key={idx}
          className={`flex items-center ${
            !isLast
              ? "w-full after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block after:ml-4 after:border-gray-200 animate-pulse"
              : ""
          }`}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 lg:h-12 lg:w-12 bg-gray-200 animate-pulse">
            <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-300 rounded animate-pulse"></div>
          </span>
        </li>
      );
    })}
  </ol>
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
  const roleConfig = useRoleConfig();

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

  // Get the appropriate skeleton based on mode
  const getSkeletonComponent = () => {
    switch (mode) {
      case "role-select":
        return <RoleSelectSkeleton />;
      case "login":
        return <LoginFormSkeleton />;
      case "signup":
        return <SignUpFormSkeleton />;
      case "forgot-password":
        return <ForgotPasswordFormSkeleton />;
      default:
        return <LoginFormSkeleton />;
    }
  };

  // Render form content based on mode
  const renderFormContent = () => {
    switch (mode) {
      case "role-select":
        return (
          <Suspense fallback={getSkeletonComponent()}>
            <RoleSelect prevStep={prevStep} />
          </Suspense>
        );
      case "login":
        return (
          <Suspense fallback={getSkeletonComponent()}>
            <LoginForm />
          </Suspense>
        );
      case "signup":
        return selectedRole ? (
          <Suspense fallback={getSkeletonComponent()}>
            <SignUpForm />
          </Suspense>
        ) : null;
      case "forgot-password":
        return (
          <Suspense fallback={getSkeletonComponent()}>
            <ForgetPasswordForm />
          </Suspense>
        );
      default:
        return null;
    }
  };

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
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="relative p-6 flex-auto">
        {/* Show the stepper only for signup mode with selected role */}
       {mode === "signup" && selectedRole && (
  <Suspense fallback={<RoleSelectSkeleton />}>
    <RoleStepper role={selectedRole} step={step} />
  </Suspense>
)}

        <form onSubmit={handleSubmit(onSubmit)}>{renderFormContent()}</form>
      </div>
    </>
  );
}
