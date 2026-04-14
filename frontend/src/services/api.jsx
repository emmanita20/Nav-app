import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      [401, 403].includes(error.response?.status) &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          localStorage.setItem("accessToken", response.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.dispatchEvent(new Event("navi-auth-expired"));
          window.location.assign("/login");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
