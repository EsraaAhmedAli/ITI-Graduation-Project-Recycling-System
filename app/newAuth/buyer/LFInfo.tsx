"use client";
import { Label, TextInput, Select } from "flowbite-react";
import { CreditCard } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import SmartNavigation from "../common/SmartNavigation";
import Wrapper from "@/components/auth/Wrapper";
import toast from "react-hot-toast";
import { registerUser } from "@/lib/auth";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";

export default function LFInfo() {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();

  const { GoogleUser } = useAuthenticationContext();
  const { setToken, setUser } = useUserAuth();
  const router = useRouter();
  const onSubmit = async () => {
    const {
      name,
      email,
      password,
      phoneNumber,
      role,
      businessName,
      businessType,
      businessAddress,
      businessLicense,
      taxId,
      estimatedMonthlyVolume,
      notes,
    } = getValues();

    try {
      const res = await registerUser({
        name: GoogleUser?.name || name,
        email: GoogleUser?.email || email,
        provider: GoogleUser?.provider,
        imgUrl: GoogleUser?.image,
        password,
        phoneNumber,
        role,
        attachments: {
          businessName,
          businessType,
          businessAddress,
          businessLicense,
          taxId,
          estimatedMonthlyVolume,
          notes, // optional
        },
      });

      toast.success("User registered successfully");
      setUser(res.user);
      setToken(res.accessToken);
      router.replace("/");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Wrapper>
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
      </Wrapper>
      <SmartNavigation onSubmit={onSubmit} />
    </>
  );
}
