// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "../styles/navbar.css";
// import HeaderLogo from "../../assets/headerLogoLawAssist.mp4";

// const Navbar = () => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const navigate = useNavigate();

//     // Check authentication status when component loads
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         setIsAuthenticated(!!token); // Convert to boolean
//     }, []);

//     // Logout function
//     const handleLogout = () => {
//         localStorage.removeItem("token"); // Remove auth token
//         localStorage.removeItem("userRole"); // Remove stored role (if any)
//         setIsAuthenticated(false);
//         navigate("/login"); // Redirect to login page
//     };

//     return (
//         <nav className="navbar">
//             <div className="logo">
//                 <video autoPlay loop muted playsInline>
//                     <source src={HeaderLogo} type="video/mp4" />
//                     Your browser does not support the video tag.
//                 </video>
//             </div>

//             <div className="nav-links">
//                 <Link to="/" className="nav-item">Home</Link>
//                 <Link to="/firs" className="nav-item">FIRS</Link>
//                 <Link to="/fill-fir" className="nav-item">FILL FIR</Link>
//                 <Link to="/resources" className="nav-item">Resources</Link>
//             </div>

//             <div className="login-button">
//                 {isAuthenticated ? (
//                     <button onClick={handleLogout}>Logout</button>
//                 ) : (
//                     <Link to="/login">
//                         <button>Login</button>
//                     </Link>
//                 )}
//             </div>
//         </nav>
//     );
// };

// export default Navbar;
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import HeaderLogo from "../../assets/headerLogoLawAssist.mp4";

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        setIsAuthenticated(!!token);
        setUserRole(role);

        // Listen for login updates across different components
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
            setUserRole(localStorage.getItem("userRole"));
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setUserRole(null);
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <video autoPlay loop muted playsInline>
                    <source src={HeaderLogo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="nav-links">
                {userRole === "Police" && (
                    <>
                        <Link to="/police-dashboard" className="nav-item">Dashboard</Link>
                        <Link to="/firs" className="nav-item">FIRs</Link>
                        <Link to="/fill-fir" className="nav-item">Fill FIR</Link>
                    </>
                )}
                {userRole === "Admin" && (
                    <>
                        <Link to="/admin-dashboard" className="nav-item">Admin Dashboard</Link>
                        <Link to="/view-officer" className="nav-item">View Officers</Link>
                        <Link to="/add-officer" className="nav-item">Add Officer</Link>
                    </>
                )}
                <Link to="/resources" className="nav-item">Resources</Link>
            </div>

            <div className="login-button">
                {isAuthenticated ? (
                    <button onClick={handleLogout}>Logout</button>
                ) : (
                    <Link to="/login">
                        <button>Login</button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
