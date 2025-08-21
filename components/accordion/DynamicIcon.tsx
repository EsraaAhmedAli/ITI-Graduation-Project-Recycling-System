"use client";
import React, { memo, Suspense } from "react";
import { iconImports } from "@/constants/points";

interface DynamicIconProps {
  iconName: keyof typeof iconImports;
  className?: string;
}

// Create a wrapper that throws promise for Suspense
const IconResource = (iconName: keyof typeof iconImports) => {
  let status = "pending";
  let result: React.ComponentType<{ className?: string }>;

  const promise = iconImports[iconName]()
    .then((module) => {
      status = "success";
      result = module.default;
    })
    .catch((error) => {
      status = "error";
      result = error;
    });

  return {
    read() {
      if (status === "pending") throw promise;
      if (status === "error") throw result;
      return result;
    },
  };
};

const DynamicIconContent = memo(
  ({ iconName, className = "w-3 h-3" }: DynamicIconProps) => {
    const resource = React.useMemo(() => IconResource(iconName), [iconName]);
    const Icon = resource.read();

    return <Icon className={className} />;
  }
);

DynamicIconContent.displayName = "DynamicIconContent";

// Main component with Suspense boundary
const DynamicIcon = memo((props: DynamicIconProps) => {
  return (
    <Suspense
      fallback={
        <div
          className={`${props.className} bg-gray-200 rounded animate-pulse`}
        />
      }
    >
      <DynamicIconContent {...props} />
    </Suspense>
  );
});

DynamicIcon.displayName = "DynamicIcon";
export default DynamicIcon;
