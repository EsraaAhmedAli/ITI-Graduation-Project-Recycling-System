"use client";
import React from "react";
import {
  Check,
  User,
  MapPin,
  Car,
  IdCard,
  Briefcase,
  FileText,
  Shield,
  DatabaseBackup,
} from "lucide-react";
import { Role } from "@/app/newAuth/Forms/MainForm";
import { useAuthenticationContext } from "@/context/AuhenticationContext";

// Mapping icons per role
const stepIcons: Record<Role, React.ElementType[]> = {
  customer: [User, Shield, MapPin],
  delivery: [User, Shield, Car, IdCard],
  buyer: [User, Shield, Briefcase, FileText],
};
const GoogleStepIcons: Record<Role, React.ElementType[]> = {
  customer: [User, MapPin],
  delivery: [User, Car, IdCard],
  buyer: [User, Briefcase, FileText],
};
const forgotIcons: React.ElementType[] = [User, Shield, DatabaseBackup];

interface RoleStepperWithIconsProps {
  step: number;
  role: Role;
}

const RoleStepperWithIcons: React.FC<RoleStepperWithIconsProps> = ({
  step,
  role,
}) => {
  const { GoogleUser, mode } = useAuthenticationContext();
  const icons =
    mode === "forgot-password"
      ? forgotIcons
      : GoogleUser
      ? GoogleStepIcons[role]
      : stepIcons[role];

  return (
    <ol className="flex items-center justify-center w-full mb-5">
      {icons.map((Icon, idx) => {
        const isCompleted = idx + 1 < step;
        const isActive = idx + 1 === step;
        const isLast = idx === icons.length - 1;

        return (
          <li
            key={idx}
            className={`flex items-center ${
              !isLast
                ? "w-full after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block after:ml-4"
                : ""
            } ${
              isCompleted && !isLast
                ? "after:border-[var(--color-primary)]"
                : "after:border-gray-200 dark:after:border-gray-700"
            }`}
          >
            <span
              className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 lg:h-12 lg:w-12
            ${
              isCompleted
                ? "bg-[var(--color-primary)] text-white"
                : isActive
                ? "bg-[var(--color-primary)/20] border border-[var(--color-primary)] text-[var(--color-primary)]"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
            }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 lg:w-5 lg:h-5" />
              ) : (
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default RoleStepperWithIcons;
