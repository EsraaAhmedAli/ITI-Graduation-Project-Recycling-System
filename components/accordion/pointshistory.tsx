// Memoized modal component

import { useUserAuth } from "@/context/AuthFormContext";
import { memo, useCallback, useEffect, useState } from "react";
import { PointsEntry } from "../Types/points.type";
import api from "@/lib/axios";
import { Calendar, X } from "lucide-react";
import PointsEntryItem from "./PointsEntryItem";
import Pagination from "../common/Pagintaion";
import Loader from "../common/Loader";

const PointsHistoryModal = memo(
  ({
    isOpen,
    onClose,
    t,
  }: {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
  }) => {
    const { user } = useUserAuth();
    const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([]);
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
        loadPointsHistory(1);
      }
    }, [isOpen, loadPointsHistory]);

    const handlePageChange = useCallback(
      (page: number) => {
        setCurrentPage(page);
        loadPointsHistory(page);
      },
      [loadPointsHistory]
    );

    useEffect(() => {
      if (!isOpen) {
        setCurrentPage(1);
      }
    }, [isOpen]);

    // Memoize backdrop click handler
    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      },
      [onClose]
    );

    if (!isOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={handleBackdropClick}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
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

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center">
                <Loader fullScreen={false} />
              </div>
            ) : (
              <div className="space-y-4">
                {pointsHistory.map((entry) => (
                  <PointsEntryItem key={entry._id} entry={entry} t={t} />
                ))}

                {pointsHistory.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {t("noPointsHistory")}
                  </p>
                )}
              </div>
            )}
          </div>

          <Pagination
            pagination={{
              currentPage,
              totalPages,
              hasNextPage: currentPage < totalPages,
              hasPreviousPage: currentPage > 1,
            }}
            onPageChange={handlePageChange}
            pageGroupSize={3} // optional, default = 5
          />
        </div>
      </div>
    );
  }
);

PointsHistoryModal.displayName = "PointsHistoryModal";
export default PointsHistoryModal;
