import React, { useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../style/Form.css";

const AddStation = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: {
      building_number: "",
      street: "",
      area: "",
      city: "",
      state: "",
      postal_code: "",
    },
    contact: "",
    jurisdiction_area: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes for nested address object
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const field = name.split(".")[1]; // Extract address field name
      setFormData((prevData) => ({
        ...prevData,
        address: { ...prevData.address, [field]: value },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add police station");
      }

      setMessage("Police station added successfully!");
      setFormData({
        name: "",
        address: {
          building_number: "",
          street: "",
          area: "",
          city: "",
          state: "",
          postal_code: "",
        },
        contact: "",
        jurisdiction_area: "",
      });
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <form className="modern-form" onSubmit={handleSubmit}>
        <div className="form-title">Add Police Station</div>

        <div className="form-body">
          {/* Station Name */}
          <div className="input-group">
            <div className="input-wrapper">
              <FaBuilding className="input-icon" />
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.address.building_number}
                onChange={handleChange}
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
                value={formData.address.street}
                onChange={handleChange}
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
                value={formData.address.area}
                onChange={handleChange}
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
                value={formData.address.city}
                onChange={handleChange}
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
                value={formData.address.state}
                onChange={handleChange}
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
                value={formData.address.postal_code}
                onChange={handleChange}
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
                value={formData.contact}
                onChange={handleChange}
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
                value={formData.jurisdiction_area}
                onChange={handleChange}
                placeholder="Jurisdiction Area"
                className="form-input"
                type="text"
              />
            </div>
          </div>
        </div>

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Station"}
        </button>

        {message && <p className="form-message">{message}</p>}

        <div className="form-footer">
          <Link className="login-link" to="/view-station">
            View Police Stations
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddStation;
