"use client";

import { Select, TextInput } from "flowbite-react";
import FormError from "@/components/common/FormError";
import { City, FormInputs } from "@/components/Types/address.type";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { cityAreas } from "./cityAreas";
import Button from "@/components/common/Button";

interface Props {
  register: UseFormRegister<FormInputs>;
  errors: FieldErrors<FormInputs>;
  selectedCity: City | "";
  setSelectedCity: (city: City | "") => void;
  setValue: UseFormSetValue<FormInputs>;
  isValid: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function AddressStep({
  register,
  errors,
  selectedCity,
  setSelectedCity,
  setValue,
  isValid,
  onSubmit,
  onCancel,
}: Props) {
  const availableAreas = selectedCity ? cityAreas[selectedCity] : [];

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value as City;
    setSelectedCity(newCity);
    setValue("city", newCity, { shouldValidate: true });
    setValue("area", "");
  };

  return (
    <form
      role="form"
      onSubmit={onSubmit}
      className="space-y-6"
      aria-labelledby="pickup-address-title">
      <fieldset className="border border-green-100 rounded-lg p-4">
        <legend
          id="pickup-address-title"
          className="text-lg font-bold text-green-800 mb-4">
          Pickup Address
        </legend>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-green-800 mb-1">
              Select your city
            </label>
            <Select
              id="city"
              value={selectedCity}
              onChange={handleCityChange}
              aria-invalid={errors.city ? "true" : "false"}
              aria-describedby="city-error">
              <option disabled value="">
                -- Select City --
              </option>
              <option value="Cairo">Cairo</option>
              <option value="Giza">Giza</option>
              <option value="Alexandria">Alexandria</option>
              <option value="Mansoura">Mansoura</option>
              <option value="Aswan">Aswan</option>
            </Select>
            <FormError id="city-error" message={errors.city?.message} />
          </div>

          <div>
            <label
              htmlFor="area"
              className="block text-sm font-semibold text-green-800 mb-1">
              Select your area
            </label>
            <Select
              id="area"
              {...register("area", { required: "Area is required" })}
              disabled={!selectedCity}
              aria-invalid={errors.area ? "true" : "false"}
              aria-describedby="area-error">
              <option disabled value="">
                -- Select Area --
              </option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </Select>
            <FormError id="area-error" message={errors.area?.message} />
          </div>

          <div>
            <label
              htmlFor="street"
              className="block text-sm font-semibold text-green-800 mb-1">
              Street Address
            </label>
            <TextInput
              id="street"
              {...register("street", { required: "Street is required" })}
              placeholder="e.g. El-Central street"
              aria-invalid={errors.street ? "true" : "false"}
              aria-describedby="street-error"
            />
            <FormError id="street-error" message={errors.street?.message} />
          </div>

          <div>
            <label
              htmlFor="landmark"
              className="block text-sm font-semibold text-green-800 mb-1">
              Nearest Landmark (optional)
            </label>
            <TextInput
              id="landmark"
              {...register("landmark")}
              placeholder="e.g. El-Asdekaa Market"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="building"
                className="block text-sm font-semibold text-green-800 mb-1">
                Building Number/Name
              </label>
              <TextInput
                id="building"
                {...register("building", { required: "Building is required" })}
                aria-invalid={errors.building ? "true" : "false"}
                aria-describedby="building-error"
              />
              <FormError
                id="building-error"
                message={errors.building?.message}
              />
            </div>
            <div>
              <label
                htmlFor="floor"
                className="block text-sm font-semibold text-green-800 mb-1">
                Floor Number
              </label>
              <TextInput
                id="floor"
                {...register("floor", { required: "Floor is required" })}
                aria-invalid={errors.floor ? "true" : "false"}
                aria-describedby="floor-error"
              />
              <FormError id="floor-error" message={errors.floor?.message} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="apartment"
                className="block text-sm font-semibold text-green-800 mb-1">
                Apartment Number
              </label>
              <TextInput
                id="apartment"
                {...register("apartment", {
                  required: "Apartment is required",
                })}
                aria-invalid={errors.apartment ? "true" : "false"}
                aria-describedby="apartment-error"
              />
              <FormError
                id="apartment-error"
                message={errors.apartment?.message}
              />
            </div>
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-semibold text-green-800 mb-1">
                Additional Note
              </label>
              <TextInput
                id="notes"
                {...register("notes")}
                placeholder="e.g. Don't ring the bell"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            onClick={onCancel}
            className="border bg-red-700 text-white px-6 py-2 rounded-lg">
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit()}
            disabled={!isValid}
            aria-disabled={!isValid}
            className={`px-6 py-2 rounded-lg ${
              isValid
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            Next
          </Button>
        </div>
      </fieldset>
    </form>
  );
}