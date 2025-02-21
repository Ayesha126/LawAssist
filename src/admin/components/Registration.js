import React, { useState } from "react";
import "../style/Login.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
    // Add registration API call here
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <div className="flex-column">
          <label>Name</label>
          <div className="inputForm">
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div className="flex-column">
          <label>Email</label>
          <div className="inputForm">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className="inputForm">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <button type="submit" className="button-submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;