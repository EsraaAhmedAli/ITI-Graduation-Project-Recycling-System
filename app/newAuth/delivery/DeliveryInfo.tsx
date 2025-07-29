import { useFormContext } from "react-hook-form";
import { Truck } from "lucide-react";
import { Label, Select, FileInput, TextInput } from "flowbite-react";
import Wrapper from "@/components/auth/Wrapper";
import SmartNavigation from "@/app/newAuth/common/SmartNavigation";

export const DeliveryInfoForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // For nested form handlin
  const vehicleOptions = [
    { label: "Motorcycle", value: "motorcycle" },
    { label: "Car", value: "car" },
    { label: "Van", value: "van" },
    { label: "Small Truck", value: "small-truck" },
    { label: "Large Truck", value: "large-truck" },
  ];

  return (
    <>
      <Wrapper bg="white">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Vehicle & License Information
          </h4>

          {/* License Number */}
          <div>
            <Label htmlFor="licenseNumber">Driver&apos;s License Number</Label>
            <TextInput
              id="licenseNumber"
              placeholder="License number"
              color={errors.licenseNumber ? "failure" : "gray"}
              aria-invalid={!!errors.licenseNumber}
              {...register("licenseNumber", {
                required: "License number is required",
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
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select
              id="vehicleType"
              {...register("vehicleType", {
                required: "Vehicle type is required",
              })}
              color={errors.vehicleType ? "failure" : "gray"}
              aria-invalid={!!errors.vehicleType}
            >
              <option value="">Select vehicle type</option>
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
            <Label htmlFor="deliveryImage">Photo of Delivery Person</Label>
            <FileInput
              id="deliveryImage"
              {...register("deliveryImage", {
                required: "Photo is required",
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
            <Label htmlFor="vehicleImage">Photo of Vehicle</Label>
            <FileInput
              id="vehicleImage"
              {...register("vehicleImage", {
                required: "Vehicle image is required",
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
              Criminal Record Certificate (forwarded to our org)
            </Label>
            <FileInput
              id="criminalRecord"
              {...register("criminalRecord", {
                required: "Certificate is required",
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
