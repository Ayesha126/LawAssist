import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaClipboardList,
  FaCommentDots,
  FaMicrophone,
  FaHome,
  FaUserShield,
} from "react-icons/fa";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "../style/ComplaintForm.css"; // Importing the CSS file for custom styles

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    registeredBy: "", // New field for the officer registering the complaint
    description: "",
    evidence: [],
  });

  const { transcript, listening, resetTranscript } = useSpeechRecognition(); // Hook from react-speech-recognition

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const fileUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    setFormData((prevData) => ({
      ...prevData,
      evidence: fileUrls,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Complaint submitted successfully!");
    // Here, you would typically send the form data to a server or backend.
  };

  const handleVoiceInput = () => {
    if (!listening) {
      SpeechRecognition.startListening(); // Start listening if microphone is clicked
    } else {
      SpeechRecognition.stopListening(); // Stop listening after speech is done
    }
  };

  // Add transcript to the description when voice input is detected
  const handleVoiceUpdate = () => {
    setFormData((prevData) => ({
      ...prevData,
      description: prevData.description + " " + transcript,
    }));
    resetTranscript(); // Clear transcript after adding it
  };

  // Update description whenever voice input is provided
  React.useEffect(() => {
    handleVoiceUpdate();
  }, [transcript]);

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="modern-form">
        <h2 className="form-title">Complaint Form</h2>

        {/* Name Field */}
        <div className="input-group">
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Full Name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="input-group">
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Email Address"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="input-group">
          <div className="input-wrapper">
            <FaPhoneAlt className="input-icon" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Phone Number"
            />
          </div>
        </div>

        {/* Address Field */}
        <div className="input-group">
          <div className="input-wrapper">
            <FaHome className="input-icon" />
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Address"
            />
          </div>
        </div>

        {/* Registered By Field (Police Officer) */}
        <div className="input-group">
          <div className="input-wrapper">
            <FaUserShield className="input-icon" />
            <input
              type="text"
              id="registeredBy"
              name="registeredBy"
              value={formData.registeredBy}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Police Officer"
            />
          </div>
        </div>
  {/* Evidence Field */}
  <div className="input-group">
          <div className="input-wrapper">
            <FaClipboardList className="input-icon" />
            <input
              type="file"
              id="evidence"
              name="evidence"
              accept="image/*,video/*,application/*"
              onChange={handleFileChange}
              multiple
              className="form-input"
            />
          </div>
        </div>
        {/* Description Field with Comment Icon */}
        <div className="input-group">
          <div className="input-wrapper">
            <FaCommentDots className="input-icon" />
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Describe your complaint"
            ></textarea>
            {/* Add Voice Input Icon under description */}
            <FaMicrophone
              className="input-icon microphone-icon"
              onClick={handleVoiceInput} // Starts/stops voice input when clicked
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="input-group">
          <button type="submit" className="submit-button">
            Submit Complaint
            <div className="button-glow"></div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
