"use client";

import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { FloatingInput } from "@/components/common/FlotingInput";
import Wrapper from "@/components/auth/Wrapper";
import Button from "@/components/common/Button";
import { resetPassword } from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { useUserAuth } from "@/context/AuthFormContext";
import { toast } from "react-toastify";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { user } = useUserAuth();
  console.log("user in reset password form", user);
  console.log(searchParams.get("otp"));

  const [form, setForm] = useState({
    email: user?.email || "",
    otpCode: searchParams.get("otp"),
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validatePassword = (password: string): boolean =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
      password.trim()
    );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value) ? "" : "Password too weak",
        confirmPassword:
          value !== form.confirmPassword ? "Passwords do not match" : "",
      }));
    } else if (field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== form.password ? "Passwords do not match" : "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (
    //   !form.email ||
    //   !form.otpCode ||
    //   errors.password ||
    //   errors.confirmPassword
    // ) {
    //   alert("Please fix the form before submitting");
    //   return;
    // }

    try {
      setLoading(true);
      await resetPassword({
        email: form.email,
        otpCode: form.otpCode || "",
        newPassword: form.password,
      });
      toast.success("Password reset successful");
      router.push("/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <h2 className="text-2xl  font-bold text-center text-green-800 mb-10">
        Reset Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingInput
          id="password"
          type={showPassword ? "text" : "password"}
          label="New Password"
          value={form.password}
          maxLength={20}
          onChange={(e) => handleChange("password", e.target.value)}
          required
          color={
            errors.password ? "failure" : form.password ? "success" : undefined
          }
          helperText={
            errors.password
              ? "8–20 characters, 1 uppercase, 1 number, 1 symbol"
              : undefined
          }
          icon={
            showPassword ? (
              <HiEyeOff
                className="w-5 h-5 text-primary cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <HiEye
                className="w-5 h-5 text-primary cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )
          }
        />

        <FloatingInput
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          value={form.confirmPassword}
          maxLength={20}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          onPaste={(e) => e.preventDefault()}
          required
          color={
            errors.confirmPassword
              ? "failure"
              : form.confirmPassword
              ? "success"
              : undefined
          }
          helperText={errors.confirmPassword ? "Password Not Match" : undefined}
          icon={
            showConfirmPassword ? (
              <HiEyeOff
                className="w-5 h-5 text-primary cursor-pointer"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <HiEye
                className="w-5 h-5 text-primary cursor-pointer"
                onClick={() => setShowConfirmPassword(true)}
              />
            )
          }
        />

        <Button
          type="submit"
          loading={loading}
          className="bg-primary text-base-100 m-auto p-2 w-full rounded-lg hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : "Reset Password"}
        </Button>
      </form>
    </Wrapper>
  );
}
