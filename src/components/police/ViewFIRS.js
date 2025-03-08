import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

const ViewFIRS = () => {
    const [firs, setFirs] = useState([]);
    const [filteredFirs, setFilteredFirs] = useState([]);
    const [stations, setStations] = useState({});
    const [citizens, setCitizens] = useState({});
    const [officers, setOfficers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [userStationId, setUserStationId] = useState(null);
    const [editFir, setEditFir] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [cognizableFilter, setCognizableFilter] = useState("all");

    // Debugging function
    const debugLog = (message, data) => {
        console.log(`[DEBUG] ${message}:`, data);
    };

    // Get logged-in user's ID from token
    const getLoggedInUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("User not authenticated. Please log in.");
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded.user_id) {
                setError("User ID not found in token. Contact admin.");
                return null;
            }
            return decoded.user_id;
        } catch (error) {
            console.error("Error decoding token:", error);
            setError("Failed to decode user information. Please log in again.");
            return null;
        }
    };

    // Fetch user details to get station
    const fetchUserDetails = async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch user details");
            const userData = await response.json();
            debugLog("Fetched user data", userData);
            if (!userData.station?._id) throw new Error("User station not found");
            setUserStationId(userData.station._id);
        } catch (error) {
            console.error("Error fetching user details:", error);
            setError(error.message);
        }
    };

    // Fetch all stations
    const fetchStations = async () => {
        try {
            const response = await fetch("http://localhost:8000/stations", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch stations");
            const data = await response.json();
            const stationLookup = data.reduce((acc, station) => ({
                ...acc,
                [station._id]: station,
                [station.station_id]: station,
            }), {});
            setStations(stationLookup);
            debugLog("Fetched stations", stationLookup);
        } catch (error) {
            console.error("Error fetching stations:", error);
            setError(error.message);
        }
    };

    // Fetch all citizens
    const fetchCitizens = async () => {
        try {
            const response = await fetch("http://localhost:8000/citizen", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch citizens");
            const data = await response.json();
            const citizenLookup = data.reduce((acc, citizen) => ({
                ...acc,
                [citizen._id]: citizen,
                [citizen.c_id]: citizen,
            }), {});
            setCitizens(citizenLookup);
            debugLog("Fetched citizens", citizenLookup);
        } catch (error) {
            console.error("Error fetching citizens:", error);
            setError(error.message);
        }
    };

    // Fetch all FIRs
    const fetchFirs = async () => {
        if (!userStationId) return;
        try {
            const response = await fetch("http://localhost:8000/firs", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error(`Failed to fetch FIRs: ${response.status}`);
            const data = await response.json();
            debugLog("Raw FIRs data", data);

            const filteredFirs = data
                .map((fir) => {
                    const userStation = fir.user?.station?._id || fir.user?.station;
                    const complaintStation =
                        fir.complaint?.assigned_station?._id || fir.complaint?.assigned_station;
                    return String(userStation) === String(userStationId) ||
                        String(complaintStation) === String(userStationId)
                        ? fir
                        : null;
                })
                .filter((fir) => fir !== null);
            debugLog("Filtered FIRs by station", filteredFirs);
            setFirs(filteredFirs);
            setFilteredFirs(filteredFirs);

            await Promise.all([
                ...filteredFirs.map((fir) => fir.user && fetchOfficerById(fir.user.user_id || fir.user)),
            ]);
        } catch (error) {
            console.error("Error fetching FIRs:", error);
            setError(error.message);
        }
    };

    // Fetch officer by user_id
    const fetchOfficerById = async (userId) => {
        if (!userId || officers[userId]) return;
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error(`Failed to fetch officer ${userId}`);
            const officerData = await response.json();
            debugLog(`Fetched officer ${userId}`, officerData);
            setOfficers((prev) => ({ ...prev, [officerData.user_id]: officerData }));
        } catch (error) {
            console.error(`Error fetching officer with ID ${userId}:`, error);
        }
    };

    // Search FIRs
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) {
            setFilteredFirs(firs);
            return;
        }
        try {
            const response = await fetch(`http://localhost:8000/firs/search?query=${searchQuery}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to search FIRs");
            const data = await response.json();
            debugLog("Search results", data);
            setFilteredFirs(data);
        } catch (error) {
            console.error("Error searching FIRs:", error);
            setError("Failed to search FIRs. Please try again.");
        }
    };

    // Apply filters
    useEffect(() => {
        let tempFirs = [...firs];

        // Date filter
        if (dateFilter) {
            tempFirs = tempFirs.filter((fir) => {
                const firDate = new Date(fir.createdAt || fir.date);
                const filterDate = new Date(dateFilter);
                return firDate.toISOString().split("T")[0] === filterDate.toISOString().split("T")[0];
            });
        }

        // Cognizable/Non-cognizable filter
        if (cognizableFilter !== "all") {
            tempFirs = tempFirs.filter((fir) => {
                const isCognizable = determineCognizable(fir.sections);
                return cognizableFilter === "cognizable" ? isCognizable : !isCognizable;
            });
        }

        setFilteredFirs(tempFirs);
    }, [dateFilter, cognizableFilter, firs]);

    // Determine if an FIR is cognizable based on sections
    const determineCognizable = (sections) => {
        if (!sections || sections.length === 0) return false;
        const cognizableSections = ["IPC 302", "IPC 376", "IPC 420"];
        return sections.some((section) => cognizableSections.includes(section.section));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return "Invalid date";
        }
    };

    // Get station name
    const getStationName = (fir) => {
        if (fir.complaint) {
            return stations[fir.complaint.assigned_station]?.name || "Loading...";
        }
        return stations[officers[fir.user?.user_id || fir.user]?.station?._id]?.name || "Loading...";
    };

    // Get citizen name
    const getCitizenName = (citizen) => {
        const citizenId = typeof citizen === "object" ? citizen?._id : citizen;
        if (!citizenId) return "None";
        return citizens[citizenId]?.name || "Loading...";
    };

    // Get officer name
    const getOfficerName = (officerId) => {
        if (!officerId) return "Unknown";
        return officers[officerId]?.name || "Loading...";
    };

    // Get IPC sections as a string
    const getIPCSections = (sections) => {
        if (!sections || sections.length === 0) return "None";
        return sections.map((section) => section.section || "Unknown").join(", ");
    };

    // Edit FIR
    const handleEdit = (fir) => {
        setEditFir({
            fir_id: fir.fir_id,
            description: fir.description || "",
            citizen: typeof fir.citizen === "object" ? fir.citizen?._id : fir.citizen || "",
            sections: fir.sections?.map((s) => s.section.replace("IPC ", "")).join(", ") || "",
            evidence: fir.evidence?.join(", ") || "",
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFir((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const userId = getLoggedInUserId();
            if (!userId) throw new Error("User not authenticated");

            const body = {
                description: editFir.description,
                citizen: editFir.citizen || undefined,
                sections: editFir.sections
                    ? editFir.sections.split(",").map((s) => `IPC ${s.trim()}`)
                    : [],
                assigned_officer: userId,
                evidence: editFir.evidence ? editFir.evidence.split(",").map((e) => e.trim()) : undefined,
            };

            debugLog("Updating FIR with body", body);

            const response = await fetch(`http://localhost:8000/firs/${editFir.fir_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update FIR");
            }

            setSuccessMessage(`FIR ID ${editFir.fir_id} updated successfully!`);
            setEditFir(null);
            await fetchFirs();
        } catch (error) {
            console.error("Error updating FIR:", error);
            setError(error.message);
        }
    };

    // Delete FIR
    const handleDelete = async (firId) => {
        if (!window.confirm(`Are you sure you want to delete FIR ID ${firId}?`)) return;

        try {
            const response = await fetch(`http://localhost:8000/firs/${firId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error("Failed to delete FIR");

            setSuccessMessage(`FIR ID ${firId} deleted successfully!`);
            await fetchFirs();
        } catch (error) {
            console.error("Error deleting FIR:", error);
            setError(error.message);
        }
    };

    // Initialize data on component mount
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                const userId = getLoggedInUserId();
                if (!userId) return;
                await fetchUserDetails(userId);
                await Promise.all([fetchStations(), fetchCitizens()]);
                await fetchFirs();
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, [userStationId]);

    // Pagination logic
    const paginatedFirs = filteredFirs.slice((page - 1) * limit, page * limit);

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">View FIRs</h1>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setDateFilter("");
                            setCognizableFilter("all");
                            setFilteredFirs(firs);
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search FIRs
                            </label>
                            <form onSubmit={handleSearch}>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Search by keyword, FIR ID, or citizen name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Date
                            </label>
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cognizable/Non-Cognizable
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={cognizableFilter}
                                onChange={(e) => setCognizableFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="cognizable">Cognizable</option>
                                <option value="non-cognizable">Non-Cognizable</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                ) : successMessage ? (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
                        <p className="font-semibold">Success</p>
                        <p>{successMessage}</p>
                    </div>
                ) : filteredFirs.length === 0 ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg">
                        <p className="font-semibold">No Data</p>
                        <p>No FIRs found.</p>
                    </div>
                ) : (
                    <>
                        {/* FIR Table */}
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                        <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                                            <th className="py-4 px-6 text-left">ID</th>
                                            <th className="py-4 px-6 text-left">Description</th>
                                            <th className="py-4 px-6 text-left">Complaint ID</th>
                                            <th className="py-4 px-6 text-left">Station</th>
                                            <th className="py-4 px-6 text-left">Citizen</th>
                                            <th className="py-4 px-6 text-left">Sections</th>
                                            <th className="py-4 px-6 text-left">Officer</th>
                                            <th className="py-4 px-6 text-left">Status</th>
                                            <th className="py-4 px-6 text-left">Filed On</th>
                                            <th className="py-4 px-6 text-left">Cognizable</th>
                                            <th className="py-4 px-6 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedFirs.map((fir) => (
                                            <tr
                                                key={fir.fir_id || fir._id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition"
                                            >
                                                <td className="py-4 px-6 text-gray-800">{fir.fir_id}</td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {fir.description?.length > 50
                                                        ? `${fir.description.substring(0, 50)}...`
                                                        : fir.description || "No description"}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {fir.complaint?.complaint_id || "Direct"}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600">{getStationName(fir)}</td>
                                                <td className="py-4 px-6 text-gray-600">{getCitizenName(fir.citizen)}</td>
                                                <td className="py-4 px-6 text-gray-600">{getIPCSections(fir.sections)}</td>
                                                <td className="py-4 px-6 text-gray-600">{getOfficerName(fir.user?.user_id || fir.user)}</td>
                                                <td className="py-4 px-6 text-gray-600">{fir.status || "Unknown"}</td>
                                                <td className="py-4 px-6 text-gray-600">{formatDate(fir.createdAt || fir.date)}</td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {determineCognizable(fir.sections) ? "Yes" : "No"}
                                                </td>
                                                <td className="py-4 px-6 flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(fir)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(fir.fir_id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center items-center space-x-4">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700 font-medium">Page {page}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={paginatedFirs.length < limit}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {/* Edit Modal */}
                {editFir && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit FIR</h3>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={editFir.description}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter FIR description"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Citizen Contact (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="citizen"
                                        value={editFir.citizen}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter citizen contact number"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        IPC Sections (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="sections"
                                        value={editFir.sections}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., 304, 376"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Evidence (comma-separated URLs, optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="evidence"
                                        value={editFir.evidence}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                    >
                                        Update FIR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditFir(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewFIRS;