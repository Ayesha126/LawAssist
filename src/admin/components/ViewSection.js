import React, { useEffect, useState } from "react";
import "../style/Table.css"; // CSS for styling

const ViewSection = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchSections();
  }, []);

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">IPC Sections</h2>

        {loading ? (
          <p>Loading sections...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSection;
