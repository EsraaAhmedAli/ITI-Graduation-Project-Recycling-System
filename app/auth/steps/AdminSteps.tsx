"use client";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { Shield } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";

export default function AdminSteps() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { step } = useAuthenticationContext();

  return (
    <>
      {step === 2 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Administrative Access
          </h4>

          {/* Admin Code */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Admin Authorization Code
            </label>
            <input
              type="password"
              {...register("adminCode", {
                required: "Authorization code is required",
              })}
              className={`bg-gray-50 border ${
                errors.adminCode ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5`}
              placeholder="Enter admin authorization code"
            />
            {errors.adminCode && (
              <p className="text-red-600 text-xs mt-1">
                {errors.adminCode.message as string}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Department
            </label>
            <select
              {...register("department", {
                required: "Department is required",
              })}
              className={`bg-gray-50 border ${
                errors.department ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5`}
            >
              <option value="">Select department</option>
              <option value="operations">Operations</option>
              <option value="customer-service">Customer Service</option>
              <option value="finance">Finance</option>
              <option value="logistics">Logistics</option>
              <option value="it">IT</option>
            </select>
            {errors.department && (
              <p className="text-red-600 text-xs mt-1">
                {errors.department.message as string}
              </p>
            )}
          </div>

          {/* Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Security Notice:</strong> Admin access requires approval
              from system administrators. Your request will be reviewed within
              24 hours.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
