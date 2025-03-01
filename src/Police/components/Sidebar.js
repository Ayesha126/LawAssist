// import React, { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { ChevronRight, Menu, X, LayoutDashboard, FileText, FilePlus, Users, LogOut } from 'lucide-react';
// import '../styles/sidebar.css';

// const Sidebar = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [activeMenu, setActiveMenu] = useState(null);
//   const [userRole, setUserRole] = useState(localStorage.getItem('userRole')); // Store userRole in state
//   const location = useLocation();

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setUserRole(localStorage.getItem('userRole')); // Update when userRole changes
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   useEffect(() => {
//     setUserRole(localStorage.getItem('userRole')); // Ensure state updates on mount
//   }, [location]); // Re-run when route changes

//   const menuItems = {
//     Police: [
//       { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/police-dashboard' },
//       {
//         id: 'fir',
//         title: 'FIR Management',
//         icon: <FileText size={20} />,
//         submenu: [
//           // { title: 'View All FIRs', path: '/firs' },
//           // { title: 'Register FIR', path: '/fill-fir' },
//           { title: 'Add Fir', path: '/add-fir' },
//           { title: 'View Fir', path: '/view-fir' },

//         ]
//       },
//       {
//         id: 'complaints',
//         title: 'Complaint Management',
//         icon: <FilePlus size={20} />,
//         submenu: [
//           { title: 'Add Complaint', path: '/add-complaint' },
//           { title: 'View Complaint', path: '/view-complaint' }
//         ]
//       },
//       { id: 'sections', title: 'View Sections', icon: <FileText size={20} />, path: '/view-section' }

//     ],
//     Admin: [
//       { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin-dashboard' },
//       {
//         id: 'stations',
//         title: 'Station Management',
//         icon: <FilePlus size={20} />,
//         submenu: [
//           { title: 'View Stations', path: '/view-station' },
//           { title: 'Add Station', path: '/add-station' }
//         ]
//       },
//       {
//         id: 'officers',
//         title: 'Officer Management',
//         icon: <Users size={20} />,
//         submenu: [
//           { title: 'View Officers', path: '/view-officer' },
//           { title: 'Add Officer', path: '/add-officer' }
//         ]
//       },
//       {
//         id: 'sections',
//         title: 'Sections Management',
//         icon: <FilePlus size={20} />,
//         submenu: [
//           { title: 'View Sections', path: '/view-section' },
//           { title: 'Add Section', path: '/add-section' }
//         ]
//       }
//     ]
//   };

//   const toggleMenu = (menuId) => {
//     setActiveMenu(activeMenu === menuId ? null : menuId);
//   };

//   const isPathActive = (path) => location.pathname === path;

//   return (
//     <>
//       <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
//         {isCollapsed ? <Menu size={20} /> : <X size={20} />}
//       </button>

//       <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
//         <div className="logo-area">{!isCollapsed && <h1>Law Assist</h1>}</div>

//         <div className="sidebar-menu">
//           {menuItems[userRole]?.map((item) =>
//             item.submenu ? (
//               <div key={item.id} className="menu-item">
//                 <button className={`menu-button ${activeMenu === item.id ? 'active' : ''}`} onClick={() => toggleMenu(item.id)}>
//                   <span className="menu-icon">{item.icon}</span>
//                   {!isCollapsed && <><span className="menu-label">{item.title}</span><ChevronRight size={16} className={`menu-arrow ${activeMenu === item.id ? 'active' : ''}`} /></>}
//                 </button>
//                 {!isCollapsed && (
//                   <div className={`submenu ${activeMenu === item.id ? 'open' : ''}`}>
//                     {item.submenu.map((subItem, index) => (
//                       <Link key={index} to={subItem.path} className={`submenu-item ${isPathActive(subItem.path) ? 'active' : ''}`}>{subItem.title}</Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <Link key={item.id} to={item.path} className={`menu-button ${isPathActive(item.path) ? 'active' : ''}`}>
//                 <span className="menu-icon">{item.icon}</span>
//                 {!isCollapsed && <span className="menu-label">{item.title}</span>}
//               </Link>
//             )
//           )}

//           <button className="menu-button logout" onClick={() => {
//             localStorage.removeItem('userRole');
//             localStorage.removeItem('token');
//             setUserRole(null); // Update state to trigger re-render
//             window.location.href = '/login';
//           }}>
//             <span className="menu-icon"><LogOut size={20} /></span>
//             {!isCollapsed && <span className="menu-label">Logout</span>}
//           </button>
//         </div>
//       </div>

//       <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`} />
//     </>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Menu, X, LayoutDashboard, FileText, FilePlus, Users, LogOut } from "lucide-react";
import "../styles/sidebar.css";

const Sidebar = ({ userRole, isCollapsed, toggleSidebar }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      const newRole = localStorage.getItem("userRole");
      if (newRole !== userRole) {
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userRole]);

  const menuItems = {
    Police: [
      { id: "dashboard", title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/police-dashboard" },
      {
        id: "fir",
        title: "FIR Management",
        icon: <FileText size={20} />,
        submenu: [
          { title: "Add Fir", path: "/add-fir" },
          { title: "View Fir", path: "/view-fir" },
        ],
      },
      {
        id: "complaints",
        title: "Complaint Management",
        icon: <FilePlus size={20} />,
        submenu: [
          { title: "Add Complaint", path: "/add-complaint" },
          { title: "View Complaint", path: "/view-complaint" },
        ],
      },
      { id: "sections", title: "View Sections", icon: <FileText size={20} />, path: "/view-section" },
    ],
    Admin: [
      { id: "dashboard", title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin-dashboard" },
      {
        id: "stations",
        title: "Station Management",
        icon: <FilePlus size={20} />,
        submenu: [
          { title: "View Stations", path: "/view-station" },
          { title: "Add Station", path: "/add-station" },
        ],
      },
      {
        id: "officers",
        title: "Officer Management",
        icon: <Users size={20} />,
        submenu: [
          { title: "View Officers", path: "/view-officer" },
          { title: "Add Officer", path: "/add-officer" },
        ],
      },
      {
        id: "sections",
        title: "Sections Management",
        icon: <FilePlus size={20} />,
        submenu: [
          { title: "View Sections", path: "/view-section" },
          { title: "Add Section", path: "/add-section" },
        ],
      },
    ],
  };

  const toggleMenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const isPathActive = (path) => location.pathname === path;

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="logo-area">{!isCollapsed && <h1>Law Assist</h1>}</div>

        <div className="sidebar-menu">
          {menuItems[userRole]?.map((item) =>
            item.submenu ? (
              <div key={item.id} className="menu-item">
                <button
                  className={`menu-button ${activeMenu === item.id ? "active" : ""}`}
                  onClick={() => toggleMenu(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="menu-label">{item.title}</span>
                      <ChevronRight
                        size={16}
                        className={`menu-arrow ${activeMenu === item.id ? "active" : ""}`}
                      />
                    </>
                  )}
                </button>
                {!isCollapsed && (
                  <div className={`submenu ${activeMenu === item.id ? "open" : ""}`}>
                    {item.submenu.map((subItem, index) => (
                      <Link
                        key={index}
                        to={subItem.path}
                        className={`submenu-item ${isPathActive(subItem.path) ? "active" : ""}`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.id}
                to={item.path}
                className={`menu-button ${isPathActive(item.path) ? "active" : ""}`}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isCollapsed && <span className="menu-label">{item.title}</span>}
              </Link>
            )
          )}

          <button
            className="menu-button logout"
            onClick={() => {
              localStorage.removeItem("userRole");
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <span className="menu-icon">
              <LogOut size={20} />
            </span>
            {!isCollapsed && <span className="menu-label">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;