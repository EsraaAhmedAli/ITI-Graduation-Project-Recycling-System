// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { FloatingInput } from "@/components/common/FlotingInput";
// import Button from "@/components/common/Button";
// import { forgotPassword, verifyOtp, resetPassword } from "@/lib/auth";
// import { toast } from "react-toastify";
// import { useUserAuth } from "@/context/AuthFormContext";
// import { useAuthenticationContext } from "@/context/AuhenticationContext";
// import { useLanguage } from "@/context/LanguageContext";
// import { useFormContext } from "react-hook-form";
// import OTPInput from "@/app/newAuth/common/OtpStep";

// export default function ForgetPasswordForm() {
//   const [loading, setLoading] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const { user, setUser } = useUserAuth();
//   const { step, setStep, setMode } = useAuthenticationContext();
//   const router = useRouter();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useFormContext();
//   const { t } = useLanguage();

//   /** Step 1: Send Reset OTP */
//   const handleEmailSubmit = async (data: any) => {
//     setLoading(true);
//     try {
//       // await forgotPassword(data.email);
//       // setUser({ ...user!, email: data.email });
//       toast.success("OTP sent! Check your email.");
//       setStep(2);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Failed to send OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** Step 2: Verify OTP */
//   const handleOtpSubmit = async () => {
//     setLoading(true);
//     try {
//       // await verifyOtp({ email: user?.email, otp });
//       toast.success("OTP verified!");
//       setStep(3);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Invalid OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** Step 3: Reset Password */
//   const handleResetPassword = async () => {
//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
//     setLoading(true);
//     try {
//       // await resetPassword({ email: user?.email, newPassword });
//       toast.success("Password reset successfully. Please login.");
//       setMode("login");
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Failed to reset password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {step === 1 && (
//         <>
//           <p className="text-center text-gray-600 mb-4">
//             {t("auth.login.forgotResetMsg")}
//           </p>
//           <FloatingInput
//             id="email"
//             label={t("auth.login.email")}
//             type="email"
//             error={errors.email?.message as string}
//             {...register("email", {
//               required: t("auth.login.emailrequired"),
//               pattern: {
//                 value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                 message: t("auth.login.emailError"),
//               },
//             })}
//           />
//           <Button
//             onClick={handleSubmit(handleEmailSubmit)}
//             loading={loading}
//             className="bg-primary w-full rounded-lg mt-5"
//           >
//             {loading ? t("auth.login.sendingReset") : t("auth.login.sendReset")}
//           </Button>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <p className="text-center text-gray-600 mb-4">Enter OTP</p>
//           <OTPInput value={otp} onChange={setOtp} />
//           <Button
//             onClick={handleOtpSubmit}
//             loading={loading}
//             className="bg-primary w-full rounded-lg mt-5"
//           >
//             Verify OTP
//           </Button>
//         </>
//       )}

//       {step === 3 && (
//         <>
//           <FloatingInput
//             id="newPassword"
//             label="New Password"
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//           />
//           <FloatingInput
//             id="confirmPassword"
//             label="Confirm Password"
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//           />
//           <Button
//             onClick={handleResetPassword}
//             loading={loading}
//             className="bg-primary w-full rounded-lg mt-5"
//           >
//             Reset Password
//           </Button>
//         </>
//       )}
//     </div>
//   );
// }

import { useAuthenticationContext } from "@/context/AuhenticationContext";
import RoleStepperWithIcons from "../common/RoleStepper";
import OTPInput from "../common/OtpStep";
import EmailInput from "../forgot/EmailInput";
export default function ForgetPasswordForm() {
  const { step, selectedRole } = useAuthenticationContext();

  return (
    <>
      {/* Stepper (role is only used in signup mode, ignored in forgot) */}
      <RoleStepperWithIcons step={step} role={selectedRole} />
      {step === 1 && <EmailInput />}
      {step === 2 && <OTPInput comeFrom="forgot" />}
      {step === 3 && <EmailInput />}
    </>
  );
}
