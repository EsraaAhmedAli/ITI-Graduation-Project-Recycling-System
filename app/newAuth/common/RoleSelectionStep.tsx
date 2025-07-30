"use client";
import React from "react";
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import { roleConfig, Role } from "../Forms/MainForm";

export default function RoleSelect({ prevStep }: { prevStep?: () => void }) {
  const { selectedRole, setSelectedRole, setMode, setStep } =
    useAuthenticationContext();

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setStep(1);
    setMode("signup");
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm text-center px-4">
        Select the type of account you'd like to create.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-0">
        {Object.entries(roleConfig).map(([key, config]) => {
          const isSelected = selectedRole === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectRole(key as Role)}
              className={`
                relative p-6 border rounded-xl shadow-sm hover:shadow-md 
                transition-all duration-200 text-left
                flex flex-col items-start justify-start
                min-h-[140px] w-full
                ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-green-500 border-green-200 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              {/* Icon container with fixed positioning */}
              <div className="mb-3">
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center 
                    rounded-full text-white shadow-sm
                    ${config.color}
                  `}
                >
                  <span className="text-lg">{config.icon}</span>
                </div>
              </div>

              {/* Content container with consistent spacing */}
              <div className="flex-1 space-y-2 w-full">
                <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                  {config.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {config.description}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {prevStep && (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="text-sm text-primary hover:underline transition-colors duration-200"
          >
            ← Back to previous
          </button>
        </div>
      )}
    </div>
  );
}
