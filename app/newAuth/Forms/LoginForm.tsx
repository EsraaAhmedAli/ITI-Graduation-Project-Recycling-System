"use client";

import { FloatingInput } from "@/components/common/FlotingInput";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";
import SocialButtons from "../common/socialSection";
import { useUserAuth } from "@/context/AuthFormContext";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useFormContext();
  const router = useRouter();
  const { t } = useLanguage();
  const { showPassword, setShowPassword, setLoading, loading, setMode } =
    useAuthenticationContext();
  const { setToken, setUser } = useUserAuth();

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { email, password } = getValues();
      const res = await loginUser({ email, password }); // Expects { email, password }
      setUser(res.user);
      setToken(res.accessToken);
      router.push("/");
    } catch (err) {
      toast.error(t("auth.login.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignUp = () => {
    setMode("role-select");
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Email */}
        <FloatingInput
          id="email"
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            maxLength: {
              value: 30,
              message: "Email must be at most 30 characters",
            },
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
          maxLength={30}
        />

        {/* Password */}
        <FloatingInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          {...register("password", {
            required: "Password is required",
            pattern: {
              value:
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
              message: "8–20 chars, 1 uppercase, 1 number, 1 special character",
            },
          })}
          maxLength={20}
          error={errors.password?.message}
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
        />
      </div>
      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        onClick={handleSubmit(onSubmit)}
        className="inline-flex items-center justify-center w-full p-2 rounded-lg text-white bg-primary hover:bg-secondary font-medium text-sm text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <svg
            aria-hidden="true"
            role="status"
            className="inline w-4 h-4 me-2 animate-spin"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
        )}
        {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
      </button>

      {/* Social */}
      <SocialButtons />
      {/* Switch Mode */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={navigateToSignUp}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
