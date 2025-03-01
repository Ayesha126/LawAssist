import React, { useEffect, useState } from "react";
import "../style/Table.css";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe } from "react-icons/fa";

const ViewStation = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editStation, setEditStation] = useState(null); // State for editing station

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("http://localhost:8000/stations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stations");
        }

        const data = await response.json();
        setStations(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stations:", error);
        setError("Error fetching stations. Please try again.");
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Handle input changes for edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setEditStation((prevData) => ({
        ...prevData,
        address: { ...prevData.address, [field]: value },
      }));
    } else {
      setEditStation({ ...editStation, [name]: value });
    }
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8000/stations/${editStation.station_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editStation),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update station");
      }

      setSuccessMessage("Station updated successfully!");
      setEditStation(null);
      const updatedStations = await fetchStationsData();
      setStations(updatedStations);
    } catch (error) {
      console.error("Error updating station:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stations (helper function to avoid repetition)
  const fetchStationsData = async () => {
    const response = await fetch("http://localhost:8000/stations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch stations");
    return await response.json();
  };

  // Handle delete action
  const handleDelete = async (stationId) => {
    if (!window.confirm(`Are you sure you want to delete station ID ${stationId}?`)) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8000/stations/${stationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete station");
      }

      setSuccessMessage("Station deleted successfully!");
      const updatedStations = await fetchStationsData();
      setStations(updatedStations);
    } catch (error) {
      console.error("Error deleting station:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit form
  const handleEdit = (station) => {
    setEditStation({ ...station }); // Copy station data to edit form
  };

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">Manage Police Stations</h2>
        {loading ? (
          <p className="loading-text">Loading stations...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : successMessage ? (
          <p className="success-message">{successMessage}</p>
        ) : stations.length === 0 ? (
          <p className="no-data">No police stations found.</p>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Station Name</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Jurisdiction Area</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.station_id}>
                  <td>{station.station_id}</td>
                  <td>{station.name}</td>
                  <td>
                    {station.address.city}, {station.address.state}
                  </td>
                  <td>{station.contact}</td>
                  <td>{station.jurisdiction_area}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(station)}
                      className="action-button edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(station.station_id)}
                      className="action-button delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Edit Modal */}
        {editStation && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Police Station</h3>
              <form className="modern-form" onSubmit={handleEditSubmit}>
                <div className="form-body">
                  {/* Station Name */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaBuilding className="input-icon" />
                      <input
                        required
                        name="name"
                        value={editStation.name}
                        onChange={handleEditChange}
                        placeholder="Station Name"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        required
                        name="address.building_number"
                        value={editStation.address.building_number}
                        onChange={handleEditChange}
                        placeholder="Building Number"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        required
                        name="address.street"
                        value={editStation.address.street}
                        onChange={handleEditChange}
                        placeholder="Street"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        required
                        name="address.area"
                        value={editStation.address.area}
                        onChange={handleEditChange}
                        placeholder="Area"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        required
                        name="address.city"
                        value={editStation.address.city}
                        onChange={handleEditChange}
                        placeholder="City"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        required
                        name="address.state"
                        value={editStation.address.state}
                        onChange={handleEditChange}
                        placeholder="State"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <input
                        required
                        name="address.postal_code"
                        value={editStation.address.postal_code}
                        onChange={handleEditChange}
                        placeholder="Postal Code"
                        className="form-input"
                        type="text"
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
                        value={editStation.contact}
                        onChange={handleEditChange}
                        placeholder="Contact Number"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Jurisdiction Area */}
                  <div className="input-group">
                    <div className="input-wrapper">
                      <FaGlobe className="input-icon" />
                      <input
                        required
                        name="jurisdiction_area"
                        value={editStation.jurisdiction_area}
                        onChange={handleEditChange}
                        placeholder="Jurisdiction Area"
                        className="form-input"
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-buttons">
                  <button className="submit-button" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Station"}
                  </button>
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() => setEditStation(null)}
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

export default ViewStation;