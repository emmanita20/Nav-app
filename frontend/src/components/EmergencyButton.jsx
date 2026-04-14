import React, { useState } from "react";
import { useEmergencyStore } from "../services/store";
import { FiAlertCircle } from "react-icons/fi";
import "../styles/EmergencyButton.css";

const EmergencyButton = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const { triggerSOS, activeAlert } = useEmergencyStore();

  const handleSOSClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 5000);
    } else {
      handleConfirmSOS();
    }
  };

  const handleConfirmSOS = async () => {
    setIsPressed(true);
    setError("");
    try {
      await triggerSOS("medical", "Emergency assistance needed");
      setShowConfirm(false);
    } catch (err) {
      setError(typeof err === "string" ? err : "Unable to send SOS");
    } finally {
      setIsPressed(false);
    }
  };

  return (
    <div className="emergency-container">
      {activeAlert ? (
        <div className="emergency-active">
          <p className="emergency-active-text">Emergency Active</p>
          <p className="emergency-active-status">Status: {activeAlert.status}</p>
        </div>
      ) : null}

      <button
        onClick={handleSOSClick}
        className={`emergency-btn ${isPressed ? "emergency-pressed" : ""} ${showConfirm ? "emergency-confirm" : ""}`}
      >
        <FiAlertCircle size={24} />
        {showConfirm ? "CONFIRM SOS" : "EMERGENCY SOS"}
      </button>

      {showConfirm && (
        <p className="emergency-confirm-text">Tap again to confirm emergency alert</p>
      )}
      {error && <p className="emergency-error">{error}</p>}
    </div>
  );
};

export default EmergencyButton;
