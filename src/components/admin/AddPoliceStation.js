import React, { useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe } from "react-icons/fa";

const AddPoliceStation = ({ onStationAdded }) => {
    const [newStation, setNewStation] = useState({
        name: "",
        address: {
            building_number: "",
            street: "",
            area: "",
            city: "",
            state: "",
            postal_code: "",
        },
        contact: "",
        jurisdiction_area: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes("address.")) {
            const field = name.split(".")[1];
            setNewStation((prev) => ({
                ...prev,
                address: { ...prev.address, [field]: value },
            }));
        } else {
            setNewStation((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Add station
    const handleAddStation = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:8000/stations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(newStation),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add station");
            }
            const addedStation = await response.json();
            setNewStation({
                name: "",
                address: { building_number: "", street: "", area: "", city: "", state: "", postal_code: "" },
                contact: "",
                jurisdiction_area: "",
            });
            setMessage("Station added successfully!");
            onStationAdded(addedStation); // Notify parent component
        } catch (error) {
            console.error("Error adding station:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-4xl mx-auto border border-gray-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center tracking-wide">
                Add New Police Station
            </h3>

            <form onSubmit={handleAddStation} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "name", placeholder: "Station Name", icon: <FaBuilding /> },
                        { name: "address.building_number", placeholder: "Building Number", icon: <FaMapMarkerAlt /> },
                        { name: "address.street", placeholder: "Street", icon: <FaMapMarkerAlt /> },
                        { name: "address.area", placeholder: "Area", icon: <FaMapMarkerAlt /> },
                        { name: "address.city", placeholder: "City", icon: <FaMapMarkerAlt /> },
                        { name: "address.state", placeholder: "State", icon: <FaMapMarkerAlt /> },
                        { name: "address.postal_code", placeholder: "Postal Code", icon: <FaMapMarkerAlt /> },
                        { name: "contact", placeholder: "Contact Number", icon: <FaPhone /> },
                        { name: "jurisdiction_area", placeholder: "Jurisdiction Area", icon: <FaGlobe /> },
                    ].map(({ name, placeholder, icon }) => (
                        <div key={name} className="relative">
                            <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 text-lg">
                                {icon}
                            </span>
                            <input
                                type="text"
                                name={name}
                                value={name.includes("address.") ? newStation.address[name.split(".")[1]] : newStation[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                className="pl-12 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                                required
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 font-semibold tracking-wide disabled:bg-gray-400 disabled:scale-100"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "➕ Add Station"}
                </button>
            </form>

            {message && (
                <p
                    className={`mt-4 text-center font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default AddPoliceStation;