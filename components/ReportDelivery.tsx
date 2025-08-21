"use client";

import { useState } from "react";
import { reportDeliveryUser } from "@/services/api";

export function ReportDelivery({
  deliveryUserId,
  orderId,
  accessToken,
}: {
  deliveryUserId: string;
  orderId?: string;
  accessToken: string;
}) {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!reason.trim()) return setStatus("Please provide a reason.");
    setSubmitting(true);
    setStatus(null);
    try {
      const { warningsCount, isBlocked } = await reportDeliveryUser({
        deliveryUserId,
        orderId,
        reason: reason.trim(),
        accessToken,
      });
      setStatus(
        isBlocked
          ? "Reported. User is now blocked."
          : `Reported. Warnings: ${warningsCount}`
      );
      setReason("");
    } catch (e: any) {
      setStatus(e?.response?.data?.message || "Failed to file report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason..."
        className="w-full p-2 border rounded"
      />
      <button
        onClick={onSubmit}
        disabled={submitting}
        className="px-3 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {submitting ? "Reporting..." : "Report delivery"}
      </button>
      {status && <div className="text-sm">{status}</div>}
    </div>
  );
}


