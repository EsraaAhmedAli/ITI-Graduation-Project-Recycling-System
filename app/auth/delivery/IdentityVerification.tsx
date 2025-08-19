import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import { Label, TextInput } from "flowbite-react";
import SmartNavigation from "@/app/auth/common/SmartNavigation";
import Wrapper from "@/components/auth/Wrapper";
import { useUserAuth } from "@/context/AuthFormContext";
import { AuthResponse } from "@/lib/auth";
import toast from "react-hot-toast";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";

export const IdentityVerificationForm = () => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();
  const { t } = useLanguage();

  const { setUser, setToken } = useUserAuth();
  const { setMode, GoogleUser, selectedRole } = useAuthenticationContext();

  const onSubmit = async () => {
    const {
      name,
      email,
      password,
      phoneNumber,
      role,
      licenseNumber,
      vehicleType,
      deliveryImage,
      vehicleImage,
      criminalRecord,
      nationalId,
      emergencyContact,
      idToken,
    } = getValues();

    const formData = new FormData();
    formData.append("name", GoogleUser?.name || name);
    formData.append("email", GoogleUser?.email || email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);
    formData.append("role", selectedRole);
    formData.append("provider", GoogleUser?.provider || "none");

    formData.append("deliveryImage", deliveryImage[0]);
    formData.append("vehicleImage", vehicleImage[0]);
    formData.append("criminalRecord", criminalRecord[0]);
    formData.append("idToken", idToken);

    const attachments = {
      licenseNumber,
      vehicleType,
      nationalId,
      emergencyContact,
    };
    formData.append("attachments", JSON.stringify(attachments));

    try {
      const res = await api.post<AuthResponse>("/registerDelivery", formData);
      const data = res.data;
      if (!res.status) throw new Error(res.statusText || "Registration failed");

      toast.success(t("auth.roles.delivery.messages.registrationSuccess"));
      setUser(data.user);
      setToken(data.accessToken);
      setMode("login");
    } catch (err: any) {
      toast.error(
        err.message || t("auth.roles.delivery.messages.registrationError")
      );
    }
  };

  return (
    <>
      <Wrapper bg="white">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {t("auth.roles.delivery.steps.identity")}
          </h4>

          {/* National ID / Passport */}
          <div>
            <Label htmlFor="nationalId">
              {t("auth.roles.delivery.fields.nationalId.label")}
            </Label>
            <TextInput
              id="nationalId"
              placeholder={t(
                "auth.roles.delivery.fields.nationalId.placeholder"
              )}
              color={errors.nationalId ? "failure" : "gray"}
              aria-invalid={!!errors.nationalId}
              {...register("nationalId", {
                required: t("auth.roles.delivery.fields.nationalId.required"),
              })}
            />
            {errors.nationalId && (
              <span className="text-red-600 text-xs">
                {errors.nationalId.message as string}
              </span>
            )}
          </div>

          {/* Emergency Contact */}
          <div>
            <Label htmlFor="emergencyContact">
              {t("auth.roles.delivery.fields.emergencyContact.label")}
            </Label>
            <TextInput
              id="emergencyContact"
              placeholder={t(
                "auth.roles.delivery.fields.emergencyContact.placeholder"
              )}
              color={errors.emergencyContact ? "failure" : "gray"}
              aria-invalid={!!errors.emergencyContact}
              {...register("emergencyContact", {
                required: t(
                  "auth.roles.delivery.fields.emergencyContact.required"
                ),
              })}
            />
            {errors.emergencyContact && (
              <span className="text-red-600 text-xs">
                {errors.emergencyContact.message as string}
              </span>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {t("auth.roles.delivery.fields.identityVerificationNote.text")}
            </p>
          </div>
        </div>
      </Wrapper>
      <SmartNavigation onSubmit={onSubmit} />
    </>
  );
};
