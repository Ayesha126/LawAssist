import React, { useState } from "react";
import { FaUser, FaEnvelope, FaIdBadge, FaShieldAlt, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../style/Sidebar.css";
import "../style/Form.css"; 

const AddOfficer = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-container"> {/* Centering Wrapper */}
      <form className="modern-form">
        <div className="form-title">Add Officer</div>

        <div className="form-body">
          <div className="input-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input required placeholder="Officer Name" className="form-input" type="text" />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input required placeholder="Email" className="form-input" type="email" />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <FaIdBadge className="input-icon" />
              <input required placeholder="Badge Number" className="form-input" type="text" />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <FaShieldAlt className="input-icon" />
              <input required placeholder="Rank" className="form-input" type="text" />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input required placeholder="Password" className="form-input" type={showPassword ? "text" : "password"} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>
        </div>

        <button className="submit-button" type="submit">
          <span className="button-text">Add Officer</span>
          <div className="button-glow"></div>
        </button>

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
