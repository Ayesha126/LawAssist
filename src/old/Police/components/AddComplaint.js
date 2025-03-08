import React, { useEffect, useState } from "react";
import "../styles/Table2.css";
import { jwtDecode } from "jwt-decode";

const AddComplaint = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userStationId, setUserStationId] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    citizen: "",
    citizen_name: "",
    citizen_address: "",
    citizen_email: "",
    sections: "", // Comma-separated string
    evidence: "", // Comma-separated string
  });

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

  // Fetch user details to get their station
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
      if (!userData.station?._id) {
        throw new Error("User station not found");
      }
      setUserStationId(userData.station.station_id); // Use station_id as expected by backend
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Initialize user data on mount
  useEffect(() => {
    const initializeUser = async () => {
      const userId = getLoggedInUserId();
      if (userId) {
        await fetchUserDetails(userId);
      } else {
        setLoading(false);
      }
    };
    initializeUser();
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
  
    // Basic validation
    const requiredFields = ["description", "citizen", "citizen_name", "citizen_address", "citizen_email"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace("_", " ")} field.`);
        return;
      }
    }
  
    if (!userStationId) {
      setError("Unable to determine your station. Please contact admin.");
      return;
    }
  
    try {
      const body = {
        description: formData.description,
        assigned_station: userStationId,
        citizen: formData.citizen,
        citizen_name: formData.citizen_name,
        citizen_address: formData.citizen_address,
        citizen_email: formData.citizen_email,
        sections: formData.sections
          ? formData.sections.split(",").map(s => `IPC ${s.trim()}`) // Prepend "IPC "
          : [],
        evidence: formData.evidence ? formData.evidence.split(",").map(e => e.trim()) : [],
      };
  
      const response = await fetch("http://localhost:8000/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to add complaint");
      }
  
      setSuccess("Complaint added successfully!");
      setFormData({
        description: "",
        citizen: "",
        citizen_name: "",
        citizen_address: "",
        citizen_email: "",
        sections: "",
        evidence: "",
      });
    } catch (error) {
      console.error("Error adding complaint:", error);
      setError(error.message);
    }
  };

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">Add New Complaint</h2>

        {loading ? (
          <p>Loading user data...</p>
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
                placeholder="Enter complaint description"
                required
              />
            </div>

            <div className="form-group">
              <label>Citizen Contact:</label>
              <input
                type="text"
                name="citizen"
                value={formData.citizen}
                onChange={handleInputChange}
                placeholder="Enter citizen contact number"
                required
              />
            </div>

            <div className="form-group">
              <label>Citizen Name:</label>
              <input
                type="text"
                name="citizen_name"
                value={formData.citizen_name}
                onChange={handleInputChange}
                placeholder="Enter citizen name"
                required
              />
            </div>

            <div className="form-group">
              <label>Citizen Address:</label>
              <input
                type="text"
                name="citizen_address"
                value={formData.citizen_address}
                onChange={handleInputChange}
                placeholder="Enter citizen address"
                required
              />
            </div>

            <div className="form-group">
              <label>Citizen Email:</label>
              <input
                type="email"
                name="citizen_email"
                value={formData.citizen_email}
                onChange={handleInputChange}
                placeholder="Enter citizen email"
                required
              />
            </div>

            <div className="form-group">
              <label>IPC Sections (comma-separated):</label>
              <input
                type="text"
                name="sections"
                value={formData.sections}
                onChange={handleInputChange}
                placeholder="e.g., 302, 376"
              />
            </div>

            <div className="form-group">
              <label>Evidence (comma-separated URLs):</label>
              <input
                type="text"
                name="evidence"
                value={formData.evidence}
                onChange={handleInputChange}
                placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
              />
            </div>

            <button type="submit" className="submit-button">
              Add Complaint
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddComplaint;