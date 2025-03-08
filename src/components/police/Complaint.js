import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AddComplaint from "./AddComplaint";

const Complaint = () => {
    const [complaints, setComplaints] = useState([]);
    const [stations, setStations] = useState({});
    const [citizens, setCitizens] = useState({});
    const [firs, setFirs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [userStationId, setUserStationId] = useState(null);
    const [userStationName, setUserStationName] = useState("Loading...");
    const [filingFir, setFilingFir] = useState(null);
    const [editComplaint, setEditComplaint] = useState(null);

    const getLoggedInUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("User not authenticated. Please log in.");
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            return decoded.user_id || null;
        } catch (error) {
            setError("Failed to decode user information. Please log in again.");
            return null;
        }
    };

    const fetchUserDetails = async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch user details");
            const userData = await response.json();
            setUserStationId(userData.station._id);
            setUserStationName(userData.station.name);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchComplaints = async () => {
        if (!userStationId) return;
        try {
            const response = await fetch("http://localhost:8000/complaints", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch complaints");
            const data = await response.json();
            const filteredComplaints = data.filter(
                (complaint) => (complaint.assigned_station?._id || complaint.assigned_station) === userStationId
            );
            setComplaints(filteredComplaints);
            await Promise.all([
                ...filteredComplaints.map((complaint) =>
                    fetchStationById(complaint.assigned_station?._id || complaint.assigned_station)
                ),
                ...filteredComplaints.map((complaint) => fetchCitizenDetails(complaint.citizen)),
            ]);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        try {
            const response = await fetch("http://localhost:8000/stations", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch stations");
            const data = await response.json();
            setStations(data.reduce((acc, station) => ({ ...acc, [station._id]: station }), {}));
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchStationById = async (stationId) => {
        if (!stationId || stations[stationId]) return;
        try {
            const response = await fetch(`http://localhost:8000/stations/${stationId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) return;
            const stationData = await response.json();
            setStations((prev) => ({ ...prev, [stationData._id]: stationData }));
        } catch (error) {
            console.error("Error fetching station:", error);
        }
    };

    const fetchCitizens = async () => {
        try {
            const response = await fetch("http://localhost:8000/citizen", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch citizens");
            const data = await response.json();
            setCitizens(data.reduce((acc, citizen) => ({ ...acc, [citizen._id]: citizen, [citizen.contact]: citizen }), {}));
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchCitizenDetails = async (contact) => {
        if (!contact || citizens[contact]) return;
        try {
            const response = await fetch(`http://localhost:8000/citizen/${contact}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) return;
            const citizenData = await response.json();
            setCitizens((prev) => ({ ...prev, [contact]: citizenData, [citizenData._id]: citizenData }));
        } catch (error) {
            console.error(`Error fetching citizen with contact ${contact}:`, error);
        }
    };

    const fetchFirs = async () => {
        try {
            const response = await fetch("http://localhost:8000/firs", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) throw new Error("Failed to fetch FIRs");
            const data = await response.json();
            setFirs(data.reduce((acc, fir) => ({ ...acc, [fir.complaint?.toString()]: fir }), {}));
        } catch (error) {
            console.error("Error fetching FIRs:", error);
        }
    };

    const isCognizable = (complaint) => complaint.sections?.some((section) => section.cognizable === "Cognizable");
    const isFirFiled = (complaint) => !!firs[complaint._id];

    const fileFir = async (complaint) => {
        setFilingFir(complaint.complaint_id);
        setError("");
        setSuccessMessage("");

        try {
            const userId = getLoggedInUserId();
            if (!userId) throw new Error("User not authenticated");

            const citizenContact = complaint.citizen;
            let citizenId = citizens[citizenContact]?._id;
            if (!citizenId) {
                await fetchCitizenDetails(citizenContact);
                citizenId = citizens[citizenContact]?._id;
                if (!citizenId) throw new Error(`Citizen with contact ${citizenContact} not found`);
            }

            const body = {
                complaint: complaint.complaint_id,
                description: complaint.description,
                citizen: citizenId,
                sections: complaint.sections.map((s) => s.section_id.section),
                assigned_officer: userId,
                evidence: complaint.evidence?.length > 0 ? complaint.evidence.join(", ") : undefined,
            };

            const response = await fetch("http://localhost:8000/firs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error((await response.json()).error || "Failed to file FIR");

            setSuccessMessage(`FIR filed successfully for Complaint ID ${complaint.complaint_id}!`);
            await Promise.all([fetchComplaints(), fetchFirs()]);
        } catch (error) {
            setError(error.message);
        } finally {
            setFilingFir(null);
        }
    };

    const handleEdit = (complaint) => {
        setEditComplaint({
            complaint_id: complaint.complaint_id,
            description: complaint.description || "",
            citizen: complaint.citizen || "",
            sections: complaint.sections?.map((s) => s.section_id.section).join(", ") || "",
            evidence: complaint.evidence?.join(", ") || "",
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditComplaint((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const body = {
                description: editComplaint.description,
                citizen: editComplaint.citizen,
                sections: editComplaint.sections ? editComplaint.sections.split(",").map((s) => s.trim()) : [],
                evidence: editComplaint.evidence ? editComplaint.evidence.split(",").map((e) => e.trim()) : [],
            };

            const response = await fetch(`http://localhost:8000/complaints/${editComplaint.complaint_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error((await response.json()).error || "Failed to update complaint");

            setSuccessMessage(`Complaint ID ${editComplaint.complaint_id} updated successfully!`);
            setEditComplaint(null);
            await fetchComplaints();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (complaintId) => {
        if (!window.confirm(`Are you sure you want to delete Complaint ID ${complaintId}?`)) return;

        try {
            const response = await fetch(`http://localhost:8000/complaints/${complaintId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (!response.ok) throw new Error("Failed to delete complaint");

            setSuccessMessage(`Complaint ID ${complaintId} deleted successfully!`);
            await fetchComplaints();
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            const userId = getLoggedInUserId();
            if (!userId) return;
            await fetchUserDetails(userId);
            await Promise.all([fetchStations(), fetchCitizens(), fetchFirs()]);
        };
        initializeData();
    }, []);

    useEffect(() => {
        if (userStationId) fetchComplaints();
    }, [userStationId]);

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return "Invalid date";
        }
    };

    const getStationName = (stationIdentifier) =>
        stationIdentifier ? stations[stationIdentifier?._id || stationIdentifier]?.name || "Loading..." : "Not Assigned";

    const getCitizenName = (contact) => citizens[contact]?.name || "Loading...";

    const getIPCSections = (sections) =>
        sections?.length > 0 ? sections.map((section) => section.section_id?.section || "Unknown").join(", ") : "None";

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-2xl rounded-xl p-8 mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Manage Complaints</h2>
                    <div className="mb-6 text-gray-600">
                        Station: <span className="font-semibold text-indigo-600">{userStationName}</span>
                    </div>

                    {/* Add Complaint Form (Always Visible) */}
                    <div className="mb-10">
                        <AddComplaint onComplaintAdded={fetchComplaints} />
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {successMessage}
                        </div>
                    )}

                    {/* Complaints Table */}
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            <span className="ml-3 text-gray-600">Loading complaints...</span>
                        </div>
                    ) : complaints.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No complaints found for this station.</p>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">ID</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Description</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Date Filed</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Station</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Citizen</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Contact</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">IPC Sections</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-white-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {complaints.map((complaint) => (
                                        <tr key={complaint.complaint_id || complaint._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-900">{complaint.complaint_id}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">
                                                {complaint.description?.length > 50
                                                    ? `${complaint.description.substring(0, 50)}...`
                                                    : complaint.description || "No description"}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{formatDate(complaint.date_filed)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{getStationName(complaint.assigned_station)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{getCitizenName(complaint.citizen)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{complaint.citizen || "Unknown"}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{getIPCSections(complaint.sections)}</td>
                                            <td className="py-4 px-6 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${complaint.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {complaint.status || "Unknown"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(complaint)}
                                                    className="flex items-center bg-blue-500 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-600 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(complaint.complaint_id)}
                                                    className="flex items-center bg-red-500 text-white px-4 py-1 rounded-lg shadow hover:bg-red-600 cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                                {isCognizable(complaint) && complaint.status === "Active" && (
                                                    <button
                                                        onClick={() => !isFirFiled(complaint) && fileFir(complaint)}
                                                        className={`py-1 px-3 rounded-md text-white transition-colors ${filingFir === complaint.complaint_id || isFirFiled(complaint)
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-indigo-600 hover:bg-indigo-700"
                                                            }`}
                                                        disabled={filingFir === complaint.complaint_id || isFirFiled(complaint)}
                                                    >
                                                        {filingFir === complaint.complaint_id
                                                            ? "Filing..."
                                                            : isFirFiled(complaint)
                                                                ? "FIR Filed"
                                                                : "File FIR"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit Complaint Modal */}
                {editComplaint && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Complaint ID: {editComplaint.complaint_id}</h3>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={editComplaint.description}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter complaint description"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Citizen Contact</label>
                                    <input
                                        type="text"
                                        name="citizen"
                                        value={editComplaint.citizen}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter citizen contact number"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">IPC Sections (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="sections"
                                        value={editComplaint.sections}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., IPC 302, IPC 376"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Evidence (comma-separated URLs)</label>
                                    <input
                                        type="text"
                                        name="evidence"
                                        value={editComplaint.evidence}
                                        onChange={handleEditInputChange}
                                        placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditComplaint(null)}
                                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Update Complaint
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

export default Complaint;