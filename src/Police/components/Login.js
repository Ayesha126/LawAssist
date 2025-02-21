import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import LoginLogo from "../../assets/loginpageImg.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError("");
    
        try {
            console.log("Attempting login...");
    
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Login failed");
            }
    
            const data = await response.json();
            const token = data.token;
            const role = data.user?.role;
    
            if (!token || !role) {
                throw new Error("Invalid response from server");
            }
    
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", role);
    
            // Dispatch an event to notify other components (Navbar)
            window.dispatchEvent(new Event("storage"));
    
            setTimeout(() => {
                navigate(role === "Admin" ? "/admin-dashboard" : "/police-dashboard");
            }, 500);
    
        } catch (err) {
            console.error("Login error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-form">
                    <h2>Login to your account</h2>

                    {error && <p className="error-message">{error}</p>}

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="alex@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    <button 
                        className="login-btn" 
                        onClick={handleLogin} 
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login now"}
                    </button>
                </div>

                <div className="login-image">
                    <img src={LoginLogo} alt="Login page logo" />
                </div>
            </div>
        </div>
    );
};

export default Login;
