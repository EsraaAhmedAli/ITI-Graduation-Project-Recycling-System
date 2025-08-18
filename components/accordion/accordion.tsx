"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  X,
  Gift,
  Plus,
  Award,
  Minus,
  Calendar,
  Eye,
} from "lucide-react";
import { useUserAuth } from "@/context/AuthFormContext";
import api from "@/lib/axios";
import { useLanguage } from "@/context/LanguageContext";
import Pagination from "../common/Pagintaion";

// Function to categorize based on message content
const categorizeEntry = (reason: string, points: number) => {
  const message = reason.toLowerCase();

  if (message.includes("cashback")) {
    return "cashback";
  } else if (message.includes("redeem") || message.includes("voucher")) {
    return "redeem";
  } else if (
    message.includes("bonus") ||
    message.includes("welcome") ||
    message.includes("referral")
  ) {
    return "bonus";
  } else if (
    message.includes("deduct") ||
    message.includes("return") ||
    points < 0
  ) {
    return "deduct";
  } else if (
    message.includes("earn") ||
    message.includes("purchase") ||
    message.includes("survey") ||
    points > 0
  ) {
    return "earn";
  }

  return "earn"; // default fallback
};

const getTagColor = (tag: string) => {
  const colors = {
    redeem: "bg-purple-100 text-purple-800 border-purple-200",
    cashback: "bg-orange-100 text-orange-800 border-orange-200",
    earn: "bg-green-100 text-green-800 border-green-200",
    bonus: "bg-blue-100 text-blue-800 border-blue-200",
    deduct: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    colors[tag as keyof typeof colors] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

const getTagIcon = (tag: string) => {
  const icons = {
    redeem: Gift,
    cashback: Gift,
    earn: Plus,
    bonus: Award,
    deduct: Minus,
  };
  const Icon = icons[tag as keyof typeof icons] || Plus;
  return <Icon className="w-3 h-3" />;
};

const PointsHistoryModal = ({
  isOpen,
  onClose,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) => {
  const { user } = useUserAuth();
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3;

  const loadPointsHistory = useCallback(
    async (page: number = 1) => {
      if (!user?._id || !isOpen) return;

      setLoading(true);
      try {
        const response = await api.get(`/users/${user._id}/points`, {
          params: { page, limit: itemsPerPage },
        });
        const data = response.data.data;
        setPointsHistory(data.pointsHistory);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error("Failed to load points history", err);
        setPointsHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [user?._id, isOpen, itemsPerPage]
  );

  useEffect(() => {
    if (isOpen) {
      loadPointsHistory(1); // load first page when modal opens
    }
  }, [isOpen, loadPointsHistory]); // run only when modal opens

  // for user changing pages
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPointsHistory(page);
  };
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  if (!isOpen) {
    // setCurrentPage(1);
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            {t("pointsHistory")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">{t("loading")}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pointsHistory.map((entry: any, index: number) => {
                const tag = categorizeEntry(entry.reason, entry.points);

                return (
                  <div
                    key={entry._id || index}
                    className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTagColor(
                              tag
                            )}`}
                          >
                            {getTagIcon(tag)}
                            {t(tag)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {entry.reason}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-lg ${
                            entry.points > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {entry.points > 0 ? "+" : "-"}
                          {Math.abs(entry.points)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {t("pts")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pointsHistory.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-8">
                  {t("noPointsHistory")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}

        <Pagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default function PointsActivity({
  userPoints,
  userPointsLength,
}: {
  userPoints?: any;
  userPointsLength?: any;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!userPoints || !userPoints.pointsHistory?.length) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t("noActivity")}</p>
        </div>
      </div>
    );
  }

  const recentEntries = userPoints.pointsHistory.slice(0, 3);

  return (
    <>
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg border border-white/50 backdrop-blur-sm">
        {/* Accordion header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
              <Calendar className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {t("recentPointsActivity")}
            </h3>
          </div>
          <ChevronDown
            className={`w-6 h-6 text-gray-600 transition-all duration-300 group-hover:text-gray-800 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Accordion content */}
        {isOpen && (
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              {recentEntries.map((entry: any, index: number) => {
                const tag = categorizeEntry(entry.reason, entry.points);

                return (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getTagColor(
                              tag
                            )}`}
                          >
                            {getTagIcon(tag)}
                            {t(tag)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {entry.reason}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-lg ${
                            entry.points > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {entry.points > 0 ? "+" : "-"}
                          {Math.abs(entry.points)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {t("pts")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View Full History Button */}
            {userPoints.pointsHistory.length > 3 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-lime-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {t("viewFullHistory")}
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {userPointsLength} items
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <PointsHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        t={t}
      />
    </>
  );
}
