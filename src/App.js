import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navbar from "./Police/components/Navbar";
import Login from "./Police/components/Login";
import FIRForm from "./Police/components/FIRForm";
import FIRs from "./Police/components/FIRS";
import Footer from "./Police/components/Footer";
import ADashboard from "./admin/components/ADashboard";
import PDashboard from "./Police/components/PDashboard";
import Loader from "./Police/components/Loader";

// function App() {
//     const [loading, setLoading] = useState(true);
//     const [userRole, setUserRole] = useState(localStorage.getItem("userRole")); // Load role immediately

//     useEffect(() => {
//         setTimeout(() => setLoading(false), 2000);
//     }, []);

//     useEffect(() => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         const role = localStorage.getItem("userRole");
//         if (role) setUserRole(role); // Ensure role is correctly set
//     }, []);

//     return (
//         <>
//             {loading ? (
//                 <Loader />
//             ) : (
//                 <div className="main-content">
//                     <Navbar />
//                     <Routes>
//                         <Route path="/" element={<Navigate to={userRole === "Admin" ? "/admin-dashboard" : "/police-dashboard"} />} />
//                         <Route path="/login" element={<Login />} />
//                         <Route path="/firs" element={<FIRs />} />
//                         <Route path="/fill-fir" element={<FIRForm />} />

//                         {/* Role-Based Dashboard Routing */}
//                         <Route path="/admin-dashboard" element={userRole === "Admin" ? <ADashboard /> : <Navigate to="/login" />} />
//                         <Route path="/police-dashboard" element={userRole === "Police" ? <PDashboard /> : <Navigate to="/login" />} />
//                     </Routes>
//                     <Footer />
//                 </div>
//             )}
//         </>
//     );
// }

// export default App;

function App() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
      setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const role = localStorage.getItem("userRole");
      if (role) setUserRole(role);
      
      // Listen for authentication changes
      const handleAuthChange = () => {
          setUserRole(localStorage.getItem("userRole"));
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
                  <Navbar userRole={userRole} />
                  <Routes>
                      <Route path="/" element={<Navigate to={userRole === "Admin" ? "/admin-dashboard" : "/police-dashboard"} />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/firs" element={<FIRs />} />
                      <Route path="/fill-fir" element={<FIRForm />} />
                      <Route path="/admin-dashboard" element={userRole === "Admin" ? <ADashboard /> : <Navigate to="/login" />} />
                      <Route path="/police-dashboard" element={userRole === "Police" ? <PDashboard /> : <Navigate to="/login" />} />
                  </Routes>
                  <Footer />
              </div>
          )}
      </>
  );
}
 export default App;

