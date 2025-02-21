import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserShield,
  FaUserPlus,
  FaUsers,
  FaBars,
  FaChevronDown,
  FaExclamationCircle,
  FaRegClipboard ,
  FaFileAlt ,
  FaPen  // New icon for complaint form
} from "react-icons/fa";
import "../style/Sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
        <FaBars />
      </button>
      <ul className="menu">
        <li>
          <Link to="/dashboard">
            <FaTachometerAlt />
            <span className={`menu-text ${collapsed ? "hidden" : ""}`}>Dashboard</span>
          </Link>
        </li>
        <li className={`submenu ${openSubMenu ? "open" : ""}`}>
          <button className="submenu-btn" onClick={() => setOpenSubMenu(!openSubMenu)}>
            <FaUserShield />
            <span className={`menu-text ${collapsed ? "hidden" : ""}`}>Manage Officer</span>
            {!collapsed && <FaChevronDown className={`arrow ${openSubMenu ? "rotated" : ""}`} />}
          </button>
          <ul className={`submenu-items ${openSubMenu ? "open" : ""}`}>
            <li>
              <Link to="/add-officer">
                <FaUserPlus />
                <span className={`menu-text ${collapsed ? "hidden" : ""}`}>Add Officer</span>
              </Link>
            </li>
            <li>
              <Link to="/view-officer">
                <FaUsers />
                <span className={`menu-text ${collapsed ? "hidden" : ""}`}>View Officer</span>
              </Link>
            </li>
          </ul>
        </li>
        {/* Complaint Form Link */}
        <li>
          <Link to="/complaint-form">
            <FaFileAlt/>
            <span className={`menu-text ${collapsed ? "hidden" : ""}`}>Complaint Form</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
