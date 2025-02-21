import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import HeaderLogo from "../assets/headerLogoLawAssist.mp4";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">
                <video autoPlay loop muted playsInline>
                    <source src={HeaderLogo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="nav-links">
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/firs" className="nav-item">FIRS</Link>
                <Link to="/fill-fir" className="nav-item">FILL FIR</Link>
                <Link to="/resources" className="nav-item">Resources</Link>
            </div>

            <div className="login-button">
                <Link to="/login">
                    <button>Login</button>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
