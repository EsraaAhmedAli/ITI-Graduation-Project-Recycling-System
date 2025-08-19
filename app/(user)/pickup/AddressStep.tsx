"use client";

import { Select, TextInput } from "flowbite-react";
import FormError from "@/components/common/FormError";
import { City, FormInputs } from "@/components/Types/address.type";
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  useFormContext,
  useForm,
} from "react-hook-form";
import { cityAreas } from "./cityAreas";
import Button from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";
import { egyptCities } from "@/constants/cities";

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
  const { t, convertNumber, formatNumber, locale, dir } = useLanguage();
  const { getValues } = useForm<FormInputs>();

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
      aria-labelledby="pickup-address-title"
    >
      <fieldset className="border border-green-100 rounded-lg p-4">
        <legend
          id="pickup-address-title"
          className="text-lg font-bold text-green-800 mb-4"
        >
          {t("address.pickupAddress")}
        </legend>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-green-800 mb-1"
            >
              {t("address.selectCity")}
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={handleCityChange}
              aria-invalid={errors.city ? "true" : "false"}
              aria-describedby="city-error"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pe-10 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJtNiA4IDQgNCA0LTQiLz48L3N2Zz4=')] bg-no-repeat bg-[position:right_0.75rem_center] rtl:bg-[position:left_0.75rem_center] bg-[length:16px_16px] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected>{t("egyptCities.selectCityPlaceholder")}</option>
              {egyptCities.map((city) => (
                <option key={city} value={city}>
                  {t(`egyptCities.${city.replace(/\s+/g, "").toLowerCase()}`)}
                </option>
              ))}
            </select>
            <FormError id="city-error" message={errors.city?.message} />
          </div>
          <div>
            <label
              htmlFor="area"
              className="block text-sm font-semibold text-green-800 mb-1"
            >
              {t("address.selectArea")}
            </label>
            <select
              id="area"
              {...register("area", { required: t("address.errors.area") })}
              disabled={!selectedCity}
              aria-invalid={errors.area ? "true" : "false"}
              aria-describedby="area-error"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pe-10 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJtNiA4IDQgNCA0LTQiLz48L3N2Zz4=')] bg-no-repeat bg-[position:right_0.75rem_center] rtl:bg-[position:left_0.75rem_center] bg-[length:16px_16px] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:disabled:bg-gray-600"
            >
              <option value="" disabled>
                {t("address.selectArea")}
              </option>
              {availableAreas?.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <FormError id="area-error" message={errors.area?.message} />
          </div>
          <div>
            <label
              htmlFor="street"
              className="block text-sm font-semibold text-green-800 mb-1"
            >
              {t("address.street")}
            </label>
            <TextInput
              id="street"
              {...register("street", { required: t("address.errors.street") })}
              placeholder={t("address.streetPlaceholder")}
              aria-invalid={errors.street ? "true" : "false"}
              aria-describedby="street-error"
            />
            <FormError id="street-error" message={errors.street?.message} />
          </div>

          <div>
            <label
              htmlFor="landmark"
              className="block text-sm font-semibold text-green-800 mb-1"
            >
              {t("address.landmark")}
            </label>
            <TextInput
              id="landmark"
              {...register("landmark")}
              placeholder={t("address.landmarkPlaceholder")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="building"
                className="block text-sm font-semibold text-green-800 mb-1"
              >
                {t("address.building")}
              </label>
              <TextInput
                id="building"
                maxLength={25}
                {...register("building", {
                  required: t("address.errors.building"),
                })}
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
                className="block text-sm font-semibold text-green-800 mb-1"
              >
                {t("address.floor")}
              </label>
              <TextInput
                id="floor"
                maxLength={3}
                {...register("floor", {
                  required: t("address.errors.floor"),
                  validate: (v) =>
                    (!isNaN(Number(v)) && v > 0) || t("address.errors.number"),
                })}
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
                className="block text-sm font-semibold text-green-800 mb-1"
              >
                {t("address.apartment")}
              </label>
              <TextInput
                id="apartment"
                maxLength={3}
                {...register("apartment", {
                  required: t("address.errors.apartment"),
                  validate: (v) =>
                    (!isNaN(Number(v)) && v > 0) || t("address.errors.number"),
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
                className="block text-sm font-semibold text-green-800 mb-1"
              >
                {t("address.notes")}
              </label>
              <TextInput
                id="notes"
                maxLength={20}
                {...register("notes")}
                placeholder={t("address.notesPlaceholder")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            onClick={onCancel}
            className="border bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            {t("address.cancel")}
          </Button>
          <Button
            onClick={() => onSubmit()}
            disabled={!isValid}
            aria-disabled={!isValid}
            className={`px-6 py-2 rounded-lg ${
              isValid
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {t("address.next")}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}