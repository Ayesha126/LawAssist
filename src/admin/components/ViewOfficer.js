import React from "react";
import "../style/Sidebar.css";
import "../style/Table.css"; // New CSS file for modern tables

const officers = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", badge: "12345", rank: "Sergeant" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", badge: "67890", rank: "Lieutenant" },
  { id: 3, name: "Alice Brown", email: "alice.brown@example.com", badge: "54321", rank: "Captain" },
  { id: 1, name: "John Doe", email: "john.doe@example.com", badge: "12345", rank: "Sergeant" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", badge: "67890", rank: "Lieutenant" },
  { id: 3, name: "Alice Brown", email: "alice.brown@example.com", badge: "54321", rank: "Captain" },
  { id: 1, name: "John Doe", email: "john.doe@example.com", badge: "12345", rank: "Sergeant" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", badge: "67890", rank: "Lieutenant" },
  { id: 3, name: "Alice Brown", email: "alice.brown@example.com", badge: "54321", rank: "Captain" },
  
];

const ViewOfficer = () => {
  return (
    <div className="table-container">
      <h2 className="table-title">Manage Officers</h2>
      <table className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Officer Name</th>
            <th>Email</th>
            <th>Badge No</th>
            <th>Rank</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {officers.map((officer) => (
            <tr key={officer.id}>
              <td>{officer.id}</td>
              <td>{officer.name}</td>
              <td>{officer.email}</td>
              <td>{officer.badge}</td>
              <td>{officer.rank}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewOfficer;
