import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home, Users, FileText, Search, Gavel, Library, BarChart, Settings, Menu, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LawAssistLogo from "../assets/LawAssistLogo"; // Import the custom logo

const Sidebar = ({ userRole }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const isActive = (path) =>
        location.pathname.includes(path) ? "bg-gradient-to-r from-gray-700 to-blue-500 text-white" : "text-gray-300";

    const menuItems = {
        admin: [
            { path: "/admin", label: "Dashboard", icon: <Home size={20} /> },
            { path: "/admin/police-stations", label: "Police Stations", icon: <Library size={20} /> },
            { path: "/admin/police-officers", label: "Police Officers", icon: <Users size={20} /> },
            { path: "/admin/ipc-sections", label: "IPC Sections", icon: <Gavel size={20} /> }
        ],
        police: [
            { path: "/police", label: "Dashboard", icon: <Home size={20} /> },
            { path: "/police/fir/new", label: "File New FIR", icon: <FileText size={20} /> },
            { path: "/police/fir/viewfirs", label: "FIRs", icon: <FileText size={20} /> },
            { path: "/police/complaints", label: "Complaints", icon: <FileText size={20} /> },
            // { path: "/police/legal-info", label: "Legal Information", icon: <Gavel size={20} /> },
            { path: "/police/viewsections", label: "View Sections", icon: <BarChart size={20} /> }
            // { path: "/police/reports", label: "Case Reports", icon: <BarChart size={20} /> }
        ],
        citizen: [
            { path: "/citizen", label: "Dashboard", icon: <Home size={20} /> },
            { path: "/citizen/complaint/new", label: "Submit Complaint", icon: <FileText size={20} /> },
            { path: "/citizen/legal-info", label: "Legal Help", icon: <Gavel size={20} /> }
        ]
    };

    return (
        <motion.aside
            initial={{ width: 250 }}
            animate={{ width: isCollapsed ? 80 : 250 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-900 h-screen transition-all flex flex-col"
        >
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between">
                {/* Custom LawAssist Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-0"
                >
                    <div className="p-1 rounded-full">
                        <LawAssistLogo size={8} />
                    </div>
                    {!isCollapsed && (
                        <motion.h2
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg font-bold text-white"
                        >
                            LawAssist
                        </motion.h2>
                    )}
                </motion.div>

                {/* Toggle Button */}
                <motion.button
                    onClick={toggleSidebar}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: isCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-300 hover:text-white transition duration-300"
                >
                    {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
                </motion.button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="mt-4 flex-grow">
                <ul>
                    <AnimatePresence>
                        {menuItems[userRole]?.map((item, index) => (
                            <motion.li
                                key={item.path}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="px-4 py-2"
                            >
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 p-2 rounded-md transition duration-300 
                                    ${isActive(item.path)}
                                    hover:bg-gradient-to-r hover:from-gray-700 hover:to-blue-500 hover:text-white`}
                                >
                                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                        {item.icon}
                                    </motion.div>
                                    {!isCollapsed && <motion.span>{item.label}</motion.span>}
                                </Link>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
