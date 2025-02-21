import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar1 from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AddOfficer from "./components/AddOfficer";
import ViewOfficer from "./components/ViewOfficer";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container" style={{ display: "flex" }}>
        <Sidebar1 />
        <div className="content" style={{ flexGrow: 1, padding: "20px" }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-officer" element={<AddOfficer />} />
            <Route path="/view-officer" element={<ViewOfficer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
