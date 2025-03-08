import React, { useEffect, useState } from "react";
import "../styles/Table3.css"; // Ensure this CSS file supports the modal and new buttons
import { jwtDecode } from "jwt-decode";

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [stations, setStations] = useState({});
  const [citizens, setCitizens] = useState({});
  const [firs, setFirs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState({ citizen: "" });
  const [userStationId, setUserStationId] = useState(null);
  const [userStationName, setUserStationName] = useState("Loading...");
  const [filingFir, setFilingFir] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editComplaint, setEditComplaint] = useState(null); // State for editing complaint

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

  // Fetch user details by user_id
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
      setUserStationName(userData.station.name);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
    }
  };

  // Fetch all complaints
  const fetchComplaints = async () => {
    if (!userStationId) return;
    try {
      const response = await fetch("http://localhost:8000/complaints", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch complaints: ${response.status}`);
      const data = await response.json();
      const filteredComplaints = data.filter((complaint) =>
        (complaint.assigned_station?._id || complaint.assigned_station) === userStationId
      );
      setComplaints(filteredComplaints);
      await Promise.all([
        ...filteredComplaints.map((complaint) =>
          fetchStationById(complaint.assigned_station?._id || complaint.assigned_station)
        ),
        ...filteredComplaints.map((complaint) => fetchCitizenDetails(complaint.citizen)),
      ]);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError(error.message);
    }
  };

  // Fetch all FIRs
  const fetchFirs = async () => {
    try {
      const response = await fetch("http://localhost:8000/firs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch FIRs");
      const data = await response.json();
      const firLookup = data.reduce((acc, fir) => ({
        ...acc,
        [fir.complaint?.toString()]: fir,
      }), {});
      setFirs(firLookup);
    } catch (error) {
      console.error("Error fetching FIRs:", error);
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
      if (!response.ok) throw new Error(`Failed to fetch stations: ${response.status}`);
      const data = await response.json();
      const stationLookup = data.reduce((acc, station) => ({
        ...acc,
        [station._id]: station,
      }), {});
      setStations(stationLookup);
    } catch (error) {
      console.error("Error fetching stations:", error);
      setError(error.message);
    }
  };

  // Fetch station by ID
  const fetchStationById = async (stationId) => {
    if (!stationId || stations[stationId]) return;
    try {
      const response = await fetch(`http://localhost:8000/stations/${stationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return;
      const stationData = await response.json();
      setStations((prev) => ({ ...prev, [stationData._id]: stationData }));
    } catch (error) {
      console.error("Error fetching station:", error);
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
      if (!response.ok) throw new Error(`Failed to fetch citizens: ${response.status}`);
      const data = await response.json();
      const citizenLookup = data.reduce((acc, citizen) => ({
        ...acc,
        [citizen._id]: citizen,
        [citizen.contact]: citizen,
      }), {});
      setCitizens(citizenLookup);
    } catch (error) {
      console.error("Error fetching citizens:", error);
      setError(error.message);
    }
  };

  // Fetch citizen details by contact
  const fetchCitizenDetails = async (contact) => {
    if (!contact || citizens[contact]) return;
    try {
      const response = await fetch(`http://localhost:8000/citizen/${contact}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch citizen details for ${contact}`);
      const citizenData = await response.json();
      setCitizens((prev) => ({
        ...prev,
        [contact]: citizenData,
        [citizenData._id]: citizenData,
      }));
    } catch (error) {
      console.error(`Error fetching citizen with contact ${contact}:`, error);
    }
  };

  // Check if complaint is cognizable
  const isCognizable = (complaint) => {
    return complaint.sections?.some((section) => section.cognizable === "Cognizable");
  };

  // Check if FIR is already filed
  const isFirFiled = (complaint) => {
    return !!firs[complaint._id];
  };

  // File FIR for a complaint
  const fileFir = async (complaint) => {
    setFilingFir(complaint.complaint_id);
    setError("");
    setSuccessMessage("");

    try {
      const userId = getLoggedInUserId();
      if (!userId) throw new Error("User not authenticated");

      const citizenContact = complaint.citizen;
      let citizenId = citizens[citizenContact]?._id;
      if (!citizenId) {
        await fetchCitizenDetails(citizenContact);
        citizenId = citizens[citizenContact]?._id;
        if (!citizenId) throw new Error(`Citizen with contact ${citizenContact} not found`);
      }

      const body = {
        complaint: complaint.complaint_id,
        description: complaint.description,
        citizen: citizenId,
        sections: complaint.sections.map((s) => s.section_id.section),
        assigned_officer: userId,
        evidence: complaint.evidence?.length > 0 ? complaint.evidence.join(", ") : undefined,
      };

      const response = await fetch("http://localhost:8000/firs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to file FIR");
      }

      setSuccessMessage(`FIR filed successfully for Complaint ID ${complaint.complaint_id}!`);
      await Promise.all([fetchComplaints(), fetchFirs()]);
    } catch (error) {
      console.error("Error filing FIR:", error);
      setError(error.message);
    } finally {
      setFilingFir(null);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
    setPage(1);
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
  const getStationName = (stationIdentifier) => {
    if (!stationIdentifier) return "Not Assigned";
    return stations[stationIdentifier?._id || stationIdentifier]?.name || "Loading...";
  };

  // Get citizen name
  const getCitizenName = (contact) => {
    if (!contact) return "Unknown";
    return citizens[contact]?.name || "Loading...";
  };

  // Get IPC sections as a string
  const getIPCSections = (sections) => {
    if (!sections || sections.length === 0) return "None";
    return sections.map((section) => section.section_id?.section || "Unknown").join(", ");
  };

  // Edit complaint
  const handleEdit = (complaint) => {
    setEditComplaint({
      complaint_id: complaint.complaint_id,
      description: complaint.description || "",
      citizen: complaint.citizen || "",
      sections: complaint.sections?.map((s) => s.section_id.section).join(", ") || "",
      evidence: complaint.evidence?.join(", ") || "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditComplaint((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const body = {
        description: editComplaint.description,
        citizen: editComplaint.citizen,
        sections: editComplaint.sections
          ? editComplaint.sections.split(",").map((s) => s.trim())
          : [],
        evidence: editComplaint.evidence
          ? editComplaint.evidence.split(",").map((e) => e.trim())
          : [],
      };

      const response = await fetch(
        `http://localhost:8000/complaints/${editComplaint.complaint_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update complaint");
      }

      setSuccessMessage(`Complaint ID ${editComplaint.complaint_id} updated successfully!`);
      setEditComplaint(null);
      await fetchComplaints();
    } catch (error) {
      console.error("Error updating complaint:", error);
      setError(error.message);
    }
  };

  // Delete complaint
  const handleDelete = async (complaintId) => {
    if (!window.confirm(`Are you sure you want to delete Complaint ID ${complaintId}?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/complaints/${complaintId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete complaint");

      setSuccessMessage(`Complaint ID ${complaintId} deleted successfully!`);
      await fetchComplaints();
    } catch (error) {
      console.error("Error deleting complaint:", error);
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
        await Promise.all([fetchStations(), fetchCitizens(), fetchFirs()]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Fetch complaints when userStationId, page, or filter changes
  useEffect(() => {
    if (userStationId) {
      fetchComplaints();
    }
  }, [userStationId, page, filter]);

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">Manage Complaints</h2>

        <div className="filter-section">
          <div className="filter-item">
            <label>Citizen Contact:</label>
            <input
              type="text"
              name="citizen"
              value={filter.citizen}
              onChange={handleFilterChange}
              placeholder="Filter by citizen contact"
            />
          </div>
          <button onClick={() => fetchComplaints()} className="filter-button">
            Apply Filters
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading complaints...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : successMessage ? (
          <p className="success-message">{successMessage}</p>
        ) : complaints.length === 0 ? (
          <p className="no-data">No complaints found.</p>
        ) : (
          <>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Date Filed</th>
                  <th>Station</th>
                  <th>Citizen</th>
                  <th>Citizen Contact</th>
                  <th>IPC Sections</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.complaint_id || complaint._id}>
                    <td>{complaint.complaint_id}</td>
                    <td>
                      {complaint.description?.length > 50
                        ? `${complaint.description.substring(0, 50)}...`
                        : complaint.description || "No description"}
                    </td>
                    <td>{formatDate(complaint.date_filed)}</td>
                    <td>{getStationName(complaint.assigned_station)}</td>
                    <td>{getCitizenName(complaint.citizen)}</td>
                    <td>{complaint.citizen || "Unknown"}</td>
                    <td>{getIPCSections(complaint.sections)}</td>
                    <td>{complaint.status || "Unknown"}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(complaint)}
                        className="action-button edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(complaint.complaint_id)}
                        className="action-button delete-button"
                      >
                        Delete
                      </button>
                      {isCognizable(complaint) && complaint.status === "Active" && (
                        <button
                          onClick={() => !isFirFiled(complaint) && fileFir(complaint)}
                          className="action-button file-fir-button"
                          disabled={filingFir === complaint.complaint_id || isFirFiled(complaint)}
                        >
                          {filingFir === complaint.complaint_id
                            ? "Filing..."
                            : isFirFiled(complaint)
                            ? "FIR Filed"
                            : "File FIR"}
                        </button>
                      )}
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
                disabled={complaints.length < limit}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editComplaint && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Complaint</h3>
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={editComplaint.description}
                    onChange={handleEditInputChange}
                    placeholder="Enter complaint description"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Citizen Contact:</label>
                  <input
                    type="text"
                    name="citizen"
                    value={editComplaint.citizen}
                    onChange={handleEditInputChange}
                    placeholder="Enter citizen contact number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>IPC Sections (comma-separated):</label>
                  <input
                    type="text"
                    name="sections"
                    value={editComplaint.sections}
                    onChange={handleEditInputChange}
                    placeholder="e.g., 302, 376"
                  />
                </div>

                <div className="form-group">
                  <label>Evidence (comma-separated URLs):</label>
                  <input
                    type="text"
                    name="evidence"
                    value={editComplaint.evidence}
                    onChange={handleEditInputChange}
                    placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
                  />
                </div>

                <div className="modal-buttons">
                  <button type="submit" className="submit-button">
                    Update Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditComplaint(null)}
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

export default ViewComplaint;