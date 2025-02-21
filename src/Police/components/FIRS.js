import React, { useState } from "react";
import "../styles/FIRS.css"; // Updated styles with unique class names
import FIRForm from "./FIRForm"; // Import the FIRForm component

const FIRS = () => {
    const [showForm, setShowForm] = useState(false);
    const [firs, setFirs] = useState([]);
    const [filters, setFilters] = useState({ date: "", section: "", bailable: "" });

    const handleNewFIR = (newFIR) => {
        setFirs([...firs, newFIR]); // Add new FIR to the list
        setShowForm(false); // Close the popup after submission
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filteredFIRs = firs.filter(fir =>
        (filters.date === "" || fir.date === filters.date) &&
        (filters.section === "" || fir.section.includes(filters.section)) &&
        (filters.bailable === "" || fir.bailable === filters.bailable)
    );

    return (
        <div className="fir-container">
            <h2>FIR Management System</h2>

            {/* Add New FIR Button */}
            <button className="fir-add-btn" onClick={() => setShowForm(true)}>Add New FIR</button>

            {/* Popup Modal for FIR Form */}
            {showForm && (
                <div className="fir-modal-overlay">
                    <div className="fir-modal-content">
                        <button className="fir-close-btn" onClick={() => setShowForm(false)}>✖</button>

                        <FIRForm onSubmit={handleNewFIR} onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}

            <div className="fir-main-content">
                {/* Left Side: Filter Module */}
                <div className="fir-filter-container">
                    <h3>Filter FIRs</h3>
                    <input type="date" name="date" value={filters.date} onChange={handleFilterChange} placeholder="Filter by Date" />
                    <input type="text" name="section" value={filters.section} onChange={handleFilterChange} placeholder="Filter by Section" />
                    <select name="bailable" value={filters.bailable} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="Yes">Bailable</option>
                        <option value="No">Non-Bailable</option>
                    </select>
                </div>

                {/* Center: All FIRs */}
                <div className="fir-list">
                    <h3>All FIRs</h3>
                    {filteredFIRs.length > 0 ? (
                        filteredFIRs.map((fir, index) => (
                            <div key={index} className="fir-card">
                                <p><strong>FIR No:</strong> {fir.firNo}</p>
                                <p><strong>Date:</strong> {fir.date}</p>
                                <p><strong>Section:</strong> {fir.section}</p>
                                <p><strong>Bailable:</strong> {fir.bailable}</p>
                                <p><strong>Suspect:</strong> {fir.suspect}</p>
                            </div>
                        ))
                    ) : (
                        <p>No FIRs found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FIRS;
