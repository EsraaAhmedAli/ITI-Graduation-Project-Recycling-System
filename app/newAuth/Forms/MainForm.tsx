"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

import { X, User, Truck, ShoppingCart, Shield } from "lucide-react";
import RoleStepper from "@/app/newAuth/common/RoleStepper";
import React from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import LoginForm from "./LoginForm";
import RoleSelect from "@/app/newAuth/common/RoleSelectionStep";
import SignUpForm from "./SignUpForm";
import CompleteSignup from "../common/CompleteSignUp";
import ForgetPasswordForm from "./ForgotPasswordForm";
export const roleConfig = {
  customer: {
    title: "Customer Registration",
    description: "Join our recycling community",
    icon: <User className="w-6 h-6" />,
    color: "bg-green-500",
    steps: 3,
  },
  delivery: {
    title: "Delivery Partner Registration",
    description: "Become a verified delivery partner",
    icon: <Truck className="w-6 h-6" />,
    color: "bg-blue-500",
    steps: 4,
  },
  buyer: {
    title: "Business Buyer Registration",
    description: "Register your business to purchase recycled materials",
    icon: <ShoppingCart className="w-6 h-6" />,
    color: "bg-purple-500",
    steps: 4,
  },
  // admin: {
  //   title: "Admin Registration",
  //   description: "Administrative access registration",
  //   icon: <Shield className="w-6 h-6" />,
  //   color: "bg-red-500",
  //   steps: 3,
  // },
};

export type Role = keyof typeof roleConfig;

export default function MainForm() {
  const {
    mode,
    setMode,
    selectedRole,
    setSelectedRole,
    step,
    setStep,
    loading,
    handleClose,
    resetState,
  } = useAuthenticationContext();

  const { handleSubmit, getValues, trigger } = useFormContext();

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

  const nextStep = () => {
    if (step < roleConfig[selectedRole]?.steps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
    if (step == 1) {
      const toMode = mode === "signup" ? "role-select" : "login";
      setMode(toMode);
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
            ? "Choose Your Role"
            : mode === "login"
            ? "Sign In"
            : mode === "forgot-password"
            ? "Forgot Password"
            : selectedRole
            ? roleConfig[selectedRole]?.title
            : "Sign Up"}
        </h3>
        <button
          className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
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
          {mode === "role-select" && (
            <RoleSelect roleConfig={roleConfig} prevStep={prevStep} />
          )}
          {/* {mode === "complete-signup" && <CompleteSignup />} */}

          {mode === "login" && <LoginForm />}
          {mode === "signup" && selectedRole && <SignUpForm />}
          {mode === "forgot-password" && <ForgetPasswordForm />}
        </form>
      </div>
    </>
  );
}
