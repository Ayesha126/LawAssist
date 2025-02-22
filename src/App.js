import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "./Police/components/Login";
import FIRForm from "./Police/components/FIRForm";
import FIRs from "./Police/components/FIRS";
import Footer from "./Police/components/Footer";
import ADashboard from "./admin/components/ADashboard";
import ViewOfficer from "./admin/components/ViewOfficer";
import AddOfficer from "./admin/components/AddOfficer";
import PDashboard from "./Police/components/PDashboard";
import Loader from "./Police/components/Loader";
import Sidebar from "./Police/components/Sidebar";
import ViewSection from "./admin/components/ViewSection";
import AddSection from "./admin/components/AddSection";

function App() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const handleAuthChange = () => {
      setUserRole(localStorage.getItem("userRole")); // Update state when userRole changes
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="main-content">
          {/* Show Sidebar only if userRole exists */}
          {userRole && <Sidebar userRole={userRole} />}

          <Routes>
            <Route path="/" element={userRole ? <Navigate to={userRole === "Admin" ? "/admin-dashboard" : "/police-dashboard"} /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/firs" element={userRole ? <FIRs /> : <Navigate to="/login" />} />
            <Route path="/fill-fir" element={userRole ? <FIRForm /> : <Navigate to="/login" />} />
            <Route path="/admin-dashboard" element={userRole === "Admin" ? <ADashboard /> : <Navigate to="/login" />} />
            <Route path="/police-dashboard" element={userRole === "Police" ? <PDashboard /> : <Navigate to="/login" />} />
            <Route path="/view-officer" element={userRole === "Admin" ? <ViewOfficer /> : <Navigate to="/login" />} />
            <Route path="/add-officer" element={userRole === "Admin" ? <AddOfficer /> : <Navigate to="/login" />} />
            <Route path="/view-section" element={userRole === "Admin" ? <ViewSection/>: <Navigate to="/login" />} />
            <Route path="/add-section" element={userRole === "Admin" ? <AddSection/> : <Navigate to="/login" />} />
          </Routes>

          <Footer />
        </div>
      )}
    </>
  );
}

export default App;
