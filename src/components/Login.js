import "../styles/login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import LoginLogo from "../assets/loginpageImg.png";


const Login = () => {
    // Scroll to top when component mounts (Login Page opens)


    return (
        <div className="login-container">
            <div className="login-card">
                {/* Left Side: Login Form */}
                <div className="login-form">
                    <h2>Login into your account</h2>
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input type="email" placeholder="alex@email.com" />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input type="password" placeholder="Enter your password" />
                    </div>
                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>
                    <button className="login-btn">Login now</button>
                </div>

                {/* Right Side: Image */}
                <div className="login-image">
                    <img src={LoginLogo} alt="Login page logo" />
                </div>
            </div>
        </div>
    );
};

export default Login;
