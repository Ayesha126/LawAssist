import React from 'react';
import { Link } from 'react-router-dom';
// import lawAssistLogo from '/path-to-your-logo.png'; // Replace with the actual logo path
// import dashboardBg from '/path-to-your-background.png'; // Replace with actual background path

const CitizenDashboard = () => {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6"
        // style={{ backgroundImage: `url(${dashboardBg})` }}
        >
            {/* Logo */}
            <div className="mb-6">
                {/* <img src={lawAssistLogo} alt="LawAssist Logo" className="w-32 h-auto" /> */}
            </div>

            <h1 className="text-3xl font-bold text-white mb-6">Citizen Dashboard</h1>

            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                <Link to="/citizen/complaint/new"
                    className="p-6 bg-blue-500 text-white font-semibold rounded-lg text-center shadow-lg hover:bg-blue-600 transition">
                    File Complaint
                </Link>
                <Link to="/citizen/legal-info"
                    className="p-6 bg-green-500 text-white font-semibold rounded-lg text-center shadow-lg hover:bg-green-600 transition">
                    View Legal Info
                </Link>
                <Link to="/citizen/complaint/:id"
                    className="p-6 bg-yellow-500 text-white font-semibold rounded-lg text-center shadow-lg hover:bg-yellow-600 transition">
                    Check Complaint Status
                </Link>
            </div>
        </div>
    );
};

export default CitizenDashboard;
