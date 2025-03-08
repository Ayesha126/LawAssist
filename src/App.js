import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Remove BrowserRouter
import { jwtDecode } from "jwt-decode";
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import PoliceStationsAdmin from './components/admin/PoliceStationsAdmin';
import UserManagement from './components/admin/UserManagement';
import IPCSections from './components/admin/IPCSections';
import PoliceOfficers from './components/admin/PoliceOfficers';
import Reports from './components/admin/Reports';
import LegalDatabase from './components/admin/LegalDatabase';
import PoliceDashboard from './components/police/PoliceDashboard';
import ViewFIRS from './components/police/ViewFIRS';
import FIRForm from './components/police/FIRForm';
import Complaint from './components/police/Complaint';
import ViewSections from './components/police/ViewSections';
import CitizenDashboard from './components/citizen/CitizenDashboard';
import ComplaintForm from './components/citizen/ComplaintForm';
import ComplaintStatus from './components/citizen/ComplaintStatus';
import SkeletonLoader from './components/common/SkeletonLoader';
import FIRDetails from './components/common/FIRDetails';
import FIRSearch from './components/common/FIRSearch';
import LegalInfo from './components/common/LegalInfo';
import Profile from './components/common/Profile';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setProfileImage(null);
    localStorage.removeItem('token');
  };

  const handleProfileImageUpdate = (newImageUrl) => {
    console.log('App: Updating profileImage to:', newImageUrl);
    setProfileImage(newImageUrl);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAuthenticated(true);
        setUserRole(decoded.role.toLowerCase());

        const fetchUserData = async () => {
          const response = await fetch(`http://localhost:8000/users/${decoded.user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            console.log('App Initial Fetch:', data);
            setProfileImage(data.profileImage || null);
          }
        };
        fetchUserData();
      } catch (error) {
        console.error('Invalid token:', error);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="background-elements">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route
            element={
              <Layout
                userRole={userRole}
                onLogout={handleLogout}
                onProfileImageUpdate={profileImage} // Should this be handleProfileImageUpdate?
              />
            }
          >
            <Route path="/profile" element={<Profile onProfileImageUpdate={handleProfileImageUpdate} />} />
            <Route path="/legal-info" element={<LegalInfo />} />
            <Route path="/admin/*" element={
              userRole === 'admin' ? (
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="police-stations" element={<PoliceStationsAdmin />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="legal-database" element={<LegalDatabase />} />
                  <Route path="fir/:id" element={<FIRDetails />} />
                  <Route path="search" element={<FIRSearch />} />
                  <Route path="police-officers" element={<PoliceOfficers />} />
                  <Route path="ipc-sections" element={<IPCSections />} />
                </Routes>
              ) : <Navigate to={`/${userRole}`} replace />
            } />
            <Route path="/police/*" element={
              userRole === 'police' ? (
                <Routes>
                  <Route path="/" element={<PoliceDashboard />} />
                  <Route path="fir/new" element={<FIRForm />} />
                  <Route path="fir/:id" element={<FIRDetails />} />
                  <Route path="search" element={<FIRSearch />} />
                  <Route path="fir/viewfirs" element={<ViewFIRS />} />
                  <Route path="complaints" element={<Complaint />} />
                  <Route path="viewsections" element={<ViewSections />} />
                </Routes>
              ) : <Navigate to={`/${userRole}`} replace />
            } />
            <Route path="/citizen/*" element={
              userRole === 'citizen' ? (
                <Routes>
                  <Route path="/" element={<CitizenDashboard />} />
                  <Route path="complaint/new" element={<ComplaintForm />} />
                  <Route path="complaint/:id" element={<ComplaintStatus />} />
                </Routes>
              ) : <Navigate to={`/${userRole}`} replace />
            } />
            <Route path="/" element={<Navigate to={`/${userRole}`} replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { jwtDecode } from "jwt-decode";
// import Login from './components/auth/Login';
// import Register from './components/auth/Register';
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import AdminDashboard from './components/admin/AdminDashboard';
// import PoliceStationsAdmin from './components/admin/PoliceStationsAdmin';
// import UserManagement from './components/admin/UserManagement';
// import IPCSections from './components/admin/IPCSections';
// import PoliceOfficers from './components/admin/PoliceOfficers';
// import Reports from './components/admin/Reports';
// import LegalDatabase from './components/admin/LegalDatabase';
// import PoliceDashboard from './components/police/PoliceDashboard';
// import ViewFIRS from './components/police/ViewFIRS';
// import FIRForm from './components/police/FIRForm';
// import Complaint from './components/police/Complaint';
// import ViewSections from './components/police/ViewSections';
// import CitizenDashboard from './components/citizen/CitizenDashboard';
// import ComplaintForm from './components/citizen/ComplaintForm';
// import ComplaintStatus from './components/citizen/ComplaintStatus';
// import SkeletonLoader from './components/common/SkeletonLoader';
// import FIRDetails from './components/common/FIRDetails';
// import FIRSearch from './components/common/FIRSearch';
// import LegalInfo from './components/common/LegalInfo';
// import Profile from './components/common/Profile';
// import Layout from './components/layout/Layout';
// import './App.css';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [profileImage, setProfileImage] = useState(null);

//   const handleLogin = (role) => {
//     setIsAuthenticated(true);
//     setUserRole(role);
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setUserRole(null);
//     setProfileImage(null);
//     localStorage.removeItem('token');
//   };

//   const handleProfileImageUpdate = (newImageUrl) => {
//     console.log('App: Updating profileImage to:', newImageUrl);
//     setProfileImage(newImageUrl);
//   };

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setIsAuthenticated(true);
//         setUserRole(decoded.role.toLowerCase());

//         const fetchUserData = async () => {
//           const response = await fetch(`http://localhost:8000/users/${decoded.user_id}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (response.ok) {
//             const data = await response.json();
//             console.log('App Initial Fetch:', data);
//             setProfileImage(data.profileImage || null);
//           }
//         };
//         fetchUserData();
//       } catch (error) {
//         console.error('Invalid token:', error);
//         handleLogout();
//       }
//     }
//     setLoading(false);
//   }, []);

//   if (loading) return <SkeletonLoader />;

//   return (
//     <Router>
//       <div className="background-elements">
//         <Routes>
//           <Route path="/login" element={<Login onLogin={handleLogin} />} />
//           <Route path="/register" element={<Register />} />
//           <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
//             <Route
//               element={
//                 <Layout
//                   userRole={userRole}
//                   onLogout={handleLogout}
//                   onProfileImageUpdate={profileImage}
//                 />
//               }
//             >
//               <Route path="/profile" element={<Profile onProfileImageUpdate={handleProfileImageUpdate} />} />
//               <Route path="/legal-info" element={<LegalInfo />} />
//               <Route path="/admin/*" element={
//                 userRole === 'admin' ? (
//                   <Routes>
//                     <Route path="/" element={<AdminDashboard />} />
//                     <Route path="police-stations" element={<PoliceStationsAdmin />} />
//                     <Route path="reports" element={<Reports />} />
//                     <Route path="legal-database" element={<LegalDatabase />} />
//                     <Route path="fir/:id" element={<FIRDetails />} />
//                     <Route path="search" element={<FIRSearch />} />
//                     <Route path="police-officers" element={<PoliceOfficers />} />
//                     <Route path="ipc-sections" element={<IPCSections />} />
//                   </Routes>
//                 ) : <Navigate to={`/${userRole}`} replace />
//               } />
//               <Route path="/police/*" element={
//                 userRole === 'police' ? (
//                   <Routes>
//                     <Route path="/" element={<PoliceDashboard />} />
//                     <Route path="fir/new" element={<FIRForm />} />
//                     <Route path="fir/:id" element={<FIRDetails />} />
//                     <Route path="search" element={<FIRSearch />} />
//                     <Route path="fir/viewfirs" element={<ViewFIRS />} />
//                     <Route path="complaints" element={<Complaint />} />
//                     <Route path="viewsections" element={<ViewSections />} />
//                   </Routes>
//                 ) : <Navigate to={`/${userRole}`} replace />
//               } />
//               <Route path="/citizen/*" element={
//                 userRole === 'citizen' ? (
//                   <Routes>
//                     <Route path="/" element={<CitizenDashboard />} />
//                     <Route path="complaint/new" element={<ComplaintForm />} />
//                     <Route path="complaint/:id" element={<ComplaintStatus />} />
//                   </Routes>
//                 ) : <Navigate to={`/${userRole}`} replace />
//               } />
//               <Route path="/" element={<Navigate to={`/${userRole}`} replace />} />
//             </Route>
//           </Route>
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;