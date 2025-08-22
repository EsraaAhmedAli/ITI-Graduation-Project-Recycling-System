"use client";
import { useLanguage } from "@/context/LanguageContext";
import React from "react";

interface LoaderProps {
  title?: string;
  fullScreen?: boolean;
}

export default function Loader({ title, fullScreen = true }: LoaderProps) {
  const { t } = useLanguage();
  
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? "fixed inset-0 flex items-center justify-center bg-white z-50"
          : "flex items-center justify-center min-h-full"
      }
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">
          {t("common.loading")} {title && `${title}...`}
        </p>
      </div>
    </div>
  );
}