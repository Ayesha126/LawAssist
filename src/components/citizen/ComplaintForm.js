import React, { useState } from 'react';

const ComplaintForm = () => {
    const [complaint, setComplaint] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Complaint Submitted:', complaint);
        // Add API integration here
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">File a Complaint</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="w-full p-3 border rounded-lg"
                    placeholder="Describe your complaint..."
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    required
                />
                <button type="submit" className="w-full p-3 bg-blue-500 text-white rounded-lg">
                    Submit Complaint
                </button>
            </form>
        </div>
    );
};

export default ComplaintForm;
