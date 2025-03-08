import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../style/Form.css";

const AddOfficer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    station: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stations, setStations] = useState([]);

  // Fetch Active Police Stations
  useEffect(() => {
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

    fetchStations();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          role: "Police",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add officer");
      }

      setMessage("Officer added successfully!");
      setFormData({ name: "", email: "", contact: "", password: "", station: "" }); // Reset form
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <form className="modern-form" onSubmit={handleSubmit}>
        <div className="form-title">Add Officer</div>

        <div className="form-body">
          {/* Officer Name */}
          <div className="input-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.contact}
                onChange={handleChange}
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
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
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
                value={formData.station}
                onChange={handleChange}
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

        {/* Submit Button */}
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Officer"}
        </button>

        {/* Display Message */}
        {message && <p className="form-message">{message}</p>}

        {/* View Officers Link */}
        <div className="form-footer">
          <Link className="login-link" to="/view-officer">
            View Officers
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddOfficer;
