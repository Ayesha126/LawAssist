import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const FIRDetails = () => {
    const { id } = useParams();
    const [firDetails, setFIRDetails] = useState(null);

    useEffect(() => {
        // Fetch FIR details from API
        const fetchFIRDetails = async () => {
            try {
                const response = await fetch(`/api/fir/${id}`);
                const data = await response.json();
                setFIRDetails(data);
            } catch (error) {
                console.error('Error fetching FIR details:', error);
            }
        };

        fetchFIRDetails();
    }, [id]);

    if (!firDetails) {
        return <p className="p-6">Loading FIR details...</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">FIR Details</h1>
            <div className="p-4 border rounded-lg">
                <p><strong>ID:</strong> {firDetails.id}</p>
                <p><strong>Complainant:</strong> {firDetails.complainant}</p>
                <p><strong>Incident:</strong> {firDetails.description}</p>
                <p><strong>Status:</strong> {firDetails.status}</p>
                <p><strong>Filed On:</strong> {new Date(firDetails.date).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default FIRDetails;
