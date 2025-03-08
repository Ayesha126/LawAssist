import React, { useEffect, useState } from "react";
import "../style/dashboard copy.css"; // Assuming this is the correct path

const ADashboard = () => {
  const [stats, setStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    totalStations: 0,
    totalSections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch officers
        const officersResponse = await fetch("http://localhost:8000/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!officersResponse.ok) throw new Error("Failed to fetch officers");
        const officers = await officersResponse.json();
        const policeOfficers = officers.filter((user) => user.role === "Police");

        // Fetch stations
        const stationsResponse = await fetch("http://localhost:8000/stations", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!stationsResponse.ok) throw new Error("Failed to fetch stations");
        const stations = await stationsResponse.json();

        // Fetch sections
        const sectionsResponse = await fetch("http://localhost:8000/ipc-sections", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!sectionsResponse.ok) throw new Error("Failed to fetch sections");
        const sections = await sectionsResponse.json();

        setStats({
          totalOfficers: policeOfficers.length,
          activeOfficers: policeOfficers.filter((o) => o.status === "Active").length,
          totalStations: stations.length,
          totalSections: sections.length,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>
            Admin Control Panel <span className="highlight">LawAssist</span>
          </h1>
          <p>Monitor and Manage Police Operations</p>
        </div>
        <div className="hero-image">
          <img src='' alt="Admin control panel" />
        </div>
      </div>

      {/* Reports Section */}
      <div className="reports-section">
        {loading ? (
          <p className="loading-text">Loading statistics...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="report-card">
              <h3>Total Officers</h3>
              <p className="report-value">{stats.totalOfficers}</p>
              <p className="report-detail">Active: {stats.activeOfficers}</p>
            </div>

            <div className="report-card">
              <h3>Total Stations</h3>
              <p className="report-value">{stats.totalStations}</p>
              <p className="report-detail">Operational stations</p>
            </div>

            <div className="report-card">
              <h3>Total IPC Sections</h3>
              <p className="report-value">{stats.totalSections}</p>
              <p className="report-detail">Legal frameworks</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ADashboard;