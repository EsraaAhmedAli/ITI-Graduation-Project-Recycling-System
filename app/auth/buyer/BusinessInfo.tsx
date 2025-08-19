import Wrapper from "@/components/auth/Wrapper";
import { Label, TextInput, Select, Textarea } from "flowbite-react";
import { Building } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import SmartNavigation from "../common/SmartNavigation";
import { useLanguage } from "@/context/LanguageContext";

export default function BusinessInfo() {
  const { t } = useLanguage();
  const {
    register,
    formState: { errors, isValid },
  } = useFormContext();

  const handleSubmit = () => {};

  return (
    <>
      <Wrapper>
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            {t("auth.roles.buyer.businessInfo.heading")}
          </h4>

          {/* Business Name */}
          <div>
            <Label htmlFor="businessName">
              {t("auth.roles.buyer.businessInfo.fields.businessName.label")}
            </Label>
            <TextInput
              id="businessName"
              {...register("businessName", {
                required: t(
                  "auth.roles.buyer.businessInfo.fields.businessName.required"
                ),
              })}
              placeholder={t(
                "auth.roles.buyer.businessInfo.fields.businessName.placeholder"
              )}
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
            <Label htmlFor="businessType">
              {t("auth.roles.buyer.businessInfo.fields.businessType.label")}
            </Label>
            <Select
              id="businessType"
              {...register("businessType", {
                required: t(
                  "auth.roles.buyer.businessInfo.fields.businessType.required"
                ),
              })}
              color={errors.businessType ? "failure" : "gray"}
              aria-invalid={!!errors.businessType}
              className="text-left" // 🔹 Force text left, add right padding for icon
              style={{ direction: "ltr" }} // 🔹 Keep dropdown LTR even in RTL pages
            >
              <option value="">
                {t(
                  "auth.roles.buyer.businessInfo.fields.businessType.placeholder"
                )}
              </option>
              <option value="recycling-plant">
                {t(
                  "auth.roles.buyer.businessInfo.fields.businessType.options.recyclingPlant"
                )}
              </option>
              <option value="manufacturing">
                {t(
                  "auth.roles.buyer.businessInfo.fields.businessType.options.manufacturing"
                )}
              </option>
              <option value="waste-management">
                {t(
                  "auth.roles.buyer.businessInfo.fields.businessType.options.wasteManagement"
                )}
              </option>
              <option value="export">
                {t(
                  "auth.roles.buyer.businessInfo.fields.businessType.options.export"
                )}
              </option>
              <option value="other">
                {t(
                  "auth.roles.buyer.businessInfo.fields.businessType.options.other"
                )}
              </option>
            </Select>
            {errors.businessType && (
              <span className="text-red-600 text-xs">
                {errors.businessType.message as string}
              </span>
            )}
          </div>

          {/* Business Address */}
          <div>
            <Label htmlFor="businessAddress">
              {t("auth.roles.buyer.businessInfo.fields.businessAddress.label")}
            </Label>
            <Textarea
              id="businessAddress"
              rows={3}
              placeholder={t(
                "auth.roles.buyer.businessInfo.fields.businessAddress.placeholder"
              )}
              {...register("businessAddress", {
                required: t(
                  "auth.roles.buyer.businessInfo.fields.businessAddress.required"
                ),
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
      </Wrapper>
      <SmartNavigation onSubmit={handleSubmit} />
    </>
  );
}
