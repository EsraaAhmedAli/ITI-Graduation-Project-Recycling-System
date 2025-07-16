// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ✅ send refreshToken cookie
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
  console.log("📦 Access token set");
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log(`📥 Sending request to ${config.url} with ${token}`);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("📤 Sending request with token:", config.url);
  }
  return config;
});

// Avoid circular import by lazy requiring
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as any;
    console.log("originale => ", original);

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/refresh")
    ) {
      original._retry = true;
      console.warn("🔁 Token expired. Attempting refresh...");

      try {
        const { refreshAccessToken } = await import("./auth");
        const { accessToken: newToken } = await refreshAccessToken();

        console.info("✅ Token refreshed successfully");
        setAccessToken(newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        console.error("❌ Token refresh failed. Logging out...");
        // Optionally: redirect to login or throw error
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
