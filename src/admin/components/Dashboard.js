import React from "react";
import "../style/Dashboard.css";
import { FiFileText, FiClock, FiCheckCircle, FiUsers } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const Dashboard = () => {
  const firData = {
    total: 120,
    pending: 45,
    inProgress: 30,
    resolved: 45,
  };

  const recentFIRs = [
    { id: 101, complainant: "John Doe", status: "Pending" },
    { id: 102, complainant: "Alice Smith", status: "In Progress" },
    { id: 103, complainant: "Michael Brown", status: "Resolved" },
  ];

  const chartData = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "FIR Status",
        data: [firData.pending, firData.inProgress, firData.resolved],
        backgroundColor: ["#ffcc00", "#3498db", "#2ecc71"],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats">
        <div className="card">
          <FiFileText className="icon" />
          <h3>Total FIRs</h3>
          <p>{firData.total}</p>
        </div>
        <div className="card pending">
          <FiClock className="icon" />
          <h3>Pending</h3>
          <p>{firData.pending}</p>
        </div>
        <div className="card resolved">
          <FiCheckCircle className="icon" />
          <h3>Resolved</h3>
          <p>{firData.resolved}</p>
        </div>
        <div className="card online">
          <FiUsers className="icon" />
          <h3>Officers Online</h3>
          <p>12</p>
        </div>
      </div>

      {/* Charts & Recent FIRs */}
      <div className="dashboard-content">
        <div className="chart-card">
          <h3>FIR Status Overview</h3>
          <Bar data={chartData} />
        </div>

        <div className="recent-firs">
          <h3>Recent FIRs</h3>
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Complainant</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentFIRs.map((fir) => (
                <tr key={fir.id}>
                  <td>{fir.id}</td>
                  <td>{fir.complainant}</td>
                  <td>
                    <span className={`status ${fir.status.toLowerCase()}`}>
                      {fir.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
