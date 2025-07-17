import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Essential for cookies
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => {
    // Your backend doesn't send tokens in response headers during normal requests
    // Only during refresh, so we don't need to check for x-access-token here
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 401 error detected, attempting token refresh');
      
      if (isRefreshing) {
        console.log('🔄 Already refreshing, queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Calling refresh endpoint...');
        
        // Call your refresh endpoint
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {
            withCredentials: true, // This is crucial for sending the refresh token cookie
          }
        );

        const newToken = response.data.accessToken;
        
        if (!newToken) {
          throw new Error("No access token received from refresh endpoint");
        }

        console.log('✅ Token refresh successful');
        
        // Update localStorage and axios headers
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Process all queued requests
        processQueue(null, newToken);

        // Retry the original request
        return api(originalRequest);
        
      } catch (err) {
        console.error('❌ Token refresh failed:', err);
        
        // Clear everything on refresh failure
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        
        // Trigger logout across the app
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;