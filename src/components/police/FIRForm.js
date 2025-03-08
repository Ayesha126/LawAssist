import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const FIRForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const complaintId = queryParams.get('complaint');

    const [formData, setFormData] = useState({
        title: '',
        complainantName: '',
        complainantAddress: '',
        complainantPhone: '',
        incidentDate: '',
        incidentTime: '',
        incidentLocation: '',
        description: '',
        sections: [],
        accused: [{ name: '', details: '' }],
    });

    const [suggestedSections, setSuggestedSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({}); // Track expanded state for each section
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [citizens, setCitizens] = useState({});
    const [userStationId, setUserStationId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debugging function
    const debugLog = (message, data) => {
        console.log(`[DEBUG] ${message}:`, data);
    };

    // Get logged-in user's ID from token
    const getLoggedInUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not authenticated. Please log in.');
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            if (!decoded.user_id) {
                setError('User ID not found in token. Contact admin.');
                return null;
            }
            return decoded.user_id;
        } catch (error) {
            console.error('Error decoding token:', error);
            setError('Failed to decode user information. Please log in again.');
            return null;
        }
    };

    // Fetch user details to get station
    const fetchUserDetails = async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:8000/users/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch user details');
            const userData = await response.json();
            debugLog('Fetched user data', userData);
            if (!userData.station?._id) throw new Error('User station not found');
            setUserStationId(userData.station._id);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError(error.message);
        }
    };

    // Fetch all citizens
    const fetchCitizens = async () => {
        try {
            const response = await fetch('http://localhost:8000/citizen', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch citizens');
            const data = await response.json();
            const citizenLookup = data.reduce((acc, citizen) => ({
                ...acc,
                [citizen._id]: citizen,
                [citizen.c_id]: citizen,
            }), {});
            setCitizens(citizenLookup);
            debugLog('Fetched citizens', citizenLookup);
        } catch (error) {
            console.error('Error fetching citizens:', error);
            setError(error.message);
        }
    };

    // Fetch AI-suggested sections from Flask backend
    const fetchSuggestedSections = async (description) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('http://localhost:5000/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch suggestions');
            }
            const data = await response.json();
            // Map Flask response to match expected format
            const mappedSections = data.ipc_suggestions.map(suggestion => ({
                code: suggestion.section,
                name: suggestion.description,
                confidence: suggestion.match_percentage,
            }));
            setSuggestedSections(mappedSections);
        } catch (error) {
            console.error('Error fetching suggested sections:', error);
            setError(error.message);
        } finally {
            setIsAnalyzing(false);
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
                await fetchCitizens();

                if (complaintId) {
                    try {
                        const response = await fetch(`http://localhost:8000/complaints/${complaintId}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        });
                        if (!response.ok) throw new Error('Failed to fetch complaint');
                        const complaintData = await response.json();
                        debugLog('Fetched complaint data', complaintData);

                        setFormData((prev) => ({
                            ...prev,
                            title: complaintData.title || 'Complaint-based FIR',
                            complainantName: complaintData.complainant_name || complaintData.citizen_name || '',
                            complainantPhone: complaintData.complainant_contact || complaintData.citizen || '',
                            complainantAddress: complaintData.complainant_address || complaintData.citizen_address || '',
                            description: complaintData.description || '',
                        }));
                    } catch (error) {
                        console.error('Error fetching complaint:', error);
                        setError('Failed to fetch complaint details.');
                    }
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, [complaintId]);

    // Fetch suggested sections when description changes
    useEffect(() => {
        if (formData.description.length > 50) {
            fetchSuggestedSections(formData.description);
        } else {
            setSuggestedSections([]); // Clear suggestions if description is too short
        }
    }, [formData.description]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAccusedChange = (index, field, value) => {
        const newAccused = [...formData.accused];
        newAccused[index] = { ...newAccused[index], [field]: value };
        setFormData((prev) => ({ ...prev, accused: newAccused }));
    };

    const addAccused = () => {
        setFormData((prev) => ({
            ...prev,
            accused: [...prev.accused, { name: '', details: '' }],
        }));
    };

    const removeAccused = (index) => {
        const newAccused = [...formData.accused];
        newAccused.splice(index, 1);
        setFormData((prev) => ({ ...prev, accused: newAccused }));
    };

    const toggleSectionSelection = (section) => {
        const isSelected = formData.sections.some((s) => s.code === section.code);
        let newSections;
        if (isSelected) {
            newSections = formData.sections.filter((s) => s.code !== section.code);
        } else {
            newSections = [...formData.sections, section];
        }
        setFormData((prev) => ({ ...prev, sections: newSections }));
    };

    const toggleDescription = (sectionCode) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionCode]: !prev[sectionCode],
        }));
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setIsRecording(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setFormData((prev) => ({
                    ...prev,
                    description: prev.description + ' ' + transcript,
                }));
            };
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event) => {
                setError('Voice input error: ' + event.error);
                setIsRecording(false);
            };
            recognition.start();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.complainantName || !formData.description) {
            setError('Please fill all required fields');
            window.scrollTo(0, 0);
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const userId = getLoggedInUserId();
            if (!userId) throw new Error('User not authenticated');

            const body = {
                title: formData.title,
                description: formData.description,
                complainant_name: formData.complainantName,
                complainant_contact: formData.complainantPhone || undefined,
                complainant_address: formData.complainantAddress || undefined,
                incident_date: formData.incidentDate || undefined,
                incident_time: formData.incidentTime || undefined,
                incident_location: formData.incidentLocation || undefined,
                sections: formData.sections.map((s) => s.code),
                accused: formData.accused,
                complaint: complaintId || undefined,
                user: userId,
                assigned_station: userStationId,
            };

            debugLog('Submitting FIR with body', body);

            const response = await fetch('http://localhost:8000/firs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit FIR');
            }

            setSuccessMessage(`FIR successfully filed with number ${data.fir_id}`);
            setTimeout(() => {
                navigate('/police');
            }, 2000);
        } catch (error) {
            console.error('Error submitting FIR:', error);
            setError(error.message);
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadDraft = () => {
        console.log('Downloading FIR draft as PDF');
        alert('Draft FIR downloaded as PDF');
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">File a First Information Report (FIR)</h1>

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
                ) : null}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Incident Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                FIR Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Incident Date & Time
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    name="incidentDate"
                                    value={formData.incidentDate}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="time"
                                    name="incidentTime"
                                    value={formData.incidentTime}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Incident Location
                        </label>
                        <input
                            type="text"
                            name="incidentLocation"
                            value={formData.incidentLocation}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Complainant Details */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Complainant Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Complainant Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="complainantName"
                                    value={formData.complainantName}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Complainant Phone
                                </label>
                                <input
                                    type="tel"
                                    name="complainantPhone"
                                    value={formData.complainantPhone}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Complainant Address
                            </label>
                            <textarea
                                name="complainantAddress"
                                value={formData.complainantAddress}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* Incident Description */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Incident Description <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`flex items-center px-3 py-1.5 rounded-lg ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {isRecording ? (
                                    <svg className="w-5 h-5 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                )}
                                {isRecording ? 'Recording...' : 'Record Voice'}
                            </button>
                        </div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="6"
                            required
                        />
                    </div>

                    {/* Legal Sections */}
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
                                        <p className="text-gray-700 mb-3">
                                            AI-Suggested Legal Sections (based on incident description):
                                        </p>
                                        <div className="space-y-3">
                                            {suggestedSections.map((section) => (
                                                <div
                                                    key={section.code}
                                                    className={`p-4 border rounded-lg transition ${formData.sections.some((s) => s.code === section.code)
                                                        ? 'bg-blue-50 border-blue-300'
                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 cursor-pointer" onClick={() => toggleSectionSelection(section)}>
                                                            <div className="font-medium text-gray-900">{section.code}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <span
                                                                className={`px-2 py-1 rounded ${section.confidence > 90
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : section.confidence > 70
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                    }`}
                                                            >
                                                                {section.confidence}% match
                                                            </span>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.sections.some((s) => s.code === section.code)}
                                                                onChange={() => toggleSectionSelection(section)}
                                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleDescription(section.code)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            {expandedSections[section.code] ? 'Show Less' : 'Read More'}
                                                        </button>
                                                        {expandedSections[section.code] && (
                                                            <div className="text-sm text-gray-600 mt-1">{section.name}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    formData.description.length > 0 && (
                                        <p className="text-gray-500 italic">
                                            Add more details to the incident description to get AI-suggested legal sections.
                                        </p>
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
                                            key={section.code}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                                        >
                                            <span>{section.code}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleSectionSelection(section)}
                                                className="ml-2 text-blue-700 hover:text-blue-900"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
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

                    {/* Accused Details */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Accused Details</h2>
                            <button
                                type="button"
                                onClick={addAccused}
                                className="flex items-center text-blue-600 hover:text-blue-800 transition"
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Accused
                            </button>
                        </div>

                        {formData.accused.map((accused, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-medium text-gray-900">Accused #{index + 1}</h3>
                                    {formData.accused.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAccused(index)}
                                            className="text-red-600 hover:text-red-800 transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name/Identifier
                                        </label>
                                        <input
                                            type="text"
                                            value={accused.name}
                                            onChange={(e) => handleAccusedChange(index, 'name', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Known or unknown"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Details/Description
                                    </label>
                                    <textarea
                                        value={accused.details}
                                        onChange={(e) => handleAccusedChange(index, 'details', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Physical appearance, relationship to complainant, etc."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleDownloadDraft}
                            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Download Draft
                        </button>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/police')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} transition`}
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                )}
                                {isSubmitting ? 'Submitting...' : 'Submit FIR'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FIRForm;