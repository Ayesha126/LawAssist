import React, { useState } from "react";
import { FaUser, FaEnvelope, FaIdBadge, FaShieldAlt, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../style/Sidebar.css";
import "../style/Form.css";

const AddOfficer = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-container">
      <form className="modern-form">
        <div className="form-title">Add Officer</div>

        <div className="form-body">
          {/* Officer Name */}
          <div className="input-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                required
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
                placeholder="Email"
                className="form-input"
                type="email"
              />
            </div>
          </div>

          {/* Badge Number */}
          <div className="input-group">
            <div className="input-wrapper">
              <FaIdBadge className="input-icon" />
              <input
                required
                placeholder="Badge Number"
                className="form-input"
                type="text"
              />
            </div>
          </div>

          {/* Rank */}
          <div className="input-group">
            <div className="input-wrapper">
              <FaShieldAlt className="input-icon" />
              <input
                required
                placeholder="Rank"
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
        </div>

        {/* Submit Button */}
        <button className="submit-button" type="submit">
          Add Officer
        </button>

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
