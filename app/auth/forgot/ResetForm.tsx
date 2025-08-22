"use client";

import { FloatingInput } from "@/components/common/FlotingInput";
import Button from "@/components/common/Button";
import { resetPassword } from "@/lib/auth";
import { useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

export default function ResetPasswordForm() {
  const {
    register,
    watch,
    formState: { errors, isValid },
    getValues,
    handleSubmit,
    trigger,
  } = useFormContext();

  const { t } = useLanguage();
  const {
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    setMode,
  } = useAuthenticationContext();

  const [loading, setLoading] = useState(false);

  const password = watch("password");
  // const confirmPassword = watch("confirmPassword");

  const onSubmit = async () => {
    const { email, otp, password } = getValues();
    const otpValue = (otp || []).join("");

    try {
      setLoading(true);

      await resetPassword({
        email,
        otpCode: otpValue,
        newPassword: password,
      });
      setMode("login");
      toast.success(t("auth.login.resetSuccess"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <h2 className="text-2xl font-bold text-center text-green-800">
        {t("auth.login.reset")}
      </h2>

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
              className="w-5 h-5 text-[var(--color-primary)] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              className="w-5 h-5 text-[var(--color-primary)] cursor-pointer"
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
              className="w-5 h-5 text-[var(--color-primary)] cursor-pointer"
              onClick={() => setShowConfirmPassword(false)}
            />
          ) : (
            <Eye
              className="w-5 h-5 text-[var(--color-primary)] cursor-pointer"
              onClick={() => setShowConfirmPassword(true)}
            />
          )
        }
        maxLength={20}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        onClick={handleSubmit(onSubmit)}
        loading={loading}
        disabled={!!errors.password || !!errors.confirmPassword || loading}
        className="bg-primary text-base-100 w-full p-2 rounded-lg hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("auth.login.wait") : t("auth.login.reset")}
      </Button>
    </div>
  );
}
