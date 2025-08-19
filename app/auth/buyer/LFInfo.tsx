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
import { useLanguage } from "@/context/LanguageContext";

export default function LFInfo() {
  const { t } = useLanguage();
  const {
    register,
    formState: { errors, isValid },
    getValues,
  } = useFormContext();

  const { GoogleUser, selectedRole } = useAuthenticationContext();
  const { setToken, setUser } = useUserAuth();
  const router = useRouter();

  const onSubmit = async () => {
    const values = getValues();
    try {
      const res = await registerUser({
        name: GoogleUser?.name || values.name,
        email: GoogleUser?.email || values.email,
        provider: GoogleUser?.provider,
        imgUrl: GoogleUser?.image,
        password: values.password,
        phoneNumber: values.phoneNumber,
        role: selectedRole,
        attachments: {
          businessName: values.businessName,
          businessType: values.businessType,
          businessAddress: values.businessAddress,
          businessLicense: values.businessLicense,
          taxId: values.taxId,
          estimatedMonthlyVolume: values.estimatedMonthlyVolume,
          notes: values.notes,
        },
        idToken: values.idToken,
      });

      toast.success(t("auth.register.fail"));
      setUser(res.user);
      setToken(res.accessToken);
      router.replace("/");
    } catch (error) {
      toast.error(t("auth.register.success"));
    }
  };

  return (
    <>
      <Wrapper>
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            {t("auth.roles.buyer.lfInfo.heading")}
          </h4>

          {/* Business License */}
          <div>
            <Label htmlFor="businessLicense">
              {t("auth.roles.buyer.lfInfo.fields.businessLicense.label")}
            </Label>
            <TextInput
              id="businessLicense"
              {...register("businessLicense", {
                required: t(
                  "auth.roles.buyer.lfInfo.fields.businessLicense.required"
                ),
              })}
              placeholder={t(
                "auth.roles.buyer.lfInfo.fields.businessLicense.placeholder"
              )}
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
            <Label htmlFor="taxId">
              {t("auth.roles.buyer.lfInfo.fields.taxId.label")}
            </Label>
            <TextInput
              id="taxId"
              {...register("taxId", {
                required: t("auth.roles.buyer.lfInfo.fields.taxId.required"),
              })}
              placeholder={t(
                "auth.roles.buyer.lfInfo.fields.taxId.placeholder"
              )}
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
              {t("auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.label")}
            </Label>
            <Select
              id="estimatedMonthlyVolume"
              {...register("estimatedMonthlyVolume", {
                required: t(
                  "auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.required"
                ),
              })}
              color={errors.estimatedMonthlyVolume ? "failure" : "gray"}
              aria-invalid={!!errors.estimatedMonthlyVolume}
              className="text-left" // 🔹 Force text left, add right padding for icon
              style={{ direction: "ltr" }} // 🔹 Keep dropdown LTR even in RTL pages
            >
              <option value="">
                {t(
                  "auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.placeholder"
                )}
              </option>
              <option value="1-10">
                {t(
                  "auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.options.1-10"
                )}
              </option>
              <option value="10-50">
                {t(
                  "auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.options.10-50"
                )}
              </option>
              <option value="50-100">
                {t(
                  "auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.options.50-100"
                )}
              </option>
              <option value="100+">
                {t(
                  "auth.roles.buyer.lfInfo.fields.estimatedMonthlyVolume.options.100+"
                )}
              </option>
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
              {t("auth.roles.buyer.lfInfo.notice.businessVerification")}
            </p>
          </div>
        </div>
      </Wrapper>
      <SmartNavigation onSubmit={onSubmit} />
    </>
  );
}
