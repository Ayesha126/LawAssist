import React, { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5;

const ViewSections = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const response = await fetch("http://localhost:8000/ipc-sections", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch sections");

            setSections(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const totalPages = Math.max(1, Math.ceil(sections.length / ITEMS_PER_PAGE));
    const paginatedSections = sections.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Pagination logic for displaying first 3, last 3, and dynamic range
    const getPaginationNumbers = () => {
        const visiblePages = [];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        visiblePages.push(1, 2, 3);

        if (currentPage > 4) {
            visiblePages.push("...");
        }

        const start = Math.max(4, currentPage - 2);
        const end = Math.min(totalPages - 3, currentPage + 2);

        for (let i = start; i <= end; i++) {
            visiblePages.push(i);
        }

        if (currentPage < totalPages - 3) {
            visiblePages.push("...");
        }

        visiblePages.push(totalPages - 2, totalPages - 1, totalPages);

        return [...new Set(visiblePages)].filter((page) => page > 0 && page <= totalPages);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">View IPC Sections</h2>

            {loading ? (
                <p className="text-gray-600">Loading sections...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : sections.length === 0 ? (
                <p className="text-gray-500">No sections found.</p>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 text-left">Section</th>
                                <th className="p-2 text-left">Description</th>
                                <th className="p-2 text-left">Offense</th>
                                <th className="p-2 text-left">Punishment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSections.map((section) => (
                                <tr key={section._id} className="border-b">
                                    <td className="p-2">{section.section}</td>
                                    <td className="p-2">
                                        {expanded[section._id] ? (
                                            <span>{section.description}</span>
                                        ) : (
                                            <span>
                                                {section.description.length > 50
                                                    ? `${section.description.substring(0, 50)}...`
                                                    : section.description}
                                            </span>
                                        )}
                                        {section.description.length > 50 && (
                                            <button
                                                onClick={() => toggleExpand(section._id)}
                                                className="text-blue-500 ml-2"
                                            >
                                                {expanded[section._id] ? "Show Less" : "Read More"}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-2">{section.offense}</td>
                                    <td className="p-2">{section.punishment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="mt-4 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {getPaginationNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => page !== "..." && setCurrentPage(page)}
                                className={`px-3 py-1 rounded ${currentPage === page
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                                    }`}
                                disabled={page === "..."}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewSections;