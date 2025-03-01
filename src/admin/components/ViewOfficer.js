import React, { useEffect, useState } from "react";
import "../style/Table.css";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding } from "react-icons/fa";

const ViewOfficer = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null); // State for editing officer
  const [stations, setStations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch officers and stations on mount
  useEffect(() => {
    fetchOfficers();
    fetchStations();
  }, []);

  // Fetch officers
  const fetchOfficers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch officers");
      }

      const users = await response.json();
      const policeOfficers = users.filter((user) => user.role === "Police");
      setOfficers(policeOfficers);
    } catch (error) {
      setError("Error fetching officers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stations for dropdown
  const fetchStations = async () => {
    try {
      const response = await fetch("http://localhost:8000/stations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStations(data);
      } else {
        throw new Error("Failed to fetch stations");
      }
    } catch (error) {
      console.error("Error fetching stations:", error.message);
    }
  };

  // Toggle Officer Status (Active/Inactive)
  const toggleStatus = async (officerId, currentStatus) => {
    if (updating) return;
    setUpdating(true);
    setError("");
    setSuccessMessage("");

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await fetch(`http://localhost:8000/users/${officerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update officer status");
      }

      setOfficers((prevOfficers) =>
        prevOfficers.map((officer) =>
          officer.user_id === officerId ? { ...officer, status: newStatus } : officer
        )
      );
      setSuccessMessage(`Officer status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Handle edit input changes
  const handleEditChange = (e) => {
    setEditOfficer({ ...editOfficer, [e.target.name]: e.target.value });
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8000/users/${editOfficer.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...editOfficer, role: "Police" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update officer");
      }

      setSuccessMessage("Officer updated successfully!");
      setEditOfficer(null);
      await fetchOfficers(); // Refresh officer list
    } catch (error) {
      console.error("Error updating officer:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Officer
  const handleDelete = async (officerId) => {
    if (!window.confirm("Are you sure you want to delete this officer?")) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8000/users/${officerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete officer");
      }

      setSuccessMessage("Officer deleted successfully!");
      await fetchOfficers(); // Refresh officer list
    } catch (error) {
      console.error("Error deleting officer:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit form
  const handleEdit = (officer) => {
    setEditOfficer({ ...officer, station: officer.station?._id || officer.station }); // Use station ID
  };

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">Manage Officers</h2>

        {loading ? (
          <p className="loading-text">Loading officers...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : successMessage ? (
          <p className="success-message">{successMessage}</p>
        ) : officers.length === 0 ? (
          <p className="no-data">No officers found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Officer Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Station</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.user_id}>
                    <td>{officer.user_id}</td>
                    <td>{officer.name}</td>
                    <td>{officer.email}</td>
                    <td>{officer.contact}</td>
                    <td>{officer.station?.name || "N/A"}</td>
                    <td>
                      <button
                        className={`status-btn ${officer.status === "Active" ? "active" : "inactive"}`}
                        onClick={() => toggleStatus(officer.user_id, officer.status)}
                        disabled={updating}
                      >
                        {officer.status}
                      </button>
                    </td>
                    <td className="action-buttons">
                      <button className="action-button edit-button" onClick={() => handleEdit(officer)}>
                        Edit
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDelete(officer.user_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editOfficer && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Officer</h3>
              <form className="modern-form" onSubmit={handleEditSubmit}>
                <div className="form-body">
                  {/* Officer Name */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaUser className="input-icon" />
                      <input
                        required
                        name="name"
                        value={editOfficer.name}
                        onChange={handleEditChange}
                        placeholder="Officer Name"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaEnvelope className="input-icon" />
                      <input
                        required
                        name="email"
                        value={editOfficer.email}
                        onChange={handleEditChange}
                        placeholder="Email"
                        className="form-input"
                        type="email"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaPhone className="input-icon" />
                      <input
                        required
                        name="contact"
                        value={editOfficer.contact}
                        onChange={handleEditChange}
                        placeholder="Contact Number"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaLock className="input-icon" />
                      <input
                        name="password"
                        value={editOfficer.password || ""}
                        onChange={handleEditChange}
                        placeholder="New Password (optional)"
                        className="form-input"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  {/* Police Station Selection */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaBuilding className="input-icon" />
                      <select
                        required
                        name="station"
                        value={editOfficer.station}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="">Select Police Station</option>
                        {stations.map((station) => (
                          <option key={station.station_id} value={station.station_id}>
                            {station.name} ({station.station_id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-buttons">
                  <button className="submit-button" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Officer"}
                  </button>
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() => setEditOfficer(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOfficer;