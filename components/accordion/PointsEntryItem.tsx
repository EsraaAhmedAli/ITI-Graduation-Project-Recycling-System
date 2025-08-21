"use client";
import React, { memo, useMemo } from "react";
import { Calendar } from "lucide-react";
import { TAG_COLORS } from "@/constants/points";
import { categorizeEntry, formatDate } from "@/utils/points";
import DynamicIcon from "./DynamicIcon";
import type { PointsEntry, PointsTag } from "@/components/Types/points.type";

interface PointsEntryItemProps {
  entry: PointsEntry;
  t: (key: string) => string;
}

const getIconName = (tag: PointsTag) => {
  switch (tag) {
    case "redeem":
    case "cashback":
      return "Gift" as const;
    case "earn":
      return "Plus" as const;
    case "bonus":
      return "Award" as const;
    case "deduct":
      return "Minus" as const;
    default:
      return "Plus" as const;
  }
};

const PointsEntryItem = memo(({ entry, t }: PointsEntryItemProps) => {
  const tag = useMemo(
    () => categorizeEntry(entry.reason, entry.points),
    [entry.reason, entry.points]
  );
  const formattedDate = useMemo(
    () => formatDate(entry.timestamp),
    [entry.timestamp]
  );
  const isPositive = entry.points > 0;
  const absolutePoints = Math.abs(entry.points);
  const iconName = getIconName(tag);

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${TAG_COLORS[tag]}`}
          >
            <DynamicIcon iconName={iconName} />
            {t(tag)}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">
          {entry.reason}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </p>
      </div>
      <div className="text-right ml-4">
        <div
          className={`font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : "-"}
          {absolutePoints}
        </div>
        <span className="text-xs text-gray-400">{t("pts")}</span>
      </div>
    </div>
  );
});

PointsEntryItem.displayName = "PointsEntryItem";
export default PointsEntryItem;
