"use client";
import React, { memo, useState, useCallback, useMemo } from "react";
import { ChevronDown, Calendar, Eye } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PointsEntryItem from "./PointsEntryItem";
import PointsHistoryModal from "./pointshistory";
import type { UserPoints } from "@/components/Types/points.type";
import { useUserPoints } from "@/context/UserPointsContext";

// interface PointsActivityProps {
//   userPoints?: UserPoints;
//   userPointsLength?: number;
// }

const PointsActivity = memo(() => {
  const { userPoints, totalPointsHistoryLength: userPointsLength } =
    useUserPoints();

  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleAccordion = useCallback(() => setIsOpen((prev) => !prev), []);
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const { recentEntries, hasNoActivity, showFullHistoryButton } =
    useMemo(() => {
      const entries = userPoints?.pointsHistory || [];
      return {
        recentEntries: entries.slice(0, 3),
        hasNoActivity: userPointsLength === 0,
        showFullHistoryButton: userPointsLength > 3,
      };
    }, [userPoints?.pointsHistory, userPointsLength]);

  if (hasNoActivity) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">{t("noActivity")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-gray-200">
        <button
          onClick={toggleAccordion}
          className="w-full flex items-center justify-between"
          aria-expanded={isOpen}
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-4 h-4 text-green-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {t("recentPointsActivity")}
            </h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="mt-4 space-y-3">
            {recentEntries.map((entry) => (
              <PointsEntryItem key={entry._id} entry={entry} t={t} />
            ))}

            {showFullHistoryButton && (
              <button
                onClick={openModal}
                className="w-full mt-3 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
                type="button"
              >
                <Eye />
                {t("viewFullHistory")}
                {userPointsLength && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {userPointsLength}
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <PointsHistoryModal isOpen={isModalOpen} onClose={closeModal} t={t} />
      )}
    </>
  );
});

PointsActivity.displayName = "PointsActivity";
export default PointsActivity;
