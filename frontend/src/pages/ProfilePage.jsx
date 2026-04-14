import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../services/store";
import apiClient from "../services/api";
import "../styles/HomePage.css";

const ProfilePage = () => {
  const { user, getCurrentUser, logout } = useAuthStore();
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");

        if (!user) {
          await getCurrentUser();
        }

        const res = await apiClient.get("/navigation/saved-routes");
        setRoutes(res.data.routes || []);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load profile data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, getCurrentUser]);

  const handleLogout = () => {
    logout();
    window.location.assign("/login");
  };

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Not provided";

  return (
    <div className="dashboard-container">
      <div className="dashboard-topbar">
        <div>
          <p className="home-eyebrow">Account center</p>
          <h1 className="dashboard-title">My Profile</h1>
        </div>
        <Link className="home-profile-link" to="/home">Back to map</Link>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Account</h2>
          {user ? (
            <>
              <p>
                <strong>Name:</strong> {displayName}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role || "user"}
              </p>
            </>
          ) : (
            <p className="dashboard-empty">No user details available.</p>
          )}

          <button onClick={handleLogout} className="btn btn-danger btn-full">
            Logout
          </button>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Recent Routes</h2>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-danger">{error}</p>}
          {!isLoading && !error && routes.length === 0 && (
            <p className="dashboard-empty">
              You have no recent navigation history yet.
            </p>
          )}
          {!isLoading && !error && routes.length > 0 && (
            <ul className="nav-list">
              {routes.map((route) => (
                <li key={route._id} className="nav-item">
                  <p className="nav-item-text">
                    {route.startRoomId?.roomName || "Start"} to{" "}
                    {route.endRoomId?.roomName || "End"}
                  </p>
                  <p className="stats-text">
                    Distance: {Math.round(route.totalDistance || 0)} m
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
