import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // very important to send cookies (refresh token)
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers["x-access-token"];
    if (newToken) {
      localStorage.setItem("token", newToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Global blocked user redirect
    if (error?.response?.status === 403) {
      const message = error?.response?.data?.message || "";
      if (/blocked/i.test(message) && typeof window !== "undefined") {
        window.location.assign("/blocked");
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/auth/refresh`,
          {
            withCredentials: true,
          }
        );

        const newToken = response.data.accessToken;
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        // Optional: redirect to login page here
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// === Reports & Block Management APIs ===
export async function reportDeliveryUser({
  deliveryUserId,
  reason,
  orderId,
  accessToken,
}: {
  deliveryUserId: string;
  reason: string;
  orderId?: string;
  accessToken: string;
}) {
  const res = await api.post(
    `/reports/delivery/${deliveryUserId}`,
    { reason, orderId },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const { warningsCount, user, message } = res.data;
  return {
    warningsCount: warningsCount ?? 0,
    isBlocked: Boolean(user?.isBlocked),
    message,
  };
}

export async function fetchBlockedUsers({
  page = 1,
  limit = 20,
  search,
  role = "delivery",
  accessToken,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "delivery" | "customer" | "buyer" | "admin";
  accessToken: string;
}) {
  const res = await api.get("/users/blocked", {
    params: { page, limit, search, role },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function unblockUser({
  userId,
  accessToken,
}: {
  userId: string;
  accessToken: string;
}) {
  const res = await api.post(
    `/users/${userId}/unblock`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.data;
}
