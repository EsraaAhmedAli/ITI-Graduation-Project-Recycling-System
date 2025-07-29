import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import { Label, TextInput } from "flowbite-react";
import SmartNavigation from "@/app/newAuth/common/SmartNavigation";
import Wrapper from "@/components/auth/Wrapper";
import { useUserAuth } from "@/context/AuthFormContext";
import { useRouter } from "next/navigation";
import { AuthResponse } from "@/lib/auth";
import toast from "react-hot-toast";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import api from "@/lib/axios";
export const deliveryFields = [
  // Vehicle & License Information
  "licenseNumber",
  "vehicleType",
  "deliveryImage",
  "vehicleImage",
  "criminalRecord",

  // Identity Verification
  "nationalId",
  "emergencyContact",
];

export const IdentityVerificationForm = () => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();

  const { setUser, setToken } = useUserAuth();
  const { setMode, GoogleUser } = useAuthenticationContext();
  const router = useRouter();

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
    } = getValues();

    const formData = new FormData();

    // Append basic fields
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);
    formData.append("role", role);

    // Append files
    formData.append("deliveryImage", deliveryImage[0]);
    formData.append("vehicleImage", vehicleImage[0]);
    formData.append("criminalRecord", criminalRecord[0]);

    // Append attachments metadata (as a JSON string)
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

      toast.success("Delivery Registered. Awaiting Admin Approval");

      setUser(data.user);
      setToken(data.accessToken);
      setMode("login");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <>
      <Wrapper bg="white">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Identity Verification
          </h4>

          {/* National ID / Passport */}
          <div>
            <Label htmlFor="nationalId">National ID / Passport Number</Label>
            <TextInput
              id="nationalId"
              placeholder="National ID or Passport number"
              color={errors.nationalId ? "failure" : "gray"}
              aria-invalid={!!errors.nationalId}
              {...register("nationalId", {
                required: "National ID or Passport number is required",
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
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <TextInput
              id="emergencyContact"
              placeholder="Emergency contact phone number"
              color={errors.emergencyContact ? "failure" : "gray"}
              aria-invalid={!!errors.emergencyContact}
              {...register("emergencyContact", {
                required: "Emergency contact is required",
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
              <strong>Note:</strong> Your identity will be verified within 24–48
              hours. You&apos;ll receive an email once approved.
            </p>
          </div>
        </div>
      </Wrapper>
      <SmartNavigation onSubmit={onSubmit} />
    </>
  );
};
