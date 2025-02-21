import React from "react";
import "../styles/dashboard.css";
import HomeScreenLogo from "../assets/homeScreenLogo.png";


const Dashboard = () => {
    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-text">
                    <h1>
                        Smart Police FIR Filing System <span className="highlight">LawAssist</span>
                    </h1>
                    <p>AI-powered legal section suggestion</p>
                </div>
                <div className="hero-image">
                    <img src={HomeScreenLogo} alt="AI-powered legal assistance" />
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section">
                <div className="feature-card">
                    <img src="icon1.png" alt="Membership Organisations" />
                    <h3>Membership Organisations</h3>
                    <p>Our membership management software provides full automation of membership renewals and payments.</p>
                </div>

                <div className="feature-card">
                    <img src="icon2.png" alt="National Associations" />
                    <h3>National Associations</h3>
                    <p>Our membership management software provides full automation of membership renewals and payments.</p>
                </div>

                <div className="feature-card">
                    <img src="icon3.png" alt="Clubs And Groups" />
                    <h3>Clubs And Groups</h3>
                    <p>Our membership management software provides full automation of membership renewals and payments.</p>
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
