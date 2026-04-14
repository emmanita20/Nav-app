import React, { useState, useEffect } from "react";
import { useAuthStore } from "../services/store";
import apiClient from "../services/api";
import "../styles/AdminDashboard.css";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [emergencyAnalytics, setEmergencyAnalytics] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [roomVisits, setRoomVisits] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setError("");
      const [dashboard, emergency, peak, rooms] = await Promise.all([
        apiClient.get("/admin/dashboard"),
        apiClient.get("/analytics/emergency-analytics"),
        apiClient.get("/analytics/peak-hours"),
        apiClient.get("/analytics/room-analytics"),
      ]);
      setDashboardData(dashboard.data.dashboard);
      setEmergencyAnalytics(emergency.data.emergencyAnalytics);
      setPeakHours(peak.data.peakHours);
      setRoomVisits(rooms.data.analytics);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load admin dashboard");
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      {error && <p className="panel-notice">{error}</p>}
      <div className="admin-kpi-grid">
        <div className="kpi-card"><h3 className="kpi-label">Total Buildings</h3><p className="kpi-value kpi-blue">{dashboardData?.totalBuildings}</p></div>
        <div className="kpi-card"><h3 className="kpi-label">Staff Members</h3><p className="kpi-value kpi-green">{dashboardData?.totalStaff}</p></div>
        <div className="kpi-card"><h3 className="kpi-label">Active Users</h3><p className="kpi-value kpi-purple">{dashboardData?.totalUsers}</p></div>
        <div className="kpi-card"><h3 className="kpi-label">Emergency Alerts</h3><p className="kpi-value kpi-red">0</p></div>
      </div>

      <div className="admin-chart-grid">
        <div className="admin-chart-card"><h2 className="admin-chart-title">Peak Hours</h2><ResponsiveContainer width="100%" height={300}><LineChart data={peakHours || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Line type="monotone" dataKey="count" stroke="#8884d8" /></LineChart></ResponsiveContainer></div>
        <div className="admin-chart-card"><h2 className="admin-chart-title">Emergency Types</h2><ResponsiveContainer width="100%" height={300}><BarChart data={emergencyAnalytics || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="_id" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#ef4444" /></BarChart></ResponsiveContainer></div>
        <div className="admin-chart-card admin-chart-full"><h2 className="admin-chart-title">Most Visited Rooms</h2><ResponsiveContainer width="100%" height={300}><BarChart data={roomVisits || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="roomId" /><YAxis /><Tooltip /><Bar dataKey="visitCount" fill="#3b82f6" /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};

export default AdminDashboard;
