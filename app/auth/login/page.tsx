// pages/auth/login.tsx
"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { FloatingInput } from "@/components/common/FlotingInput";
import Wrapper from "@/components/auth/Wrapper";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { setAccessToken } from "@/lib/axios";
import { useUserAuth } from "@/context/AuthFormContext";
import Link from "next/link";
import { toast } from "react-toastify";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage(): React.JSX.Element {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { setUser, setToken } = useUserAuth();
  const router = useRouter();
const{t}=useLanguage()
  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const validatePassword = (password: string): boolean => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
      password.trim()
    );
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? "" : "Invalid email",
      }));
    }
    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value) ? "" : "Weak password",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(form.email) || !validatePassword(form.password)) return;

    setIsValid(true);
    try {
      const res = await loginUser(form);
      setUser(res.user);
      setToken(res.accessToken);
      setAccessToken(res.accessToken);
      router.push("/");
    } catch (err) {
      toast.error(t("auth.login.loginFailed")); // translated error
    } finally {
      setIsValid(false);
    }
  };

  return (
    <Wrapper>
      <h2 className="text-2xl font-bold text-center text-green-800 mb-1">
        {t("auth.login.title")}
      </h2>
      <p className="text-center text-gray-600 mb-4">{t("auth.login.subtitle")}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingInput
          id="email"
          type="email"
          label={t("auth.login.email")}
          value={form.email}
          maxLength={30}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          color={errors.email ? "failure" : form.email ? "success" : undefined}
          helperText={errors.email ? t("auth.login.emailError") : undefined}
        />

        <FloatingInput
          id="password"
          type={showPassword ? "text" : "password"}
          label={t("auth.login.password")}
          value={form.password}
          maxLength={20}
          onChange={(e) => handleChange("password", e.target.value)}
          required
          color={
            errors.password ? "failure" : form.password ? "success" : undefined
          }
          helperText={
                   errors.password ? t("auth.login.passwordError") : undefined

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

        <Button
          type="submit"
          loading={isValid}
          disabled={isValid}
          className="bg-primary text-white m-auto p-2 w-full rounded-lg hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValid ? t("auth.login.signingIn") : t("auth.login.signIn")}
        </Button>
      </form>

      <Link
        href="/auth/forget-password"
        className="text-sm text-center flex flex-row justify-end ms-auto mt-5 text-blue-600 hover:underline cursor-pointer"
      >
        {t("auth.login.forgotPassword")}
      </Link>

      <div className="mt-6 text-center text-xs text-gray-400">
        {t("auth.login.securityNote")}
      </div>
    </Wrapper>
  );
}
