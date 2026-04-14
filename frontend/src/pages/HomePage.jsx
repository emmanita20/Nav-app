import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore, useLocationStore, useNavigationStore, useEmergencyStore } from "../services/store";
import socketService from "../services/socket";
import apiClient from "../services/api";
import Map from "../components/Map";
import NavigationPanel from "../components/NavigationPanel";
import EmergencyButton from "../components/EmergencyButton";
import AIAssistant from "../components/AIAssistant";
import "../styles/HomePage.css";

const HomePage = () => {
  const [building, setBuilding] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);

  const { user, getCurrentUser } = useAuthStore();
  const { currentLocation, isTracking, error: locationError, startTracking, stopTracking } = useLocationStore();
  const { route, isNavigating } = useNavigationStore();
  const { activeAlert } = useEmergencyStore();

  useEffect(() => {
    getCurrentUser();
    startTracking();
    socketService.connect();

    socketService.on("location-updated", (data) => {
      setNearbyUsers((prev) => {
        const withoutDuplicate = prev.filter((item) => item.userId !== data.userId);
        return [data, ...withoutDuplicate].slice(0, 12);
      });
    });

    return () => {
      socketService.off("location-updated");
      stopTracking();
    };
  }, [getCurrentUser, startTracking, stopTracking]);

  useEffect(() => {
    if (currentLocation?.buildingId) {
      apiClient
        .get(`/buildings/${currentLocation.buildingId}`)
        .then((res) => setBuilding(res.data.building))
        .catch(() => setBuilding(null));
    } else {
      setBuilding(null);
    }
  }, [currentLocation?.buildingId]);

  const firstName = user?.firstName || "there";

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-header-content">
          <div>
            <p className="home-eyebrow">Live indoor guidance</p>
            <h1 className="home-title">Good to see you, {firstName}</h1>
          </div>
          <div className="home-header-right">
            <p className="home-building">{building?.name || "Outdoor coverage"}</p>
            <p className="home-coords">
              {currentLocation
                ? `Lat ${currentLocation.lat?.toFixed(4)}, Lng ${currentLocation.lng?.toFixed(4)}`
                : isTracking
                  ? "Waiting for location permission"
                  : "Location tracking paused"}
            </p>
            <Link className="home-profile-link" to="/profile">Profile</Link>
          </div>
        </div>
      </div>

      <div className="home-main">
        <div className="home-map">
          <Map location={currentLocation} route={route} />
          <div className="home-map-status">
            <span className={isTracking ? "status-dot status-dot-live" : "status-dot"} />
            {isTracking ? "Tracking live" : "Tracking off"}
          </div>
        </div>
        <div className="home-panel">
          {locationError && <div className="panel-notice">{locationError}</div>}
          {activeAlert && (<div className="alert-active"><h3 className="alert-title">Emergency alert active</h3><p>Status: {activeAlert.status}</p></div>)}
          {isNavigating && <NavigationPanel route={route} />}
          <AIAssistant />
          <EmergencyButton />
          <div className="stats-card">
            <h3 className="stats-title">Nearby activity</h3>
            <p className="stats-text">{nearbyUsers.length} recent location updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
