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
  <div className="animate-pulse space-y-6">
    {/* Email field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Password field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Remember me checkbox */}
    <div className="flex items-center space-x-2">
      <div className="h-4 w-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>

    {/* Login button */}
    <div className="h-12 bg-gray-200 rounded-lg"></div>

    {/* Forgot password link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
    </div>

    {/* Divider */}
    <div className="flex items-center space-x-4">
      <div className="flex-1 h-px bg-gray-200"></div>
      <div className="h-4 bg-gray-200 rounded w-8"></div>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>

    {/* Google sign in button */}
    <div className="h-12 bg-gray-200 rounded-lg"></div>

    {/* Sign up link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
    </div>
  </div>
);

const SignUpFormSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Name fields (first name, last name) */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    {/* Email field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Phone field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Password field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Confirm password field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Terms and conditions checkbox */}
    <div className="flex items-start space-x-2">
      <div className="h-4 w-4 bg-gray-200 rounded mt-1"></div>
      <div className="space-y-1 flex-1">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    {/* Sign up button */}
    <div className="h-12 bg-gray-200 rounded-lg"></div>

    {/* Already have account link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
    </div>
  </div>
);

const ForgotPasswordFormSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Description text */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>

    {/* Email field */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>

    {/* Send reset link button */}
    <div className="h-12 bg-gray-200 rounded-lg"></div>

    {/* Back to login link */}
    <div className="text-center">
      <div className="h-4 bg-gray-200 rounded w-28 mx-auto"></div>
    </div>
  </div>
);

const RoleSelectSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Description text */}
    <div className="text-center space-y-2 mb-8">
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
    </div>

    {/* Role cards */}
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Continue button */}
    <div className="h-12 bg-gray-200 rounded-lg"></div>
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
