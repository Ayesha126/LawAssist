import React, { useEffect, useState } from 'react';

const LegalInfo = () => {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchLegalInfo = async () => {
            try {
                const response = await fetch('/api/legal-info');
                const data = await response.json();
                setSections(data);
            } catch (error) {
                console.error('Error fetching legal info:', error);
            }
        };

        fetchLegalInfo();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Legal Information</h1>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">IPC Section</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Punishment</th>
                    </tr>
                </thead>
                <tbody>
                    {sections.map((section) => (
                        <tr key={section.id} className="border-t">
                            <td className="p-2">{section.section}</td>
                            <td className="p-2">{section.description}</td>
                            <td className="p-2">{section.punishment}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LegalInfo;
