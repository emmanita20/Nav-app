import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { FiPhoneCall, FiMapPin, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import "../styles/StaffDashboard.css";

const StaffDashboard = () => {
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [onDutyUsers, setOnDutyUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmergencyAlerts();
    fetchOnDutyUsers();

    const interval = setInterval(() => {
      fetchEmergencyAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyAlerts = async () => {
    try {
      const response = await apiClient.get("/emergency/alerts?status=active");
      setEmergencyAlerts(response.data.alerts || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load emergency alerts");
    }
  };

  const fetchOnDutyUsers = async () => {
    try {
      const response = await apiClient.get("/staff/on-duty/list");
      setOnDutyUsers(response.data.responders || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load responders");
    }
  };

  const handleAssignResponder = async (alertId, responderId) => {
    try {
      await apiClient.post(`/emergency/alerts/${alertId}/assign-responder`, { responderId });
      fetchEmergencyAlerts();
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to assign responder");
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Staff Dashboard</h1>
      {error && <p className="panel-notice">{error}</p>}
      <div className="dashboard-grid">
        <div className="dashboard-col-2">
          <div className="dashboard-card">
            <h2 className="dashboard-card-title"><FiAlertCircle className="dashboard-icon-danger" /> Active Emergency Alerts</h2>
            {emergencyAlerts.length === 0 ? (<p className="dashboard-empty">No active alerts</p>) : (<div className="dashboard-alerts">{emergencyAlerts.map((alert) => (<div key={alert._id} className="alert-item"><div className="alert-header"><h3 className="alert-name">{alert.userId?.firstName} {alert.userId?.lastName}</h3><span className="alert-badge">{alert.alertType.toUpperCase()}</span></div><div className="alert-details"><p className="alert-detail-item"><FiMapPin size={16} /> Floor: {alert.location?.floor || "Unknown"}</p><p className="alert-detail-item"><FiPhoneCall size={16} />{alert.userId?.phone}</p></div><div className="alert-actions">{onDutyUsers.map((responder) => (<button key={responder._id} onClick={() => handleAssignResponder(alert._id, responder._id)} className="btn btn-assign">Assign to {responder.firstName}</button>))}</div></div>))}</div>)}
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-card-title">On Duty Responders</h2>
          {onDutyUsers.length === 0 ? (<p className="dashboard-empty">No responders on duty</p>) : (<div className="responder-list">{onDutyUsers.map((responder) => (<div key={responder._id} className="responder-item"><p className="responder-name">{responder.firstName} {responder.lastName}</p>{responder.currentLocation && (<p className="responder-floor"><FiMapPin className="icon-small" size={12} /> Floor {responder.currentLocation.floor}</p>)}</div>))}</div>)}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
