
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import FIRForm from "./components/FIRForm";
import FIRs from "./components/FIRS";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay (e.g., fetching data)
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust time as needed
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Router>
      {loading ? (
        <Loader /> // Show loader while loading
      ) : (
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/firs" element={<FIRs />} />

            <Route path="/fill-fir" element={<FIRForm />} />
          </Routes>
          <Footer />
        </div>
      )}
    </Router>
  );
}

export default App;



// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import Sidebar1 from "./admin/components/Sidebar";
// import Dashboard from "./admin/components/Dashboard";
// import AddOfficer from "./admin/components/AddOfficer";
// import ViewOfficer from "./admin/components/ViewOfficer";
// import "./App.css";

// const App = () => {
//   return (
//     <Router>
//       <div className="app-container" style={{ display: "flex" }}>
//         <Sidebar1 />
//         <div className="content" style={{ flexGrow: 1, padding: "20px" }}>
//           <Routes>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/add-officer" element={<AddOfficer />} />
//             <Route path="/view-officer" element={<ViewOfficer />} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default App;
