// components/multi-step-registration/RegistrationForm.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { User } from "@/components/Types/Auser.type";
import { Controller } from "react-hook-form";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { FloatingInput } from "@/components/common/FlotingInput";
import OTPInput from "@/components/auth/OtpInput";
import { HiEye, HiEyeOff } from "react-icons/hi";
import PhoneInput from "@/components/auth/PhoneInput";
import { initiateSignup, verifyOtpAndRegister } from "@/lib/auth";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api, { setAccessToken } from "@/lib/axios";

// Define form steps
const STEPS = [
  { id: "role", title: "Select Role" },
  { id: "credentials", title: "Personal Information" },
  { id: "otp", title: "Verification Code" },
  { id: "profile", title: "Complete Profile" },
] as const;

// Role options
const ROLES = [
  {
    value: "customer",
    label: "Customer",
    description: "Regular shopping customer",
  },
  { value: "buyer", label: "Buyer", description: "Bulk purchasing user" },
  { value: "delivery", label: "Delivery", description: "Delivery personnel" },
  { value: "admin", label: "Admin", description: "System administrator" },
] as const;
type RegistrationFormData = User & {
  otp?: string;
  confirmPassword?: string;
};

const stepFields: Record<number, (keyof RegistrationFormData)[]> = {
  0: ["role"],
  1: ["name", "email", "password", "phoneNumber", "confirmPassword"],
  2: ["otp"], // e.g., OTP
  3: ["imgUrl"], // e.g., profile image
};
export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, setUser } = useUserAuth();
  const [stepValid, setStepValid] = useState(false);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors, isValid },
  } = useForm<RegistrationFormData>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      provider: "none",
      role: "customer",
      isGuest: false,
    },
    mode: "all",
  });
  const rawPhone = watch("phoneNumber") || "";
  const formattedPhone = rawPhone.startsWith("0") ? rawPhone : "0" + rawPhone;

  useEffect(() => {
    trigger(stepFields[currentStep - 1]).then(setStepValid);
  }, [currentStep, trigger]);
  const goToNextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const goToPreviousStep = () =>
    setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSendOtp = async () => {
    try {
      const res = await initiateSignup(watch("email"));

      if (res.status === 200) {
        setUser({ ...watch() });
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type and size (e.g., max 2MB)
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG formats are allowed.");
      return;
    }

    if (file.size > maxSizeInBytes) {
      setUploadError("Image size must be less than 2MB.");
      return;
    }

    setUploadError(null); // clear error
    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleStep2 = async () => {
    try {
      await handleSendOtp();
      goToNextStep();
    } catch (err: any) {
      toast.error("Failed to send OTP");
    }
  };
  const handleStep3 = async () => {
    try {
      const res = await verifyOtpAndRegister({
        name: watch("name") || "",
        email: watch("email") || "",
        password: watch("password") || "",
        phoneNumber: formattedPhone,
        otpCode: watch("otp") || "",
      });
      console.log(res);

      // Store token in localStorage (or cookies)
      // localStorage.setItem("token", res.token);

      // Optionally store user in global context
      setUser(res.user); // if using React Context
      setAccessToken(res.accessToken); // Store token in axios instance
      goToNextStep();
    } catch (err) {
      toast.error("OTP submission failed:");
    }
  };
  const handleStep4 = async () => {
    try {
      const formData = new FormData();
      formData.append("name", watch("name"));
      formData.append("phoneNumber", watch("phoneNumber"));

      if (selectedImageFile) {
        formData.append("image", selectedImageFile); // ✅ file goes here
      }

      const response = await api.put("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // axios will handle boundary
        },
      });

      console.log("✅ Profile updated:", response.data);
      setUser(response.data); // updated user with imgUrl
    } catch (error) {
      console.error("❌ Profile update failed:", error);
    }
  };

  const nextStep = () => {
    console.log(currentStep);
    if (currentStep === 1) {
      handleStep2();
    } else if (currentStep === 2) {
      handleStep3();
    } else {
      goToNextStep();
    }
  };

  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
      console.log("Final submitted data:", data);
      await handleStep4();
      router.push("/profile");
    } catch (error) {
      toast.error("error in customize prpfile");
    }
  };

  const prevStep = () => {
    goToPreviousStep();
  };

  const sendOtp = () => {
    // Simulate OTP sending
    setOtpSent(true);
    setTimeout(() => {
      setOtpVerified(true);
    }, 1500);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderRoleStep();
      case 1:
        return renderCredentialsStep();
      case 2:
        return renderOtpStep();
      case 3:
        return renderProfileStep();
      default:
        return null;
    }
  };

  const renderRoleStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Select Your Role</h3>
      <p className="text-gray-600">Please choose the role that best fits you</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map((role) => (
          <div
            key={role.value}
            onClick={() => setValue("role", role.value as any)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              watch("role") === role.value
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/30"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  watch("role") === role.value
                    ? "bg-primary text-white"
                    : "bg-gray-100"
                }`}
              >
                <UserIcon size={16} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{role.label}</h4>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {errors.role && (
        <p className="text-red-500 text-sm mt-2">
          {errors.role.message as string}
        </p>
      )}
    </div>
  );

  const renderCredentialsStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        Personal Information
      </h3>
      <p className="text-gray-600">
        Please provide your contact details and password
      </p>

      <div className="space-y-4">
        {/* Full Name */}
        <Controller
          name="name"
          control={control}
          rules={{
            required: "Full name is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
            maxLength: { value: 30, message: "Maximum 30 characters" },
          }}
          render={({ field }) => (
            <FloatingInput
              id="fullName"
              type="text"
              label="Full Name"
              value={field.value}
              maxLength={30}
              onChange={field.onChange}
              onBlur={field.onBlur}
              required
              error={errors.name?.message}
              color={
                errors.name ? "failure" : field.value ? "success" : undefined
              }
            />
          )}
        />

        {/* Phone Number */}
        <Controller
          name="phoneNumber"
          control={control}
          rules={{
            required: "Phone number is required",
            validate: (value) =>
              /^(10|11|12|15)[0-9]{8}$/.test(value) ||
              "Invalid Egyptian phone number",
          }}
          render={({ field }) => (
            <>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number
              </label>
              <PhoneInput
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </>
          )}
        />

        {/* Email */}
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            maxLength: { value: 30, message: "Maximum 30 characters" },
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          }}
          render={({ field }) => (
            <FloatingInput
              id="email"
              type="email"
              label="Email"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxLength={30}
              required
              error={errors.email?.message}
              color={
                errors.email ? "failure" : field.value ? "success" : undefined
              }
            />
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: { value: 8, message: "Min 8 characters" },
            maxLength: { value: 20, message: "Max 20 characters" },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
              message: "1 uppercase, 1 number, 1 symbol required",
            },
          }}
          render={({ field }) => (
            <FloatingInput
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maxLength={20}
              required
              error={errors.password?.message}
              color={
                errors.password
                  ? "failure"
                  : field.value
                  ? "success"
                  : undefined
              }
              icon={
                showPassword ? (
                  <HiEyeOff
                    className="w-5 h-5 text-primary cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(false);
                    }}
                  />
                ) : (
                  <HiEye
                    className="w-5 h-5 text-primary cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(true);
                    }}
                  />
                )
              }
            />
          )}
        />

        {/* Confirm Password */}
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Confirm password is required",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          }}
          render={({ field }) => (
            <FloatingInput
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              onPaste={(e) => e.preventDefault()}
              maxLength={20}
              required
              error={errors.confirmPassword?.message}
              color={
                errors.confirmPassword
                  ? "failure"
                  : field.value
                  ? "success"
                  : undefined
              }
              icon={
                showConfirmPassword ? (
                  <HiEyeOff
                    className="w-5 h-5 text-primary cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(false);
                    }}
                  />
                ) : (
                  <HiEye
                    className="w-5 h-5 text-primary cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(true);
                    }}
                  />
                )
              }
            />
          )}
        />
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <Controller
      name="otp" // not in User type, but allowed dynamically
      control={control}
      rules={{
        required: "OTP is required",
        validate: (val) =>
          /^\d{6}$/.test(val) || "OTP must be a 6-digit number",
      }}
      render={({ field, fieldState }) => (
        <OTPInput
          name={field.name}
          value={field.value || ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">
        Complete Your Profile
      </h3>
      <p className="text-gray-600">
        Upload a profile picture and complete your information
      </p>

      <div className="space-y-4">
        {/* Profile Picture Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            {/* Image Preview */}
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={24} className="text-gray-400" />
              )}
            </div>

            {/* File Upload Button */}
            <div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors inline-block">
                <span className="flex items-center space-x-2">
                  <Upload size={16} />
                  <span>Choose Image</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG formats, max 2MB
              </p>
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle size={16} className="text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">
                Registration Information
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>
                  • Role: {ROLES.find((r) => r.value === watch("role"))?.label}
                </li>
                <li>• Full Name: {watch("name")}</li>
                <li>• Email: {watch("email")}</li>
                <li>• Phone: [+20] {watch("phoneNumber")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Step Indicator */}
      <div className="bg-gradient-to-r from-primary to-green-500 p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Create Account
        </h2>

        <div className="relative w-full max-w-xl mx-auto flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="relative flex flex-col items-center w-1/4"
            >
              {/* Circle + line wrapper */}
              <div className="relative flex items-center justify-center w-10 h-10">
                {/* Step circle */}
                <div
                  className={`z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStep
                      ? "bg-white text-primary"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {index < currentStep ? <Check size={16} /> : index + 1}
                </div>

                {/* Line to next step */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-1/2 left-full h-1 ${
                      index < currentStep ? "bg-white" : "bg-white/30"
                    }`}
                    style={{
                      width: "calc(100% + 4rem)", // small gap between circles
                      transform: "translateY(-50%)",
                      zIndex: 0,
                    }}
                  />
                )}
              </div>

              {/* Step title */}
              <span className="mt-2 text-sm text-white text-center">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {(currentStep === 1 || currentStep === 2) && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
            )}

            <div className="flex-1"></div>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!stepValid}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                  isValid
                    ? "bg-primary hover:bg-green-700 cursor-pointer text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-green-700 cursor-pointer text-white rounded-lg transition-colors"
              >
                <span>Complete Registration</span>
                <Check size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
