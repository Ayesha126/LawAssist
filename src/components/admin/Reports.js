import React, { useEffect, useState } from 'react';

const Reports = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        // Fetch reports data from API
        const fetchReports = async () => {
            try {
                const response = await fetch('/api/reports');
                const data = await response.json();
                setReports(data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
            <div className="grid grid-cols-3 gap-4">
                {reports.map((report, index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-lg font-semibold">{report.title}</h2>
                        <p className="text-xl font-bold">{report.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
