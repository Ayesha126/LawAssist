// 'use client' at the top to explicitly mark as a Client Component
'use client';

import React, { useState, useEffect } from "react";
import "../styles/Tabledash.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PDashboard = () => {
  const [userName, setUserName] = useState("");
  const [metrics, setMetrics] = useState({ activeComplaints: 0, totalFirs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Debugging function
  const debugLog = (message, data) => {
    console.log(`[DEBUG] ${message}:`, data);
  };

  // Get logged-in user's ID and role from token
  const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/login");
      return null;
    }
    try {
      const decoded = jwtDecode(token);
      if (!decoded.user_id || decoded.role !== "Police") {
        setError("Invalid user or role. Please log in as a police officer.");
        navigate("/login");
        return null;
      }
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Failed to decode user information. Please log in again.");
      navigate("/login");
      return null;
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const userData = await response.json();
      debugLog("Fetched user data", userData);
      setUserName(userData.name || "Police Officer");
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
    }
  };

  // Fetch counts for dashboard metrics
  const fetchDashboardMetrics = async (userId, stationId) => {
    try {
      const [complaintsResponse, firsResponse] = await Promise.all([
        fetch("http://localhost:8000/complaints", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("http://localhost:8000/firs", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!complaintsResponse.ok || !firsResponse.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const complaintsData = await complaintsResponse.json();
      const firsData = await firsResponse.json();

      const activeComplaints = complaintsData.filter(
        (complaint) => complaint.assigned_station?._id === stationId && complaint.status === "Active"
      ).length;
      const totalFirs = firsData.filter(
        (fir) => (fir.user?.station?._id === stationId || fir.complaint?.assigned_station?._id === stationId) && fir.status !== "Closed"
      ).length;

      setMetrics({ activeComplaints, totalFirs });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      setError(error.message);
      setMetrics({ activeComplaints: 0, totalFirs: 0 });
    }
  };

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      setLoading(false); // Ensure loading ends if no user
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(""); // Reset error

        // Fetch user details to get station
        await fetchUserDetails(user.user_id);

        // Fetch user details again to get station (consistent with prior logic)
        const userResponse = await fetch(`http://localhost:8000/users/${user.user_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!userResponse.ok) throw new Error("Failed to fetch user details for metrics");
        const userData = await userResponse.json();
        const stationId = userData.station._id;

        // Fetch metrics
        await fetchDashboardMetrics(user.user_id, stationId);
      } catch (error) {
        console.error("Error in dashboard initialization:", error);
        setError(error.message || "An error occurred while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="table-page">
        <div className="dashboard-container">
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-page">
        <div className="dashboard-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Police Dashboard</h1>
        <h2 className="welcome-text">Welcome, {userName}!</h2>

        {/* Dashboard Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Active Complaints</h3>
            <p className="metric-value">{metrics.activeComplaints}</p>
          </div>
          <div className="metric-card">
            <h3>Total FIRs</h3>
            <p className="metric-value">{metrics.totalFirs}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="dashboard-actions">
          <button className="action-button" onClick={() => handleNavigate("/view-complaint")}>
            View Complaints
          </button>
          <button className="action-button" onClick={() => handleNavigate("/add-complaint")}>
            Add Complaint
          </button>
          <button className="action-button" onClick={() => handleNavigate("/view-fir")}>
            View FIRs
          </button>
          <button className="action-button" onClick={() => handleNavigate("/add-fir")}>
            Add FIR
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDashboard;      