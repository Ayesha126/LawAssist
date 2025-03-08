import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ComplaintStatus = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaintStatus = async () => {
            try {
                const response = await fetch(`/api/complaints/${id}`);
                const data = await response.json();
                setComplaint(data);
            } catch (error) {
                console.error('Error fetching complaint status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaintStatus();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!complaint) return <p>Complaint not found.</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Complaint Status</h1>
            <div className="p-4 border rounded-lg bg-gray-100">
                <p><strong>Complaint ID:</strong> {complaint.id}</p>
                <p><strong>Status:</strong> {complaint.status}</p>
                <p><strong>Filed On:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                <p><strong>Officer Assigned:</strong> {complaint.assignedOfficer || 'Not assigned yet'}</p>
            </div>
        </div>
    );
};

export default ComplaintStatus;
