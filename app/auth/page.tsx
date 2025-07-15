"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import { FloatingInput } from "@/components/common/FlotingInput";
import Wrapper from "@/components/auth/Wrapper";
import { HiEye, HiEyeOff } from "react-icons/hi";
import PhoneInput from "@/components/auth/PhoneInput";
import { useRouter } from "next/navigation";
import { forgotPassword, initiateSignup, loginUser } from "@/lib/auth";
import { useUserAuth } from "@/context/AuthFormContext";

const FormInitialState = {
  fullName: "",
  phoneNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const errorInitialState = {
  email: "",
  password: "",
  confirmPassword: "",
};
export default function AuthForm(): React.JSX.Element {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [form, setForm] = useState(FormInitialState);
  const { setUser } = useUserAuth();

  const [errors, setErrors] = useState(errorInitialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim();
    if (trimmed === "") return true; // Allow empty input
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const validatePassword = (password: string): boolean => {
    const trimmed = password.trim();
    if (trimmed === "") return true; // Allow empty input
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
      trimmed
    );
  };
  const validate = (field: string, value: string) => {
    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? "" : "Invalid email",
      }));
    }

    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value) ? "" : "Password too weak",
        confirmPassword:
          form.confirmPassword && value !== form.confirmPassword
            ? "Passwords do not match"
            : "",
      }));
    }

    if (field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== form.password ? "Passwords do not match" : "",
      }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validate(field, value);
  };

  const handleBlur = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validate(field, value);
  };

  const handleLogin = () => {
    setMode("login");
    setForm(FormInitialState);
    setErrors(errorInitialState);
  };
  const handleSignup = () => {
    setMode("signup");
    setForm(FormInitialState);
    setErrors(errorInitialState);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form);
    if (mode === "signup") {
      if (
        !form.fullName ||
        !form.phoneNumber ||
        !validateEmail(form.email) ||
        !validatePassword(form.password) ||
        form.password !== form.confirmPassword
      ) {
        console.log("Please fill all fields correctly");
        return;
      }
      // Handle signup logic here
      console.log("Signing up with:", form);
      setIsValid(true);
      await handleSendOtp();
    } else {
      if (!validateEmail(form.email) || !validatePassword(form.password)) {
        alert("Please fill all fields correctly");
        return;
      }
      // Handle login logic here
      console.log("Logging in with:", form);
      await handleLoginUser();
    }
  };

  const handleLoginUser = async (): Promise<void> => {
    try {
      const res = await loginUser({
        email: form.email,
        password: form.password,
      });

      setUser(res.user);
      localStorage.setItem("token", res.token);
      console.log("Login successful:", res.user);
      console.log("Token:", res.token);
      router.push("/user/dashboard");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };
  const handleForgotPassword = async () => {
    try {
      if (!form.email) {
        alert("Please enter your email first.");
        return;
      }

      await forgotPassword(form.email); // ✅ Send OTP
      setUser({
        ...form,
        email: form.email,
      });
      router.push(`/auth/otp?from=forgot`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await initiateSignup(form.email);

      if (res.status === 200) {
        setUser({ ...form, isAuthenticated: true });
        router.push("/auth/otp?from=signup");
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Wrapper>
      <h2 className="text-2xl font-bold text-center text-green-800 mb-1">
        Let’s get started
      </h2>
      <p className="text-center text-gray-600 mb-4">
        Sign up to swap and recycle for free!
      </p>

      {/* Tabs */}
      <div className="flex justify-center mb-6 border-b border-gray-300 text-sm">
        <Button
          className={`pb-2 px-4 font-medium ${
            mode === "login"
              ? "text-green-800 border-b-2 border-green-600"
              : "text-gray-500"
          }`}
          onClick={handleLogin}
        >
          Log in
        </Button>
        <Button
          className={`pb-2 px-4 font-medium ${
            mode === "signup"
              ? "text-green-800 border-b-2 border-green-600"
              : "text-gray-500"
          }`}
          onClick={handleSignup}
        >
          Sign up
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "signup" && (
          <FloatingInput
            id="fullName"
            type="text"
            label="Full name"
            value={form.fullName}
            maxLength={30}
            onChange={(e) => handleChange("fullName", e.target.value)}
            onBlur={(e) => handleBlur("fullName", e.target.value)}
            required
          />
        )}

        {mode === "signup" && (
          <PhoneInput
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
            }
          ></PhoneInput>
        )}

        <FloatingInput
          id="email"
          type="email"
          label="Email"
          value={form.email}
          maxLength={30}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={(e) => handleBlur("email", e.target.value)}
          required
          color={errors.email ? "failure" : form.email ? "success" : undefined}
          helperText={
            errors.email
              ? "email must has @ and .com 15-30 characters"
              : undefined
          }
        />

        <FloatingInput
          id="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          value={form.password}
          maxLength={20}
          onChange={(e) => handleChange("password", e.target.value)}
          onBlur={(e) => handleBlur("password", e.target.value)}
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

        {mode === "signup" && (
          <FloatingInput
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm password"
            value={form.confirmPassword}
            maxLength={20}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onPaste={(e) => e.preventDefault()} // 🚫 prevent paste
            onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
            required
            color={
              errors.confirmPassword
                ? "failure"
                : form.confirmPassword
                ? "success"
                : undefined
            }
            helperText={
              errors.confirmPassword ? "Password Not Match" : undefined
            }
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
        )}

        <Button
          type="submit"
          loading={isValid}
          className="bg-primary text-base-100 m-auto p-2 w-full rounded-lg hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValid
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Sign up to get started"}
        </Button>
      </form>
      {mode === "login" && (
        <Button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot your password?
        </Button>
      )}

      <div className="mt-6 text-center text-xs text-gray-400">
        Don’t worry, your information is 100% secure.
      </div>
    </Wrapper>
  );
}
