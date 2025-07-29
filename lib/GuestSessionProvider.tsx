"use client";

import { useEffect } from "react";
import api from "@/lib/axios";

export default function GuestSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const ensureGuestSession = async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        try {
          const res = await api.post("/sessions/guest");
          localStorage.setItem("sessionId", res.data.sessionId);
          console.log("🆕 Guest session created:", res.data.sessionId);
        } catch (err) {
          console.error("❌ Failed to create guest session", err);
        }
      }
    };

    ensureGuestSession();
  }, []);

  return <>{children}</>;
}
