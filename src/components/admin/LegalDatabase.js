import React, { useEffect, useState } from 'react';

const LegalDatabase = () => {
    const [legalSections, setLegalSections] = useState([]);

    useEffect(() => {
        // Fetch legal data from API
        const fetchLegalSections = async () => {
            try {
                const response = await fetch('/api/legal-sections');
                const data = await response.json();
                setLegalSections(data);
            } catch (error) {
                console.error('Error fetching legal data:', error);
            }
        };

        fetchLegalSections();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Legal Database</h1>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Section</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Penalty</th>
                    </tr>
                </thead>
                <tbody>
                    {legalSections.map((section) => (
                        <tr key={section.id} className="border-t">
                            <td className="p-2">{section.section}</td>
                            <td className="p-2">{section.description}</td>
                            <td className="p-2">{section.penalty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LegalDatabase;
