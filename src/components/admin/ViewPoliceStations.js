import React, { useState, useEffect } from "react";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe, FaEdit, FaTrash } from "react-icons/fa";

const ViewPoliceStations = () => {
    const [stations, setStations] = useState([]);
    const [editStation, setEditStation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch stations on mount
    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/stations", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch stations");
            const data = await response.json();
            setStations(data);
        } catch (error) {
            console.error("Error fetching stations:", error);
            setMessage("Error fetching stations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes for editing
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes("address.")) {
            const field = name.split(".")[1];
            setEditStation((prev) => ({
                ...prev,
                address: { ...prev.address, [field]: value },
            }));
        } else {
            setEditStation((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Edit station
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`http://localhost:8000/stations/${editStation.station_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(editStation),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update station");
            }
            const updatedStation = await response.json();
            setStations((prev) =>
                prev.map((s) => (s.station_id === updatedStation.station_id ? updatedStation : s))
            );
            setEditStation(null);
            setMessage("Station updated successfully!");
            fetchStations(); // Refresh list
        } catch (error) {
            console.error("Error updating station:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete station
    const handleDelete = async (stationId) => {
        if (!window.confirm(`Are you sure you want to delete station ID ${stationId}?`)) return;
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`http://localhost:8000/stations/${stationId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete station");
            }
            setStations((prev) => prev.filter((s) => s.station_id !== stationId));
            setMessage("Station deleted successfully!");
        } catch (error) {
            console.error("Error deleting station:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-6xl mx-auto border border-gray-200">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6 text-center tracking-wide">
                Existing Police Stations
            </h3>

            {loading ? (
                <p className="text-center text-gray-500 animate-pulse">Loading stations...</p>
            ) : stations.length === 0 ? (
                <p className="text-center text-gray-500">No police stations available.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg">
                    <table className="w-full border-collapse rounded-xl shadow-lg">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm uppercase">
                                <th className="p-4 text-left font-semibold">ID</th>
                                <th className="p-4 text-left font-semibold">Name</th>
                                <th className="p-4 text-left font-semibold">Location</th>
                                <th className="p-4 text-left font-semibold">Contact</th>
                                <th className="p-4 text-left font-semibold">Jurisdiction</th>
                                <th className="p-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.map((station, index) => (
                                <tr
                                    key={station.station_id}
                                    className={`border-b text-gray-700 text-sm transition ${index % 2 === 0 ? "bg-gray-100/50" : "bg-white"
                                        } hover:bg-blue-100/50 hover:scale-[1.02] transform transition-all duration-200 ease-in-out`}
                                >
                                    <td className="p-4 font-medium">{station.station_id}</td>
                                    <td className="p-4 font-semibold">{station.name}</td>
                                    <td className="p-4">{station.address.city}, {station.address.state}</td>
                                    <td className="p-4">{station.contact}</td>
                                    <td className="p-4">{station.jurisdiction_area}</td>
                                    <td className="p-4 flex space-x-4">
                                        <button
                                            onClick={() => setEditStation(station)}
                                            className="text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200 flex items-center gap-1 shadow-md cursor-pointer"
                                            title="Edit"
                                        >
                                            <FaEdit size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(station.station_id)}
                                            className="text-red-600 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center gap-1 shadow-md cursor-pointer"
                                            title="Delete"
                                        >
                                            <FaTrash size={16} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {message && (
                <p
                    className={`mt-4 text-center font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}
                >
                    {message}
                </p>
            )}

            {/* Edit Modal */}
            {editStation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl">
                        <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Edit Police Station</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { name: "name", placeholder: "Station Name", icon: <FaBuilding />, value: editStation.name },
                                    { name: "address.building_number", placeholder: "Building Number", icon: <FaMapMarkerAlt />, value: editStation.address.building_number },
                                    { name: "address.street", placeholder: "Street", icon: <FaMapMarkerAlt />, value: editStation.address.street },
                                    { name: "address.area", placeholder: "Area", icon: <FaMapMarkerAlt />, value: editStation.address.area },
                                    { name: "address.city", placeholder: "City", icon: <FaMapMarkerAlt />, value: editStation.address.city },
                                    { name: "address.state", placeholder: "State", icon: <FaMapMarkerAlt />, value: editStation.address.state },
                                    { name: "address.postal_code", placeholder: "Postal Code", icon: <FaMapMarkerAlt />, value: editStation.address.postal_code },
                                    { name: "contact", placeholder: "Contact Number", icon: <FaPhone />, value: editStation.contact },
                                    { name: "jurisdiction_area", placeholder: "Jurisdiction Area", icon: <FaGlobe />, value: editStation.jurisdiction_area },
                                ].map(({ name, placeholder, icon, value }) => (
                                    <div key={name} className="relative">
                                        <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400">{icon}</span>
                                        <input
                                            type="text"
                                            name={name}
                                            value={value}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition disabled:bg-gray-500 font-semibold"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update Station"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditStation(null)}
                                    className="bg-gray-800 text-white py-3 px-6 rounded-lg shadow-md hover:bg-gray-700 transition disabled:bg-gray-600 font-semibold"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewPoliceStations;