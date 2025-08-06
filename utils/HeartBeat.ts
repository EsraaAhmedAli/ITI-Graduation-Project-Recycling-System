// utils/heartbeat.ts

import api from "@/lib/axios";

let heartbeatInterval: NodeJS.Timeout | null = null;

export const startHeartbeat = () => {
  if (heartbeatInterval) return; // avoid duplicates

  heartbeatInterval = setInterval(() => {
    const lastActive = localStorage.getItem("lastActive");

    const TEN_MINUTES = 10 * 60 * 1000;
    const isUserActiveRecently =
      lastActive && Date.now() - new Date(lastActive).getTime() < TEN_MINUTES;

    if (isUserActiveRecently) {
      api
        .post("/tracking/heartbeat")
        .catch((err) => console.error("Heartbeat failed:", err));
    }
  }, 5 * 60 * 1000); // every 5 minutes
};

export const setupActivityListeners = () => {
  const updateActivity = () => {
    localStorage.setItem("lastActive", new Date().toISOString());
  };

  window.addEventListener("click", updateActivity);
  window.addEventListener("mousemove", updateActivity);
  window.addEventListener("keydown", updateActivity);
  window.addEventListener("scroll", updateActivity);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") updateActivity();
  });
};
