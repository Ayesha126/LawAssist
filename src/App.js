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
import ViewStation from "./admin/components/ViewStation";
import AddStation from "./admin/components/AddStation";
import ViewComplaint from "./Police/components/ViewComplaint";
import AddComplaint from "./Police/components/AddComplaint";
import AddFir from "./Police/components/AddFir";
import ViewFirs from "./Police/components/ViewFir";
import Header from "./Police/components/Header";
import "./Police/styles/app.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const currentRole = localStorage.getItem("userRole");
    if (currentRole !== userRole) {
      setUserRole(currentRole);
    }

    const handleAuthChange = () => {
      setUserRole(localStorage.getItem("userRole"));
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, [userRole]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    console.log("Sidebar toggled, isCollapsed:", !isSidebarCollapsed); // Debug log
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="app-container">
          <div className="layout-wrapper">
            {userRole && <Sidebar userRole={userRole} isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />}
            <div className={`content-wrapper ${isSidebarCollapsed ? "collapsed" : ""}`}>
              <Header userRole={userRole} isSidebarCollapsed={isSidebarCollapsed} />
              <main className="main-content">
                <Routes>
                  <Route
                    path="/"
                    element={
                      userRole ? (
                        <Navigate to={userRole === "Admin" ? "/admin-dashboard" : "/police-dashboard"} />
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/firs" element={userRole ? <FIRs /> : <Navigate to="/login" />} />
                  <Route path="/fill-fir" element={userRole ? <FIRForm /> : <Navigate to="/login" />} />
                  <Route
                    path="/admin-dashboard"
                    element={userRole === "Admin" ? <ADashboard /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/police-dashboard"
                    element={userRole === "Police" ? <PDashboard /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/view-officer"
                    element={userRole === "Admin" ? <ViewOfficer /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/add-officer"
                    element={userRole === "Admin" ? <AddOfficer /> : <Navigate to="/login" />}
                  />
                  <Route path="/view-section" element={userRole ? <ViewSection /> : <Navigate to="/login" />} />
                  <Route
                    path="/add-section"
                    element={userRole === "Admin" ? <AddSection /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/view-station"
                    element={userRole === "Admin" ? <ViewStation /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/add-station"
                    element={userRole === "Admin" ? <AddStation /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/view-complaint"
                    element={userRole === "Police" ? <ViewComplaint /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/add-complaint"
                    element={userRole === "Police" ? <AddComplaint /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/add-fir"
                    element={userRole === "Police" ? <AddFir /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/view-fir"
                    element={userRole === "Police" ? <ViewFirs /> : <Navigate to="/login" />}
                  />
                </Routes>
              </main>
              <Footer className={isSidebarCollapsed ? "collapsed" : ""} /> {/* Pass className directly */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;