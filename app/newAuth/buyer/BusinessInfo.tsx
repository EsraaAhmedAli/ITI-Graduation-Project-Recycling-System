import Wrapper from "@/components/auth/Wrapper";
import { Label, TextInput, Select, Textarea } from "flowbite-react";
import { Building } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import SmartNavigation from "../common/SmartNavigation";

export default function BusinessInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const handleSubmit = () => {};
  return (
    <>
      <Wrapper>
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
      </Wrapper>
      <SmartNavigation onSubmit={handleSubmit} />
    </>
  );
}
