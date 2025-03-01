import React, { useEffect, useState } from "react";
import "../style/Table.css";

const ViewSection = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editSection, setEditSection] = useState(null); // State for editing section

  // Fetch sections on mount
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch("http://localhost:8000/ipc-sections", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch sections");

      setSections(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit input changes
  const handleEditChange = (e) => {
    setEditSection({ ...editSection, [e.target.name]: e.target.value });
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8000/ipc-sections/${editSection._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editSection),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update section");

      setSuccessMessage("IPC Section updated successfully!");
      setEditSection(null);
      await fetchSections(); // Refresh sections list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async (sectionId) => {
    if (!window.confirm(`Are you sure you want to delete section ${sectionId}?`)) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`http://localhost:8000/ipc-sections/${sectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete section");

      setSuccessMessage("IPC Section deleted successfully!");
      await fetchSections(); // Refresh sections list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit form
  const handleEdit = (section) => {
    setEditSection({ ...section }); // Copy section data to edit form
  };

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">IPC Sections</h2>

        {loading ? (
          <p className="loading-text">Loading sections...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : successMessage ? (
          <p className="success-message">{successMessage}</p>
        ) : sections.length === 0 ? (
          <p className="no-data">No sections found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Description</th>
                  <th>Offense</th>
                  <th>Punishment</th>
                  <th>Cognizable</th>
                  <th>Bailable</th>
                  <th>Court</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section._id}>
                    <td>{section.section}</td>
                    <td>{section.description}</td>
                    <td>{section.offense}</td>
                    <td>{section.punishment}</td>
                    <td>{section.cognizable}</td>
                    <td>{section.bailable}</td>
                    <td>{section.court}</td>
                    <td>
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEdit(section)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDelete(section._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editSection && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit IPC Section</h3>
              <form className="modern-form" onSubmit={handleEditSubmit}>
                <div className="form-body">
                  {/* Section Number */}
                  <input
                    required
                    name="section"
                    value={editSection.section}
                    onChange={handleEditChange}
                    placeholder="Section Number"
                    className="form-input"
                    type="text"
                  />

                  {/* Description */}
                  <textarea
                    required
                    name="description"
                    value={editSection.description}
                    onChange={handleEditChange}
                    placeholder="Description"
                    className="form-textarea"
                  />

                  {/* Offense */}
                  <input
                    required
                    name="offense"
                    value={editSection.offense}
                    onChange={handleEditChange}
                    placeholder="Offense"
                    className="form-input"
                    type="text"
                  />

                  {/* Punishment */}
                  <input
                    required
                    name="punishment"
                    value={editSection.punishment}
                    onChange={handleEditChange}
                    placeholder="Punishment"
                    className="form-input"
                    type="text"
                  />

                  {/* Cognizable */}
                  <select
                    name="cognizable"
                    value={editSection.cognizable}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="Cognizable">Cognizable</option>
                    <option value="Non-Cognizable">Non-Cognizable</option>
                  </select>

                  {/* Bailable */}
                  <select
                    name="bailable"
                    value={editSection.bailable}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    <option value="Bailable">Bailable</option>
                    <option value="Non-Bailable">Non-Bailable</option>
                  </select>

                  {/* Court */}
                  <input
                    required
                    name="court"
                    value={editSection.court}
                    onChange={handleEditChange}
                    placeholder="Court Type"
                    className="form-input"
                    type="text"
                  />
                </div>

                <div className="modal-buttons">
                  <button className="submit-button" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Section"}
                  </button>
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={() => setEditSection(null)}
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

export default ViewSection;