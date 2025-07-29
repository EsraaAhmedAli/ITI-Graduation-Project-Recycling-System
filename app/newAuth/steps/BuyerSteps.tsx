"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { registerUser } from "@/lib/auth";
import { Label, TextInput, Select, Textarea } from "flowbite-react";
import { Building, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

export default function BuyerSteps() {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();
  const { step } = useAuthenticationContext();

  const { setUser, setToken } = useUserAuth();
  const router = useRouter();

  const onSubmit = async () => {
    const data = getValues();
    const name = data["name"];
    const email = data["email"];
    const password = data["password"];
    const phoneNumber = data["phoneNumber"];
    const role = data["role"];
    const address = data["address"];
    console.log(data);

    try {
      const res = await registerUser({
        name,
        email,
        password,
        phoneNumber,
        role,
        attachments: address,
      });
      toast.success("user Registerd Successfully");

      setUser(res.user);
      setToken(res.accessToken);
      router.replace("/");
    } catch {
      toast.error("SomeThing Went Wrong");
    }
  };

  return (
    <>
      {/* Step 2: Business Info */}
      {step === 2 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Business Information
          </h4>

          {/* Business Name */}
          <div>
            <Label htmlFor="businessName" value="Business Name" />
            <TextInput
              id="businessName"
              {...register("businessName", {
                required: "Business name is required",
              })}
              placeholder="Your business name"
              color={errors.businessName ? "failure" : "gray"}
              aria-invalid={!!errors.businessName}
            />
            {errors.businessName && (
              <span className="text-red-600 text-xs">
                {errors.businessName.message as string}
              </span>
            )}
          </div>

          {/* Business Type */}
          <div>
            <Label htmlFor="businessType" value="Business Type" />
            <Select
              id="businessType"
              {...register("businessType", {
                required: "Business type is required",
              })}
              color={errors.businessType ? "failure" : "gray"}
              aria-invalid={!!errors.businessType}
            >
              <option value="">Select business type</option>
              <option value="recycling-plant">Recycling Plant</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="waste-management">Waste Management</option>
              <option value="export">Export Business</option>
              <option value="other">Other</option>
            </Select>
            {errors.businessType && (
              <span className="text-red-600 text-xs">
                {errors.businessType.message as string}
              </span>
            )}
          </div>

          {/* Business Address */}
          <div>
            <Label htmlFor="businessAddress" value="Business Address" />
            <Textarea
              id="businessAddress"
              rows={3}
              placeholder="Complete business address"
              {...register("businessAddress", {
                required: "Business address is required",
              })}
              color={errors.businessAddress ? "failure" : "gray"}
              aria-invalid={!!errors.businessAddress}
            />
            {errors.businessAddress && (
              <span className="text-red-600 text-xs">
                {errors.businessAddress.message as string}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Legal & Financial */}
      {step === 3 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Legal & Financial Information
          </h4>

          {/* License Number */}
          <div>
            <Label htmlFor="businessLicense">Business License Number</Label>
            <TextInput
              id="businessLicense"
              {...register("businessLicense", {
                required: "Business license number is required",
              })}
              placeholder="Business license number"
              color={errors.businessLicense ? "failure" : "gray"}
              aria-invalid={!!errors.businessLicense}
            />
            {errors.businessLicense && (
              <span className="text-red-600 text-xs">
                {errors.businessLicense.message as string}
              </span>
            )}
          </div>

          {/* Tax ID */}
          <div>
            <Label htmlFor="taxId">Tax ID / EIN</Label>
            <TextInput
              id="taxId"
              {...register("taxId", {
                required: "Tax ID is required",
              })}
              placeholder="Tax identification number"
              color={errors.taxId ? "failure" : "gray"}
              aria-invalid={!!errors.taxId}
            />
            {errors.taxId && (
              <span className="text-red-600 text-xs">
                {errors.taxId.message as string}
              </span>
            )}
          </div>

          {/* Estimated Monthly Volume */}
          <div>
            <Label htmlFor="estimatedMonthlyVolume">
              Estimated Monthly Volume (tons)
            </Label>
            <Select
              id="estimatedMonthlyVolume"
              {...register("estimatedMonthlyVolume", {
                required: "Estimated volume is required",
              })}
              color={errors.estimatedMonthlyVolume ? "failure" : "gray"}
              aria-invalid={!!errors.estimatedMonthlyVolume}
            >
              <option value="">Select volume range</option>
              <option value="1-10">1–10 tons</option>
              <option value="10-50">10–50 tons</option>
              <option value="50-100">50–100 tons</option>
              <option value="100+">100+ tons</option>
            </Select>
            {errors.estimatedMonthlyVolume && (
              <span className="text-red-600 text-xs">
                {errors.estimatedMonthlyVolume.message as string}
              </span>
            )}
          </div>

          {/* Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Business Verification:</strong> Our team will review your
              application and verify your business credentials within 2–3
              business days.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
