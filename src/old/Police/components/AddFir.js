import React, { useEffect, useState } from "react";
import "../styles/Table.css";
import { jwtDecode } from "jwt-decode";

const AddFir = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    citizen: "",
    sections: "",
    evidence: "",
  });

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

  // Fetch user details to set userId
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
      setUserId(userData.user_id);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const userId = getLoggedInUserId();
        if (!userId) return;
        await fetchUserDetails(userId);
      } catch (error) {
        setError(error.message);
      }
    };
    initializeData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    const requiredFields = ["description", "sections"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field} field.`);
        return;
      }
    }

    if (!userId) {
      setError("Unable to determine logged-in officer. Please log in again.");
      return;
    }

    try {
      const body = {
        description: formData.description,
        citizen: formData.citizen || undefined, // Optional
        sections: formData.sections.split(",").map((s) => `IPC ${s.trim()}`),
        assigned_officer: userId, // Automatically set to logged-in officer
        evidence: formData.evidence ? formData.evidence.split(",").map((e) => e.trim()) : undefined,
      };

      debugLog("Submitting FIR with body", body);

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
        throw new Error(data.error || "Failed to add FIR");
      }

      setSuccess("FIR added successfully!");
      setFormData({
        description: "",
        citizen: "",
        sections: "",
        evidence: "",
      });
    } catch (error) {
      console.error("Error adding FIR:", error);
      setError(error.message);
    }
  };

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">Add New FIR (Direct)</h2>

        {loading ? (
          <p className="loading-text">Loading data...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : success ? (
          <p className="success-message">{success}</p>
        ) : (
          <form onSubmit={handleSubmit} className="add-form">
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter FIR description"
                required
              />
            </div>

            <div className="form-group">
              <label>Citizen Contact (optional):</label>
              <input
                type="text"
                name="citizen"
                value={formData.citizen}
                onChange={handleInputChange}
                placeholder="Enter citizen contact number"
              />
            </div>

            <div className="form-group">
              <label>IPC Sections (comma-separated):</label>
              <input
                type="text"
                name="sections"
                value={formData.sections}
                onChange={handleInputChange}
                placeholder="e.g., 304, 376"
                required
              />
            </div>

            <div className="form-group">
              <label>Evidence (comma-separated URLs, optional):</label>
              <input
                type="text"
                name="evidence"
                value={formData.evidence}
                onChange={handleInputChange}
                placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
              />
            </div>

            <button type="submit" className="submit-button">
              Add FIR
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddFir;