"use client";

import { useEffect, useState, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserAuthContext } from "@/context/AuthFormContext";
import api from "@/lib/axios";
import { Pencil } from "lucide-react";
import { Avatar } from "flowbite-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function EditProfilePage() {
  const { user, setUser } = useContext(UserAuthContext) ?? {};
  const { t } = useLanguage(); 
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumber?.padStart(11, "0").slice(1) || ""
  ); // remove +20
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.role === "delivery"
      ? user?.attachments?.deliveryImage || ""
      : user?.imgUrl || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState("");

  const [nameError, setNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const initialValuesRef = useRef({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    imgUrl:
      user?.role === "delivery"
        ? user?.attachments?.deliveryImage || ""
        : user?.imgUrl || "",
  });
  const isChanged =
    name !== initialValuesRef.current.name ||
    phoneNumber.padStart(11, "0") !== initialValuesRef.current.phoneNumber ||
    (imageFile !== null && previewUrl !== initialValuesRef.current.imgUrl);

  const isFormInvalid = !!nameError || !!phoneNumberError;

  console.log("user in edit profile => ", user);
  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validate fields on change
  useEffect(() => {
    // Name validation
    if (!name.trim()) {
      setNameError(t("editProfile.validation.nameRequired"));
    } else if (name.trim().length > 20) {
      setNameError(t("editProfile.validation.nameMaxLength"));
    } else {
      setNameError("");
    }

    // Phone validation
    const phoneRegex = /^(10|11|12|15)[0-9]{8}$/;
    if (!phoneNumber.trim()) {
      setPhoneNumberError(t("editProfile.validation.phoneRequired"));
    } else if (!phoneRegex.test(phoneNumber)) {
      setPhoneNumberError(t("editProfile.validation.phoneInvalid"));
    } else {
      setPhoneNumberError("");
    }
  }, [name, phoneNumber, t]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setImageError(t("editProfile.validation.imageFormat"));
      return;
    }

    if (file.size > maxSize) {
      setImageError(t("editProfile.validation.imageSize"));
      return;
    }

    setImageError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!isChanged || isFormInvalid) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", `0${phoneNumber}`);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.put("/profile", formData);
      setUser?.(res.data);

      // Role-based navigation
      if (res.data.role === "delivery") {
        router.push("/deilveryDashboard");
      } else {
        router.push("/profile");
      }

      toast.success(t("editProfile.messages.updateSuccess"));
    } catch (err) {
      console.error("Error updating profile:", err?.response);
      toast.error(err.response?.data?.message || t("editProfile.messages.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center" style={{ background: "var(--color-green-60)" }}>
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md space-y-6">
        <h2 className="text-xl font-semibold text-center text-green-800">
          {t("editProfile.title")}
        </h2>

        {/* Avatar and edit icon */}
        <div className="flex flex-col items-center">
          <div className="relative w-[300px] h-[300px]">
            {previewUrl ? (
              <Image
                fill
                priority
                sizes="(max-width: 768px) 150px, (max-width: 1024px) 200px, 250px"
                src={previewUrl}
                alt={t("editProfile.avatarAlt")}
                className="w-full h-full rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <Avatar img={undefined} rounded className="w-full h-full" />
            )}

            <label
              htmlFor="image-upload"
              className="absolute top-4 right-4 bg-white border border-gray-300 p-2 rounded-full shadow-md cursor-pointer z-10"
            >
              <Pencil className="w-5 h-5 text-primary" />
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {imageError && (
            <p className="text-sm text-red-600 mt-2 text-center">
              {imageError}
            </p>
          )}
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {t("editProfile.form.fullName")}
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${
                nameError ? "border-red-500" : "border-gray-300"
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            {nameError && (
              <p className="text-sm text-red-600 mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {t("editProfile.form.phoneNumber")}
            </label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <span className="bg-gray-100 px-3 py-2 text-gray-600 text-sm flex items-center">
                +20
              </span>
              <input
                type="text"
                className={`flex-1 px-3 py-2 text-sm outline-none ${
                  phoneNumberError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-transparent focus:ring-green-600"
                }`}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
                placeholder={t("editProfile.form.phonePlaceholder")}
              />
            </div>
            {phoneNumberError && (
              <p className="text-sm text-red-600 mt-1">{phoneNumberError}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4 space-x-4">
          <button
            onClick={() =>
              user.role == "delivery"
                ? router.push("/deilveryDashboard")
                : router.push("/profile")
            }
            className="w-1/2 py-3 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            {t("editProfile.buttons.cancel")}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isChanged || isSaving || isFormInvalid}
            className={`w-1/2 py-3 text-sm font-medium rounded-lg inline-flex items-center justify-center transition-colors ${
              !isChanged || isSaving || isFormInvalid
                ? "text-gray-400 bg-gray-100 border border-gray-300 cursor-not-allowed"
                : "text-white bg-green-600 hover:bg-green-700 cursor-pointer"
            }`}
          >
            {isSaving ? (
              <>
                <svg
                  className="w-4 h-4 mr-2 animate-spin text-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M100 50.5908C100 78.2051..." fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038..." fill="#1C64F2" />
                </svg>
                {t("editProfile.buttons.saving")}
              </>
            ) : (
              t("editProfile.buttons.save")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}