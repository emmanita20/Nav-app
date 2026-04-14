import { create } from "zustand";
import apiClient from "../services/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      set({ user, accessToken, refreshToken, isLoading: false });
      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || "Login failed";
      set({ error, isLoading: false });
      throw error;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/signup", userData);
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      set({ user, accessToken, refreshToken, isLoading: false });
      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || "Signup failed";
      set({ error, isLoading: false });
      throw error;
    }
  },

  sendOtp: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/send-otp", { phone });
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || "Unable to send OTP";
      set({ error, isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (phone, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/verify-otp", { phone, otp });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      set({ user, accessToken, refreshToken, isLoading: false });
      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || "OTP verification failed";
      set({ error, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      set({ user: response.data.user });
      return response.data.user;
    } catch (err) {
      set({ user: null });
      return null;
    }
  },
}));

export const useLocationStore = create((set, get) => ({
  currentLocation: null,
  isTracking: false,
  watchId: null,
  error: null,

  updateLocation: async (lat, lng) => {
    try {
      const response = await apiClient.post("/gps/update-location", { lat, lng });
      set({ currentLocation: response.data.location, error: null });
      return response.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.error ||
          err.message ||
          "Unable to update location",
      });
      return null;
    }
  },

  startTracking: () => {
    if (get().watchId !== null) return;

    if (!("geolocation" in navigator)) {
      set({ error: "Geolocation is not available in this browser" });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        get().updateLocation(latitude, longitude);
      },
      (error) => {
        set({
          isTracking: false,
          error: error.message || "Location permission is required",
        });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    );

    set({ isTracking: true, watchId, error: null });
  },

  stopTracking: () => {
    const { watchId } = get();
    if (watchId !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId);
    }
    set({ isTracking: false, watchId: null });
  },
}));

export const useNavigationStore = create((set, get) => ({
  route: null,
  isNavigating: false,
  directions: [],

  findRoute: async (startRoomId, endRoomId, algorithm = "astar") => {
    try {
      const response = await apiClient.post("/navigation/find-route", { startRoomId, endRoomId, algorithm });
      set({ route: response.data.route, directions: response.data.route.directions, isNavigating: true });
      return response.data.route;
    } catch (err) {
      return null;
    }
  },

  stopNavigation: () => { set({ route: null, isNavigating: false, directions: [] }); },
}));

export const useEmergencyStore = create((set, get) => ({
  activeAlert: null,
  alerts: [],

  triggerSOS: async (alertType = "medical", description = "") => {
    try {
      const response = await apiClient.post("/emergency/sos", { alertType, description });
      set({ activeAlert: response.data.alert });
      return response.data.alert;
    } catch (err) {
      throw err.response?.data?.error || err.message || "Unable to send SOS";
    }
  },

  getAlerts: async () => {
    try {
      const response = await apiClient.get("/emergency/user-alerts");
      set({ alerts: response.data.alerts });
      return response.data.alerts;
    } catch (err) {
      return [];
    }
  },
}));
