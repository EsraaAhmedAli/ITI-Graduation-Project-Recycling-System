"use client";
import { Recycle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Step({
  label,
  active,
  direction,
  isCurrent,
  stepNumber,
}: {
  label: string;
  active: boolean;
  direction: "forward" | "backward";
  isCurrent?: boolean;
  stepNumber?: number;
}) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isCurrent) {
      setRotation((prev) => prev + (direction === "forward" ? 180 : -180));
    }
  }, [isCurrent, direction]);

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
          active ? "border-green-700 bg-green-50" : "border-gray-300 bg-gray-100"
        }`}
      >
        <Recycle
          className={`w-6 h-6 transition-transform duration-500 ${
            active ? "text-green-700" : "text-gray-400"
          }`}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        {stepNumber && (
          <span className="absolute text-[11px] font-bold text-green-800">
          </span>
        )}
      </div>
      <span
        className={`mt-2 text-sm ${
          active ? "text-green-700 font-semibold" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
