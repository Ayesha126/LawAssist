import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding } from "react-icons/fa";

const AddOfficer = ({ fetchOfficers, stations }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        password: "",
        station: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:8000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ ...formData, role: "Police" }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Failed to add officer");

            setMessage("Officer added successfully!");
            setFormData({ name: "", email: "", contact: "", password: "", station: "" });
            fetchOfficers();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Police Officer</h3>
            {message && (
                <p className={message.includes("successfully") ? "text-green-500" : "text-red-500"}>
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center border rounded-lg p-2">
                    <FaUser className="text-gray-500 mr-2" />
                    <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Officer Name"
                        className="w-full outline-none"
                        type="text"
                    />
                </div>
                <div className="flex items-center border rounded-lg p-2">
                    <FaEnvelope className="text-gray-500 mr-2" />
                    <input
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full outline-none"
                        type="email"
                    />
                </div>
                <div className="flex items-center border rounded-lg p-2">
                    <FaPhone className="text-gray-500 mr-2" />
                    <input
                        required
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="Contact Number"
                        className="w-full outline-none"
                        type="text"
                    />
                </div>
                <div className="flex items-center border rounded-lg p-2">
                    <FaLock className="text-gray-500 mr-2" />
                    <input
                        required
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full outline-none"
                        type={showPassword ? "text" : "password"}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2"
                    >
                        {showPassword ? "👁️" : "🙈"}
                    </button>
                </div>
                <div className="flex items-center border rounded-lg p-2">
                    <FaBuilding className="text-gray-500 mr-2" />
                    <select
                        required
                        name="station"
                        value={formData.station}
                        onChange={handleChange}
                        className="w-full outline-none"
                    >
                        <option value="">Select Police Station</option>
                        {stations.map((station) => (
                            <option key={station.station_id} value={station.station_id}>
                                {station.name} ({station.station_id})
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 p-3 rounded-lg text-white font-semibold hover:opacity-90 transition duration-200"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Officer"}
                </button>
            </form>
        </div>
    );
};

export default AddOfficer;