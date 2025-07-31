"use client";
import { Label, Textarea } from "flowbite-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import SmartNavigation from "@/app/newAuth/common/SmartNavigation";
import { registerUser } from "@/lib/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/AuthFormContext";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

export default function CustomerSteps() {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();
  const router = useRouter();
  const { setUser, setToken } = useUserAuth();
  const { GoogleUser, setMode, setStep, step } = useAuthenticationContext();

  const prevStep = () => {
    if (GoogleUser) setMode("role-select");
    else setStep(step - 1);
  };
  const onSubmit = async () => {
    const { name, email, password, role, phoneNumber, address } = getValues();

    console.log("Google Image", GoogleUser?.image);
    try {
      const res = await registerUser({
        name: GoogleUser?.name ? GoogleUser.name : name,
        email: GoogleUser?.email ? GoogleUser.email : email,
        provider: GoogleUser?.provider,
        imgUrl: GoogleUser?.image,
        password,
        phoneNumber,
        role,
        attachments: { address },
      });
      toast.success("user Registerd Successfully");

      setUser(res.user);
      setToken(res.accessToken);
      router.replace("/");
    } catch {
      toast.error("SomeThing Went Wrong");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register("address", { required: "Address is required" })}
          rows={3}
          placeholder="Enter your full address for pickup services"
          color={errors.address ? "failure" : "gray"}
          aria-invalid={!!errors.address}
        />
        {errors.address && (
          <span className="text-red-600 text-xs">
            {typeof errors.address?.message === "string"
              ? errors.address.message
              : ""}
          </span>
        )}
      </div>
      <SmartNavigation onSubmit={onSubmit} prevStep={prevStep} />
    </>
  );
}
