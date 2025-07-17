import axios from "axios";


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ✅ send refreshToken cookie
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  // Request error
  return Promise.reject(error);
});

// Avoid circular import by lazy requiring
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!original) {
      // If no config is present, just reject
      console.error("⚠️ No request config found on error:", error);
      return Promise.reject(error);
    }


    // Check if error is 401 and retry not done yet
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/refresh")
    ) {
      original._retry = true;
      console.warn("🔁 Token expired. Attempting to refresh token...");

      try {
        const { refreshAccessToken } = await import("./auth");
        const { accessToken: newToken } = await refreshAccessToken();

        if (!newToken) {
          throw new Error("No new access token returned from refresh");
        }

        console.info("✅ Token refreshed successfully");

        // Update token in memory and header
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;

        // Retry original request with new token
        return api(original);
      } catch (refreshErr) {
        console.error("❌ Token refresh failed. Logging out...", refreshErr);
        // Optionally trigger logout here if you have it
        // For example: import { logout } from "./auth"; logout();

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
