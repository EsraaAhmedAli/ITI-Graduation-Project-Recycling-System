import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ✅ Send refreshToken cookie
});

// === Access Token Management ===
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
// In lib/axios.ts
export const refreshAccessToken = async (): Promise<{ accessToken: string }> => {
  const response = await api.post("/auth/refresh");
  const { accessToken } = response.data;
  if (!accessToken) {
    throw new Error("No access token returned");
  }
  return { accessToken };
};
export const getAccessToken = () => accessToken;

// === Session ID (from localStorage or cookie) ===
const getSessionId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sessionId") ?? null;
};

// === Refresh Token Locking ===
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// === Request Interceptor ===
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const sessionId = getSessionId();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (sessionId && config.headers) {
    config.headers["x-session-id"] = sessionId;
  }

  return config;
});

// === Response Interceptor ===
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as any;

    const status = error.response?.status;
    const message = error.response?.data?.message;

    // Skip refresh logic for these:
    if (
      !original ||
      original._retry ||
      original.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // === Handle Access Token Expiry ===
    if (status === 401) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      console.warn("🔁 Token expired. Attempting refresh...");

      try {
        const { accessToken: newToken } = await refreshAccessToken();
        console.info("✅ Token refreshed");

        setAccessToken(newToken);
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        console.error("❌ Token refresh failed. Logging out...");
        processQueue(refreshErr, null);

        localStorage.removeItem("sessionId");
        setAccessToken(null);
        // Optional: redirect to login or trigger logout event
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // === Handle Invalid Session ===
    if (status === 403 && message === "Invalid session") {
      console.warn("⚠️ Session invalidated. Cleaning up...");
      localStorage.removeItem("sessionId");
      // Optional: redirect to home/login
    }

    return Promise.reject(error);
  }
);


export default api;
