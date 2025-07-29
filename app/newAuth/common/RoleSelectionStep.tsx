// components/auth/RoleSelect.tsx
import { useAuthenticationContext } from "@/context/AuhenticationContext";
import React from "react";
import { useFormContext } from "react-hook-form";
import { Role } from "@/app/newAuth/Forms/MainForm";

interface RoleConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string; // class for icon bg (e.g., "bg-green-600")
}

interface RoleSelectProps {
  roleConfig: Record<string, RoleConfig>;
  prevStep: () => void;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ roleConfig, prevStep }) => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const { setStep, setMode, setSelectedRole, GoogleUser } =
    useAuthenticationContext();

  const selectedRole = watch("selectedRole");

  const handleSelect = (role: Role) => {
    setValue("role", role);
    setSelectedRole(role);
    setMode("signup");
    setStep(1);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => handleSelect(role)}
              className={`p-4 border-2 rounded-lg text-left group transition-all duration-150 h-full min-h-[120px] flex flex-col
                ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)/10]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-105 transition-transform flex-shrink-0`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                  {config.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed flex-1">
                  {config.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {errors.selectedRole && (
        <p className="text-sm text-[var(--color-error)] mt-2">
          {errors.selectedRole.message?.toString() || "Please select a role"}
        </p>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

export default RoleSelect;
