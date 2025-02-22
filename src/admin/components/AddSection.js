import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style/Form.css";

const AddSection = () => {
  const [formData, setFormData] = useState({
    section: "",
    description: "",
    offense: "",
    punishment: "",
    cognizable: "Cognizable",
    bailable: "Bailable",
    court: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      const response = await fetch("http://localhost:8000/ipc-sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure authentication
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to add section");

      setMessage("IPC Section added successfully!");
      setFormData({
        section: "",
        description: "",
        offense: "",
        punishment: "",
        cognizable: "Cognizable",
        bailable: "Bailable",
        court: "",
      }); // Reset form
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <form className="modern-form" onSubmit={handleSubmit}>
        <div className="form-title">Add IPC Section</div>

        <div className="form-body">
          {/* Section Number */}
          <input required name="section" value={formData.section} onChange={handleChange} placeholder="Section Number" className="form-input" type="text" />

          {/* Description */}
          <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="form-textarea"></textarea>

          {/* Offense */}
          <input required name="offense" value={formData.offense} onChange={handleChange} placeholder="Offense" className="form-input" type="text" />

          {/* Punishment */}
          <input required name="punishment" value={formData.punishment} onChange={handleChange} placeholder="Punishment" className="form-input" type="text" />

          {/* Cognizable */}
          <select name="cognizable" value={formData.cognizable} onChange={handleChange} className="form-input">
            <option value="Cognizable">Cognizable</option>
            <option value="Non-Cognizable">Non-Cognizable</option>
          </select>

          {/* Bailable */}
          <select name="bailable" value={formData.bailable} onChange={handleChange} className="form-input">
            <option value="Bailable">Bailable</option>
            <option value="Non-Bailable">Non-Bailable</option>
          </select>

          {/* Court */}
          <input required name="court" value={formData.court} onChange={handleChange} placeholder="Court Type" className="form-input" type="text" />
        </div>

        {/* Submit Button */}
        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Section"}
        </button>

        {/* Display Message */}
        {message && <p className="form-message">{message}</p>}

        {/* View Sections Link */}
        <div className="form-footer">
          <Link className="login-link" to="/view-section">View Sections</Link>
        </div>
      </form>
    </div>
  );
};

export default AddSection;
