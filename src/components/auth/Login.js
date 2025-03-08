import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoginSkeleton from "../common/LoginSkeleton"; // ✅ Import Skeleton Loader

const Login = ({ onLogin }) => {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  // ✅ Set loading to true

        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: credentials.username,
                    password: credentials.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Login failed");
            }

            const data = await response.json();
            const token = data.token;
            const role = data.user?.role?.toLowerCase();

            if (!token || !role) {
                throw new Error("Invalid response from server");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("userRole", role);

            onLogin(role);
            navigate(`/${role}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);  // ✅ Set loading to false after request
        }
    };

    // ✅ Show Skeleton Loader when loading
    if (loading) {
        return <LoginSkeleton />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-yellow-100 relative">
            <div className="absolute w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 top-10 left-10 animate-pulse"></div>
            <div className="absolute w-56 h-56 bg-yellow-300 rounded-full blur-3xl opacity-30 bottom-10 right-10 animate-pulse"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white bg-opacity-60 backdrop-blur-lg border border-white/50 p-8 rounded-2xl shadow-lg max-w-md w-full"
            >
                <h1 className="text-3xl font-semibold text-gray-700 text-center mb-6">LawAssist Login</h1>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-600 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition duration-300"
                    >
                        Login
                    </motion.button>
                </form>

                <div className="mt-4 text-center text-gray-600">
                    <p>
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-500 hover:underline">
                            Register
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
