"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Wrapper from "@/components/auth/Wrapper";
import { FloatingInput } from "@/components/common/FlotingInput";
import Button from "@/components/common/Button";
import { forgotPassword } from "@/lib/auth";
import { toast } from "react-hot-toast";
import { useUserAuth } from "@/context/AuthFormContext";

export default function ForgetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const trimmed = email.trim();
    if (trimmed === "") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setUser({ ...user!, email });
      toast.success("OTP sent! Check your email to continue.");
      router.push(`/auth/otp?from=forgot`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <h2 className="text-2xl font-bold text-center text-green-800 mb-1">
        Forgot your password?
      </h2>
      <p className="text-center text-gray-600 mb-4">
        Enter your email to receive a reset code.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingInput
          id="email"
          type="email"
          label="Email"
          value={email}
          maxLength={30}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="bg-primary text-base-100 m-auto p-2 w-full rounded-lg hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-400">
        Don’t worry, your information is 100% secure.
      </div>
    </Wrapper>
  );
}
