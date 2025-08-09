"use client";
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CancelOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const cancelReasons = [
  "Changed my mind",
  "Found a better option",
  "Emergency came up",
  "Scheduling conflict",
  "Other"
];

export function CancelOrderDialog({ open, onClose, onConfirm, isLoading = false }: CancelOrderDialogProps) {
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Cancel Order</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel this order? Please let us know why you're canceling.
        </p>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation:
          </label>
          <div className="space-y-2">
            {cancelReasons.map((reason) => (
              <label key={reason} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="text-gray-700">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Other" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tell us more about why you're canceling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (!selectedReason || (selectedReason === "Other" && !customReason.trim()))}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Canceling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
