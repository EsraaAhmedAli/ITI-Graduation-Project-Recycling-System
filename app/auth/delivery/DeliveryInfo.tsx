import { useFormContext } from "react-hook-form";
import { Truck } from "lucide-react";
import { Label, Select, FileInput, TextInput } from "flowbite-react";
import Wrapper from "@/components/auth/Wrapper";
import SmartNavigation from "@/app/auth/common/SmartNavigation";
import { useLanguage } from "@/context/LanguageContext";

export const DeliveryInfoForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useLanguage();

  const vehicleOptions = [
    {
      value: "motorcycle",
      label: t("auth.roles.delivery.fields.vehicleType.options.motorcycle"),
    },
    {
      value: "car",
      label: t("auth.roles.delivery.fields.vehicleType.options.car"),
    },
    {
      value: "van",
      label: t("auth.roles.delivery.fields.vehicleType.options.van"),
    },
    {
      value: "small-truck",
      label: t("auth.roles.delivery.fields.vehicleType.options.smallTruck"),
    },
    {
      value: "large-truck",
      label: t("auth.roles.delivery.fields.vehicleType.options.largeTruck"),
    },
  ];

  return (
    <>
      <Wrapper bg="white">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            {t("auth.roles.delivery.steps.info")}
          </h4>

          {/* License Number */}
          <div>
            <Label htmlFor="licenseNumber">
              {t("auth.roles.delivery.fields.licenseNumber.label")}
            </Label>
            <TextInput
              id="licenseNumber"
              placeholder={t(
                "auth.roles.delivery.fields.licenseNumber.placeholder"
              )}
              color={errors.licenseNumber ? "failure" : "gray"}
              aria-invalid={!!errors.licenseNumber}
              {...register("licenseNumber", {
                required: t(
                  "auth.roles.delivery.fields.licenseNumber.required"
                ),
              })}
            />
            {errors.licenseNumber && (
              <span className="text-red-600 text-xs">
                {errors.licenseNumber.message as string}
              </span>
            )}
          </div>

          {/* Vehicle Type */}
          <div>
            <Label htmlFor="vehicleType">
              {t("auth.roles.delivery.fields.vehicleType.label")}
            </Label>
            <Select
              id="vehicleType"
              {...register("vehicleType", {
                required: t("auth.roles.delivery.fields.vehicleType.required"),
              })}
              color={errors.vehicleType ? "failure" : "gray"}
              aria-invalid={!!errors.vehicleType}
              className="text-left" // 🔹 Force text left, add right padding for icon
              style={{ direction: "ltr" }} // 🔹 Keep dropdown LTR even in RTL pages
            >
              <option value="">
                {t("auth.roles.delivery.fields.vehicleType.placeholder")}
              </option>
              {vehicleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            {errors.vehicleType && (
              <span className="text-red-600 text-xs">
                {errors.vehicleType.message as string}
              </span>
            )}
          </div>

          {/* Delivery Person Photo */}
          <div>
            <Label htmlFor="deliveryImage">
              {t("auth.roles.delivery.fields.deliveryImage.label")}
            </Label>
            <FileInput
              id="deliveryImage"
              {...register("deliveryImage", {
                required: t(
                  "auth.roles.delivery.fields.deliveryImage.required"
                ),
              })}
              accept="image/*"
              color={errors.deliveryImage ? "failure" : "gray"}
              aria-invalid={!!errors.deliveryImage}
            />
            {errors.deliveryImage && (
              <span className="text-red-600 text-xs">
                {errors.deliveryImage.message as string}
              </span>
            )}
          </div>

          {/* Vehicle Image */}
          <div>
            <Label htmlFor="vehicleImage">
              {t("auth.roles.delivery.fields.vehicleImage.label")}
            </Label>
            <FileInput
              id="vehicleImage"
              {...register("vehicleImage", {
                required: t("auth.roles.delivery.fields.vehicleImage.required"),
              })}
              accept="image/*"
              color={errors.vehicleImage ? "failure" : "gray"}
              aria-invalid={!!errors.vehicleImage}
            />
            {errors.vehicleImage && (
              <span className="text-red-600 text-xs">
                {errors.vehicleImage.message as string}
              </span>
            )}
          </div>

          {/* Criminal Record */}
          <div>
            <Label htmlFor="criminalRecord">
              {t("auth.roles.delivery.fields.criminalRecord.label")}
            </Label>
            <FileInput
              id="criminalRecord"
              {...register("criminalRecord", {
                required: t(
                  "auth.roles.delivery.fields.criminalRecord.required"
                ),
              })}
              accept="image/*,application/pdf"
              color={errors.criminalRecord ? "failure" : "gray"}
              aria-invalid={!!errors.criminalRecord}
            />
            {errors.criminalRecord && (
              <span className="text-red-600 text-xs">
                {errors.criminalRecord.message as string}
              </span>
            )}
          </div>
        </div>
      </Wrapper>
      <SmartNavigation />
    </>
  );
};
