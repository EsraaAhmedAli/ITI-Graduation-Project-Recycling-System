"use client";

import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { FloatingInput } from "@/components/common/FlotingInput";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import SmartNavigation from "./SmartNavigation";
import toast from "react-hot-toast";
import { initiateSignup, registerUser } from "@/lib/auth";
import { useLanguage } from "@/context/LanguageContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";

export default function BasicInfo() {
  const {
    register,
    watch,
    formState: { errors },
    getValues,
    trigger,
    clearErrors,
    reset,
  } = useFormContext();

  const password = watch("password");
  const {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    setStep,
    step,
    setMode,
    GoogleUser,
    setGoogleUser,
    selectedRole,
  } = useAuthenticationContext();
  const { t } = useLanguage();
  const { setUser, setToken } = useUserAuth();
  const router = useRouter();
  const nextStep = async () => {
    const fields = GoogleUser
      ? ["phoneNumber"]
      : ["name", "email", "phoneNumber", "password", "confirmPassword"];
    const isValid = await trigger(fields);

    if (!isValid) {
      toast.error("Please fill all required fields.");
      return;
    }

    const email = getValues("email");

    try {
      await initiateSignup(email);
      setStep(step + 1);
      toast.success("The OTP has been sent");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const prevStep = () => {
    setMode("role-select");
    clearErrors();
  };
  const createUser = async () => {
    const values = getValues();
    try {
      const res = await registerUser({
        name: GoogleUser?.name || values.name,
        email: GoogleUser?.email || values.email,
        provider: GoogleUser?.provider,
        imgUrl: GoogleUser?.image,
        password: values.password,
        phoneNumber: values.phoneNumber,
        role: selectedRole,
        attachments: {},
        idToken: values.idToken,
      });

      toast.success(t("auth.register.success"));
      setUser(res.user);
      setToken(res.accessToken);
      router.replace("/");
    } catch (error) {
      toast.error(t("auth.register.fail"));
    }
  };

  return (
    <>
      {!GoogleUser?.email ? (
        <div className="space-y-4">
          {/* Full Name */}
          <FloatingInput
            id="name"
            label={t("auth.register.fullName")}
            type="text"
            {...register("name", {
              required: t("auth.errors.required.fullName"),
            })}
            error={errors.name?.message as string} // 👈 cast
            maxLength={20}
          />

          {/* Email */}
          <FloatingInput
            id="email"
            label={t("auth.login.email")}
            type="email"
            {...register("email", {
              required: t("auth.errors.required.email"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("auth.errors.invalid.email"),
              },
            })}
            error={errors.email?.message as string}
            maxLength={30}
          />

          {/* Phone Number */}
          <FloatingInput
            id="phoneNumber"
            label={t("auth.register.phoneNumber")}
            type="tel"
            {...register("phoneNumber", {
              required: t("auth.errors.required.phoneNumber"),
              pattern: {
                value:
                  /^((01[0125][0-9]{8})|(0(2|3|4[04578]|5[057]|6[245689]|8[24569]|9[2356])[0-9]{7}))$/,
                message: t("auth.errors.invalid.phoneNumber"),
              },
            })}
            error={errors.phoneNumber?.message as string}
            maxLength={11}
          />

          {/* Password */}
          <FloatingInput
            id="password"
            label={t("auth.login.password")}
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: t("auth.errors.required.password"),
              pattern: {
                value:
                  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
                message: t("auth.errors.password.pattern"),
              },
            })}
            error={errors.password?.message as string}
            icon={
              showPassword ? (
                <EyeOff
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowPassword(true)}
                />
              )
            }
            maxLength={20}
          />

          {/* Confirm Password */}
          <FloatingInput
            id="confirmPassword"
            label={t("auth.register.confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              required: t("auth.errors.required.confirmPassword"),
              validate: (value) =>
                value === password ||
                (t("auth.errors.password.mismatch") as string),
            })}
            error={errors.confirmPassword?.message as string}
            icon={
              showConfirmPassword ? (
                <EyeOff
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <Eye
                  className="w-5 h-5 text-[var(--color-primary)]"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )
            }
            maxLength={20}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Phone Number */}
          <FloatingInput
            id="phoneNumber"
            label={t("auth.register.phoneNumber")}
            type="tel"
            {...register("phoneNumber", {
              required: t("auth.errors.required.phoneNumber"),
              pattern: {
                value:
                  /^((01[0125][0-9]{8})|(0(2|3|4[04578]|5[057]|6[245689]|8[24569]|9[2356])[0-9]{7}))$/,
                message: t("auth.errors.invalid.phoneNumber"),
              },
            })}
            error={errors.phoneNumber?.message as string}
            maxLength={11}
          />
        </div>
      )}
      <SmartNavigation
        nextStep={nextStep}
        onSubmit={createUser}
        prevStep={prevStep}
      />
    </>
  );
}
