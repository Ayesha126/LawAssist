import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import ProfileDef from '../assets/profile.jpg';

const Header = ({ onLogout, userRole, isSidebarCollapsed, onProfileImageUpdate }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userName, setUserName] = useState("User");
    const [profileImage, setProfileImage] = useState(ProfileDef);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const userId = decoded.user_id;

                    const response = await fetch(`http://localhost:8000/users/${userId}`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!response.ok) throw new Error("Failed to fetch user details");

                    const userData = await response.json();
                    console.log('Header Fetch Response:', userData);
                    setUserName(userData.name || "User");
                    setProfileImage(userData.profileImage || ProfileDef);
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    setUserName("User");
                    setProfileImage(ProfileDef);
                }
            }
        };
        fetchUserData();
    }, []); // Runs only on mount

    // Sync profileImage with onProfileImageUpdate
    useEffect(() => {
        console.log('Header: onProfileImageUpdate received:', onProfileImageUpdate);
        if (onProfileImageUpdate !== null && onProfileImageUpdate !== undefined) {
            setProfileImage(onProfileImageUpdate || ProfileDef);
            console.log('Header: Updated profileImage to:', onProfileImageUpdate || ProfileDef);
        }
    }, [onProfileImageUpdate]);

    const roleDisplayName = {
        admin: "Administrator",
        police: "Police Officer",
        citizen: "Citizen",
    };

    const notifications = [
        { id: 1, message: "New FIR filed by a citizen" },
        { id: 2, message: "System update scheduled for tomorrow" },
        { id: 3, message: "New legal case added to the database" },
    ];

    return (
        <header className={`bg-white shadow ${isSidebarCollapsed ? "collapsed" : ""}`}>
            <div className="flex justify-between items-center px-6 py-3">
                <h1 className="text-xl font-semibold text-gray-800">
                    LawAssist: Smart Police FIR Filing System
                </h1>
                <div className="flex items-center gap-6 relative">
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={22} />
                        </motion.button>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="px-4 py-2 font-semibold bg-gray-100">Notifications</div>
                                {notifications.length > 0 ? (
                                    <ul>
                                        {notifications.map((notif) => (
                                            <li key={notif.id} className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition-all duration-200">
                                                {notif.message}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-2 text-gray-500">No new notifications</div>
                                )}
                            </motion.div>
                        )}
                    </div>
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <User size={22} />
                        </motion.button>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.3 }}
                                className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg"
                            >
                                <div className="flex flex-col items-center px-4 py-4">
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-16 h-16 rounded-full border"
                                        onError={(e) => {
                                            console.log('Image load error, reverting to default');
                                            e.target.src = ProfileDef;
                                        }}
                                    />
                                    <div className="text-center mt-2">
                                        <p className="font-semibold text-gray-800">{userName}</p>
                                        <p className="text-sm text-gray-600">{roleDisplayName[userRole]}</p>
                                    </div>
                                </div>
                                <ul className="border-t">
                                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition-all duration-200 text-center">
                                        <Link to="/profile">Edit Profile</Link>
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600 transition-all duration-200 text-center"
                                        onClick={onLogout}
                                    >
                                        Logout
                                    </li>
                                </ul>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;