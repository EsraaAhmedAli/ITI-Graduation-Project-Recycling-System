import React, { memo } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface StatBoxProps {
  label: string;
  value: number;
  loading?: boolean;
}

const StatBox = memo(function StatBox({
  label,
  value,
  loading = false,
}: StatBoxProps) {
  const { convertNumber } = useLanguage();
  
  return (
    <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-sm">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-green-200 rounded mb-1"></div>
          <div className="h-4 bg-green-200 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold">{convertNumber(value)}</p>
          <p className="text-sm">{label}</p>
        </>
      )}
    </div>
  );
});

export default StatBox;