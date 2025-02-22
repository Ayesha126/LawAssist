import React, { useEffect, useState } from "react";
import "../style/Table.css"; // CSS for the table

const ViewOfficer = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await fetch("http://localhost:8000/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}` // Ensure token is used if required
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch officers");
        }

        const users = await response.json();
        const policeOfficers = users.filter(user => user.role === "Police"); // Filter only police officers
        setOfficers(policeOfficers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching officers:", error);
        setError("Error fetching officers. Please try again.");
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  return (
    <div className="table-page">
      <div className="table-container">
        <h2 className="table-title">Manage Officers</h2>
        {loading ? (
          <p>Loading officers...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : officers.length === 0 ? (
          <p>No officers found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Officer Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.user_id}>
                    <td>{officer.user_id}</td>
                    <td>{officer.name}</td>
                    <td>{officer.email}</td>
                    <td>{officer.contact}</td>
                    <td>{officer.status}</td>
                    <td className="action-buttons">
                      <button className="edit-btn">Edit</button>
                      <button className="delete-btn">Delete</button>
                    </td>
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

export default ViewOfficer;
