import React, { useEffect, useState } from "react";
import "../styles/Table.css"; // Ensure this CSS file supports the modal and new buttons
import { jwtDecode } from "jwt-decode";

const ViewFirs = () => {
  const [firs, setFirs] = useState([]);
  const [stations, setStations] = useState({});
  const [citizens, setCitizens] = useState({});
  const [officers, setOfficers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Added for success feedback
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [userStationId, setUserStationId] = useState(null);
  const [editFir, setEditFir] = useState(null); // State for editing FIR

  // Debugging function
  const debugLog = (message, data) => {
    console.log(`[DEBUG] ${message}:`, data);
  };

  // Get logged-in user's ID from token
  const getLoggedInUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not authenticated. Please log in.");
      return null;
    }
    try {
      const decoded = jwtDecode(token);
      if (!decoded.user_id) {
        setError("User ID not found in token. Contact admin.");
        return null;
      }
      return decoded.user_id;
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Failed to decode user information. Please log in again.");
      return null;
    }
  };

  // Fetch user details to get station
  const fetchUserDetails = async (userId) => {
    if (!userId) return;
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
      if (!userData.station?._id) throw new Error("User station not found");
      setUserStationId(userData.station._id);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
    }
  };

  // Fetch all stations
  const fetchStations = async () => {
    try {
      const response = await fetch("http://localhost:8000/stations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stations");
      const data = await response.json();
      const stationLookup = data.reduce((acc, station) => ({
        ...acc,
        [station._id]: station,
        [station.station_id]: station,
      }), {});
      setStations(stationLookup);
      debugLog("Fetched stations", stationLookup);
    } catch (error) {
      console.error("Error fetching stations:", error);
      setError(error.message);
    }
  };

  // Fetch all citizens
  const fetchCitizens = async () => {
    try {
      const response = await fetch("http://localhost:8000/citizen", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch citizens");
      const data = await response.json();
      const citizenLookup = data.reduce((acc, citizen) => ({
        ...acc,
        [citizen._id]: citizen,
        [citizen.c_id]: citizen,
      }), {});
      setCitizens(citizenLookup);
      debugLog("Fetched citizens", citizenLookup);
    } catch (error) {
      console.error("Error fetching citizens:", error);
      setError(error.message);
    }
  };

  // Fetch all FIRs
  const fetchFirs = async () => {
    if (!userStationId) return;
    try {
      const response = await fetch("http://localhost:8000/firs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch FIRs: ${response.status}`);
      const data = await response.json();
      debugLog("Raw FIRs data", data);

      const filteredFirs = data
        .map((fir) => {
          const userStation = fir.user?.station?._id || fir.user?.station;
          const complaintStation =
            fir.complaint?.assigned_station?._id || fir.complaint?.assigned_station;
          return String(userStation) === String(userStationId) ||
            String(complaintStation) === String(userStationId)
            ? fir
            : null;
        })
        .filter((fir) => fir !== null);
      debugLog("Filtered FIRs", filteredFirs);
      setFirs(filteredFirs);

      await Promise.all([
        ...filteredFirs.map((fir) => fir.user && fetchOfficerById(fir.user.user_id || fir.user)),
      ]);
    } catch (error) {
      console.error("Error fetching FIRs:", error);
      setError(error.message);
    }
  };

  // Fetch officer by user_id
  const fetchOfficerById = async (userId) => {
    if (!userId || officers[userId]) return;
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch officer ${userId}`);
      const officerData = await response.json();
      debugLog(`Fetched officer ${userId}`, officerData);
      setOfficers((prev) => ({ ...prev, [officerData.user_id]: officerData }));
    } catch (error) {
      console.error(`Error fetching officer with ID ${userId}:`, error);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get station name
  const getStationName = (fir) => {
    if (fir.complaint) {
      return stations[fir.complaint.assigned_station]?.name || "Loading...";
    }
    return stations[officers[fir.user?.user_id || fir.user]?.station?._id]?.name || "Loading...";
  };

  // Get citizen name
  const getCitizenName = (citizen) => {
    const citizenId = typeof citizen === "object" ? citizen?._id : citizen;
    if (!citizenId) return "None";
    return citizens[citizenId]?.name || "Loading...";
  };

  // Get officer name
  const getOfficerName = (officerId) => {
    if (!officerId) return "Unknown";
    return officers[officerId]?.name || "Loading...";
  };

  // Get IPC sections as a string
  const getIPCSections = (sections) => {
    if (!sections || sections.length === 0) return "None";
    return sections.map((section) => section.section || "Unknown").join(", ");
  };

  // Edit FIR
  const handleEdit = (fir) => {
    setEditFir({
      fir_id: fir.fir_id,
      description: fir.description || "",
      citizen: typeof fir.citizen === "object" ? fir.citizen?._id : fir.citizen || "",
      sections: fir.sections?.map((s) => s.section.replace("IPC ", "")).join(", ") || "",
      evidence: fir.evidence?.join(", ") || "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFir((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const userId = getLoggedInUserId();
      if (!userId) throw new Error("User not authenticated");

      const body = {
        description: editFir.description,
        citizen: editFir.citizen || undefined,
        sections: editFir.sections
          ? editFir.sections.split(",").map((s) => `IPC ${s.trim()}`)
          : [],
        assigned_officer: userId, // Retain the current officer
        evidence: editFir.evidence ? editFir.evidence.split(",").map((e) => e.trim()) : undefined,
      };

      debugLog("Updating FIR with body", body);

      const response = await fetch(`http://localhost:8000/firs/${editFir.fir_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update FIR");
      }

      setSuccessMessage(`FIR ID ${editFir.fir_id} updated successfully!`);
      setEditFir(null);
      await fetchFirs();
    } catch (error) {
      console.error("Error updating FIR:", error);
      setError(error.message);
    }
  };

  // Delete FIR
  const handleDelete = async (firId) => {
    if (!window.confirm(`Are you sure you want to delete FIR ID ${firId}?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/firs/${firId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete FIR");

      setSuccessMessage(`FIR ID ${firId} deleted successfully!`);
      await fetchFirs();
    } catch (error) {
      console.error("Error deleting FIR:", error);
      setError(error.message);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const userId = getLoggedInUserId();
        if (!userId) return;
        await fetchUserDetails(userId);
        await Promise.all([fetchStations(), fetchCitizens()]);
        await fetchFirs();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [userStationId]);

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">View FIRs</h2>

        {loading ? (
          <p className="loading-text">Loading FIRs...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : successMessage ? (
          <p className="success-message">{successMessage}</p>
        ) : firs.length === 0 ? (
          <p className="no-data">No FIRs found.</p>
        ) : (
          <>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Complaint ID</th>
                  <th>Station</th>
                  <th>Citizen</th>
                  <th>Sections</th>
                  <th>Officer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {firs.map((fir) => (
                  <tr key={fir.fir_id || fir._id}>
                    <td>{fir.fir_id}</td>
                    <td>
                      {fir.description?.length > 50
                        ? `${fir.description.substring(0, 50)}...`
                        : fir.description || "No description"}
                    </td>
                    <td>{fir.complaint?.complaint_id || "Direct"}</td>
                    <td>{getStationName(fir)}</td>
                    <td>{getCitizenName(fir.citizen)}</td>
                    <td>{getIPCSections(fir.sections)}</td>
                    <td>{getOfficerName(fir.user?.user_id || fir.user)}</td>
                    <td>{fir.status || "Unknown"}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(fir)}
                        className="action-button edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(fir.fir_id)}
                        className="action-button delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-indicator">Page {page}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={firs.length < limit}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editFir && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit FIR</h3>
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={editFir.description}
                    onChange={handleEditInputChange}
                    placeholder="Enter FIR description"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Citizen Contact (optional):</label>
                  <input
                    type="text"
                    name="citizen"
                    value={editFir.citizen}
                    onChange={handleEditInputChange}
                    placeholder="Enter citizen contact number"
                  />
                </div>

                <div className="form-group">
                  <label>IPC Sections (comma-separated):</label>
                  <input
                    type="text"
                    name="sections"
                    value={editFir.sections}
                    onChange={handleEditInputChange}
                    placeholder="e.g., 304, 376"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Evidence (comma-separated URLs, optional):</label>
                  <input
                    type="text"
                    name="evidence"
                    value={editFir.evidence}
                    onChange={handleEditInputChange}
                    placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
                  />
                </div>

                <div className="modal-buttons">
                  <button type="submit" className="submit-button">
                    Update FIR
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFir(null)}
                    className="cancel-button"
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

export default ViewFirs;