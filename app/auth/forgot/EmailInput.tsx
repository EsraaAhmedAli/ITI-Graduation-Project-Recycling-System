"use client";
import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/context/LanguageContext";
import { FloatingInput } from "@/components/common/FlotingInput";
import Button from "@/components/common/Button";
import { useState } from "react";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { forgotPassword } from "@/lib/auth"; // your API call
import { toast } from "react-hot-toast";

const EmailInput = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
    reset,
  } = useFormContext();

  const { t } = useLanguage();
  const { step, setStep, setMode } = useAuthenticationContext();
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    const email = getValues("email");
    setLoading(true);

    try {
      // call your API
      await forgotPassword(email);

      // success
      toast.success(t("auth.otp.submission_success"));
      setStep(step + 1); // move to OTP step
    } catch (err: any) {
      toast.error(t("auth.otp.submission_failed"));
    } finally {
      setLoading(false);
    }
  };

  const email = watch("email"); // 👈 reactive
  const isDisabled = !email || !!errors.email || !isValid;
  const handlePerv = () => {
    reset();
    setMode("login");
  };

  return (
    <>
      <p className="text-center text-gray-600 mb-4">
        {t("auth.login.forgotResetMsg")}
      </p>

      <FloatingInput
        id="email"
        label={t("auth.login.email")}
        type="email"
        error={errors.email?.message as string}
        {...register("email", {
          required: t("auth.login.emailrequired"),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t("auth.login.emailError"),
          },
        })}
      />

      <Button
        onClick={handleSubmit(handleEmailSubmit)}
        loading={loading}
        disabled={isDisabled}
        className="bg-green-600 w-full rounded-lg mt-5 p-2 hover:bg-secondary"
      >
        {loading ? t("auth.login.sendingReset") : t("auth.login.sendReset")}
      </Button>

      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={handlePerv}
          className="text-sm text-primary hover:underline transition-colors duration-200"
        >
          {t("auth.login.back")}
        </button>
      </div>
    </>
  );
};

export default EmailInput;
