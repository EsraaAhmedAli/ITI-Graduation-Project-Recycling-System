import React, { memo, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface StatBoxProps {
  label: string;
  value: number;
  loading?: boolean;
}

// Memoize the loading skeleton to prevent recreation
const LoadingSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="h-8 bg-green-200 rounded mb-1"></div>
    <div className="h-4 bg-green-200 rounded w-3/4"></div>
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

// Pre-define static class names to avoid string concatenation at runtime
const STAT_BOX_CLASSES = {
  container: "bg-green-100 text-green-800 p-4 rounded-xl shadow-sm",
  value: "text-2xl font-bold",
  label: "text-sm"
} as const;

// Memoize the component with proper optimizations
const StatBox = memo(
  function StatBox({ label, value, loading = false }: StatBoxProps) {
    const { convertNumber } = useLanguage();

    // Memoize the converted number with dependency optimization
    const convertedValue = useMemo(() => {
      if (loading) return "";
      return convertNumber(value);
    }, [value, loading, convertNumber]);

    // Use early return pattern for loading state
    if (loading) {
      return (
        <div className={STAT_BOX_CLASSES.container}>
          <LoadingSkeleton />
        </div>
      );
    }

    return (
      <div className={STAT_BOX_CLASSES.container}>
        <p className={STAT_BOX_CLASSES.value}>{convertedValue}</p>
        <p className={STAT_BOX_CLASSES.label}>{label}</p>
      </div>
    );
  },
  // Optimized comparison function with shallow equality check
  (prevProps, nextProps) => {
    return (
      prevProps.label === nextProps.label &&
      prevProps.value === nextProps.value &&
      prevProps.loading === nextProps.loading
    );
  }
);

StatBox.displayName = "StatBox";

export default StatBox;