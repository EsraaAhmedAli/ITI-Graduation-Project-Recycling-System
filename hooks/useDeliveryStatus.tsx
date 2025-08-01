"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/AuthFormContext";
import api from "@/lib/axios";

export const useDeliveryStatus = () => {
  const { user, setUser } = useUserAuth();
  const router = useRouter();

  const refreshDeliveryStatus = useCallback(async () => {
    if (!user || user.role !== "delivery") return;

    try {
      console.log("🚚 Refreshing delivery status for:", user.email);

      const res = await api.get("/delivery-status");
      const { deliveryStatus, user: latestUser } = res.data;

      // 🔍 Compare specific keys only to prevent infinite loop
      const keysToCompare = ["isApproved", "declineReason", "declinedAt", "canReapply"];
      let hasChanges = false;

      for (const key of keysToCompare) {
        if (user[key] !== latestUser[key]) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) {
        console.log("♻️ Updating user context with new status.");
        setUser({ ...user, ...latestUser });
      }

      return deliveryStatus;
    } catch (error) {
      console.error("❌ Failed to refresh delivery status:", error);
    }
  }, [user, setUser]);

  // 📌 Auto-refresh on focus or mount
  useEffect(() => {
    if (user?.role === "delivery") {
      const handleFocus = () => {
        refreshDeliveryStatus();
      };

      window.addEventListener("focus", handleFocus);
      refreshDeliveryStatus(); // initial load

      return () => {
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, [user?.role, refreshDeliveryStatus]);

  // ✅ Auto-redirect if newly approved
  useEffect(() => {
    if (user?.role === "delivery" && user?.isApproved) {
      router.push("/delivery/dashboard");
    }
  }, [user?.isApproved, user?.role, router]);
};
