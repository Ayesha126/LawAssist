import React, { useState } from 'react';

const FIRSearch = () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/fir/search?query=${query}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching FIRs:', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search FIR</h1>
            <form onSubmit={handleSearch} className="space-y-4">
                <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Search by keyword, FIR ID, or date..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit" className="w-full p-3 bg-blue-500 text-white rounded-lg">
                    Search
                </button>
            </form>

            {searchResults.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Search Results:</h2>
                    <ul className="space-y-2">
                        {searchResults.map((fir) => (
                            <li key={fir.id} className="p-4 border rounded-lg">
                                <p><strong>FIR ID:</strong> {fir.id}</p>
                                <p><strong>Complainant:</strong> {fir.complainant}</p>
                                <p><strong>Filed On:</strong> {new Date(fir.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {fir.status}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FIRSearch;
