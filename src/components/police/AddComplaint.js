import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AddComplaint = ({ onComplaintAdded }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [userStationId, setUserStationId] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        citizen: "",
        citizen_name: "",
        citizen_address: "",
        citizen_email: "",
        evidence: "",
        sections: [],
    });
    const [suggestedSections, setSuggestedSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({}); // Track expanded state for each section

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
            setUserStationId(userData.station.station_id);
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeUser = async () => {
            const userId = getLoggedInUserId();
            if (userId) await fetchUserDetails(userId);
            else setLoading(false);
        };
        initializeUser();
    }, []);

    const fetchSuggestions = async (description) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch("http://localhost:5000/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch suggestions");
            }
            const data = await response.json();
            setSuggestedSections(data.ipc_suggestions);
        } catch (error) {
            console.error("Fetch suggestions error:", error.message);
            setError(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "description" && value.length > 10) {
            fetchSuggestions(value);
        }
    };

    const toggleSectionSelection = (section) => {
        setFormData((prev) => ({
            ...prev,
            sections: prev.sections.some((s) => s.section === section.section)
                ? prev.sections.filter((s) => s.section !== section.section)
                : [...prev.sections, section],
        }));
    };

    const toggleDescription = (sectionCode) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionCode]: !prev[sectionCode],
        }));
    };

    const handleVoiceInput = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData((prev) => ({ ...prev, description: transcript }));
            if (transcript.length > 10) fetchSuggestions(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            setError("Voice input error: " + event.error);
            setIsListening(false);
        };

        if (!isListening) recognition.start();
        else recognition.stop();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const requiredFields = ["description", "citizen", "citizen_name", "citizen_address", "citizen_email"];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setError(`Please fill in the ${field.replace("_", " ")} field.`);
                return;
            }
        }

        if (!userStationId) {
            setError("Unable to determine your station. Please contact admin.");
            return;
        }

        try {
            const body = {
                ...formData,
                assigned_station: userStationId,
                sections: formData.sections.map((s) => s.section),
                evidence: formData.evidence ? formData.evidence.split(",").map((e) => e.trim()) : [],
            };

            const response = await fetch("http://localhost:8000/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error((await response.json()).error || "Failed to add complaint");

            setSuccess("Complaint added successfully!");
            setFormData({
                description: "",
                citizen: "",
                citizen_name: "",
                citizen_address: "",
                citizen_email: "",
                evidence: "",
                sections: [],
            });
            setSuggestedSections([]);
            onComplaintAdded();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl rounded-2xl my-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Add New Complaint</h2>

            {loading ? (
                <p className="text-gray-600 text-center">Loading user data...</p>
            ) : error ? (
                <p className="text-red-600 bg-red-100 p-4 rounded-lg text-center">{error}</p>
            ) : success ? (
                <p className="text-green-600 bg-green-100 p-4 rounded-lg text-center">{success}</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter or speak the complaint description"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                            rows="4"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            className={`absolute right-2 top-10 p-2 rounded-full ${isListening ? "bg-red-500" : "bg-indigo-500"} text-white hover:bg-opacity-90 transition-colors focus:outline-none`}
                            title={isListening ? "Stop recording" : "Start voice input"}
                        >
                            {isListening ? (
                                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Sections</h2>
                        {isAnalyzing ? (
                            <div className="flex justify-center items-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                <span className="ml-3 text-blue-500">Analyzing incident description...</span>
                            </div>
                        ) : (
                            <>
                                {suggestedSections.length > 0 ? (
                                    <div>
                                        <p className="text-gray-700 mb-3">AI-Suggested Legal Sections:</p>
                                        <div className="space-y-3">
                                            {suggestedSections.map((section) => (
                                                <div
                                                    key={section.section}
                                                    className={`p-4 border rounded-lg transition-all ${formData.sections.some((s) => s.section === section.section) ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 cursor-pointer" onClick={() => toggleSectionSelection(section)}>
                                                            <div className="font-medium text-gray-900">{section.section}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <span
                                                                className={`px-2 py-1 rounded ${section.match_percentage > 90 ? "bg-green-100 text-green-800" : section.match_percentage > 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                                                            >
                                                                {section.match_percentage}% match
                                                            </span>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.sections.some((s) => s.section === section.section)}
                                                                onChange={() => toggleSectionSelection(section)}
                                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleDescription(section.section)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            {expandedSections[section.section] ? "Show Less" : "Read More"}
                                                        </button>
                                                        {expandedSections[section.section] && (
                                                            <div className="text-sm text-gray-600 mt-1">{section.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    formData.description.length > 0 && (
                                        <p className="text-gray-500 italic">Add more details to get AI-suggested legal sections.</p>
                                    )
                                )}
                            </>
                        )}

                        <div className="mt-4">
                            <p className="text-gray-700 mb-2">Selected Sections:</p>
                            {formData.sections.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.sections.map((section) => (
                                        <div
                                            key={section.section}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                                        >
                                            <span>{section.section}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSectionSelection(section);
                                                }}
                                                className="ml-2 text-blue-700 hover:text-blue-900"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No sections selected yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Citizen Contact</label>
                            <input
                                type="text"
                                name="citizen"
                                value={formData.citizen}
                                onChange={handleInputChange}
                                placeholder="Enter contact number"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Citizen Name</label>
                            <input
                                type="text"
                                name="citizen_name"
                                value={formData.citizen_name}
                                onChange={handleInputChange}
                                placeholder="Enter full name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Citizen Address</label>
                            <input
                                type="text"
                                name="citizen_address"
                                value={formData.citizen_address}
                                onChange={handleInputChange}
                                placeholder="Enter address"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Citizen Email</label>
                            <input
                                type="email"
                                name="citizen_email"
                                value={formData.citizen_email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Evidence (comma-separated URLs)</label>
                        <input
                            type="text"
                            name="evidence"
                            value={formData.evidence}
                            onChange={handleInputChange}
                            placeholder="e.g., http://example.com/evidence1, http://example.com/evidence2"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isAnalyzing}
                    >
                        Add Complaint
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddComplaint;