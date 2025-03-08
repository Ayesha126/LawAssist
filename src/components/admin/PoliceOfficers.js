import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding } from "react-icons/fa";
import AddOfficer from "./AddOfficer";

const PoliceOfficers = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [updating, setUpdating] = useState(false);
    const [editOfficer, setEditOfficer] = useState(null);
    const [stations, setStations] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchOfficers();
        fetchStations();
    }, []);

    const fetchOfficers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("http://localhost:8000/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch officers");

            const users = await response.json();
            const policeOfficers = users.filter((user) => user.role === "Police");
            setOfficers(policeOfficers);
        } catch (error) {
            console.error("Fetch officers error:", error);
            setError("Error fetching officers. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        try {
            const response = await fetch("http://localhost:8000/stations", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await response.json();
            if (response.ok) setStations(data);
            else throw new Error("Failed to fetch stations");
        } catch (error) {
            console.error("Fetch stations error:", error.message);
        }
    };

    const toggleStatus = async (officerId, currentStatus) => {
        if (updating) return;
        setUpdating(true);
        setError("");
        setSuccessMessage("");

        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

        try {
            const response = await fetch(`http://localhost:8000/users/${officerId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Failed to update officer status");

            setOfficers((prevOfficers) =>
                prevOfficers.map((officer) =>
                    officer.user_id === officerId ? { ...officer, status: newStatus } : officer
                )
            );
            setSuccessMessage(`Officer status updated to ${newStatus}!`);
        } catch (error) {
            console.error("Toggle status error:", error);
            setError(error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleEditChange = (e) => {
        setEditOfficer({ ...editOfficer, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`http://localhost:8000/users/${editOfficer.user_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ ...editOfficer, role: "Police" }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || "Failed to update officer");

            setSuccessMessage("Officer updated successfully!");
            setEditOfficer(null);
            await fetchOfficers();
        } catch (error) {
            console.error("Edit officer error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (officerId) => {
        if (!window.confirm("Are you sure you want to delete this officer?")) return;

        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`http://localhost:8000/users/${officerId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete officer");

            setSuccessMessage("Officer deleted successfully!");
            await fetchOfficers();
        } catch (error) {
            console.error("Delete officer error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (officer) => {
        console.log("Editing officer:", officer); // Debug log
        setEditOfficer({ ...officer, station: officer.station?._id || officer.station });
    };

    return (
        <div className="p-6 text-gray-800 min-h-screen">
            <h2 className="text-3xl font-semibold mb-6">Police Officers</h2>

            <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
                <AddOfficer fetchOfficers={fetchOfficers} stations={stations} />
            </div>

            {loading && <p className="text-gray-500">Loading officers...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <table className="w-full text-left text-gray-800">
                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">Officer Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Contact</th>
                            <th className="p-3">Station</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {officers.map((officer) => (
                            <tr key={officer.user_id} className="border-b hover:bg-gray-100">
                                <td className="p-3">{officer.user_id}</td>
                                <td className="p-3">{officer.name}</td>
                                <td className="p-3">{officer.email}</td>
                                <td className="p-3">{officer.contact}</td>
                                <td className="p-3">{officer.station?.name || "N/A"}</td>
                                <td className="p-3">
                                    <button
                                        className={`px-2 py-1 rounded text-white cursor-pointer ${officer.status === "Active" ? "bg-green-500" : "bg-red-500"
                                            }`}
                                        onClick={() => toggleStatus(officer.user_id, officer.status)}
                                        disabled={updating}
                                    >
                                        {officer.status}
                                    </button>
                                </td>
                                <td className="p-3 flex space-x-2">
                                    <button
                                        className="flex items-center bg-blue-500 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-600 cursor-pointer"
                                        onClick={() => handleEdit(officer)}
                                    >
                                        <FaEdit className="mr-2" /> Edit
                                    </button>
                                    <button
                                        className="flex items-center bg-red-500 text-white px-4 py-1 rounded-lg shadow hover:bg-red-600 cursor-pointer"
                                        onClick={() => handleDelete(officer.user_id)}
                                    >
                                        <FaTrash className="mr-2" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editOfficer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Edit Officer</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="flex items-center border rounded-lg p-2">
                                <FaUser className="text-gray-500 mr-2" />
                                <input
                                    required
                                    name="name"
                                    value={editOfficer.name}
                                    onChange={handleEditChange}
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
                                    value={editOfficer.email}
                                    onChange={handleEditChange}
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
                                    value={editOfficer.contact}
                                    onChange={handleEditChange}
                                    placeholder="Contact Number"
                                    className="w-full outline-none"
                                    type="text"
                                />
                            </div>
                            <div className="flex items-center border rounded-lg p-2">
                                <FaLock className="text-gray-500 mr-2" />
                                <input
                                    name="password"
                                    value={editOfficer.password || ""}
                                    onChange={handleEditChange}
                                    placeholder="New Password (optional)"
                                    className="w-full outline-none"
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 cursor-pointer"
                                >
                                    {showPassword ? "👁️" : "🙈"}
                                </button>
                            </div>
                            <div className="flex items-center border rounded-lg p-2">
                                <FaBuilding className="text-gray-500 mr-2" />
                                <select
                                    required
                                    name="station"
                                    value={editOfficer.station}
                                    onChange={handleEditChange}
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
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update Officer"}
                                </button>
                                <button
                                    type="button"
                                    className="w-full bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 cursor-pointer"
                                    onClick={() => setEditOfficer(null)}
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

export default PoliceOfficers;