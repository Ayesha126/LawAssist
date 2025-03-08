import React, { useState } from "react";

const AddSection = ({ onSectionAdded }) => {
    const [formData, setFormData] = useState({
        section: "",
        description: "",
        offense: "",
        punishment: "",
        cognizable: "Cognizable",
        bailable: "Bailable",
        court: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:8000/ipc-sections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to add IPC section");

            setMessage("✅ IPC Section added successfully!");
            setFormData({
                section: "",
                description: "",
                offense: "",
                punishment: "",
                cognizable: "Cognizable",
                bailable: "Bailable",
                court: "",
            });

            // Refresh the section list
            if (onSectionAdded) {
                onSectionAdded();
            }
        } catch (error) {
            setMessage("❌ " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add IPC Section</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="section"
                        placeholder="Section Number"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <input
                        type="text"
                        name="offense"
                        placeholder="Offense"
                        value={formData.offense}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <input
                        type="text"
                        name="punishment"
                        placeholder="Punishment"
                        value={formData.punishment}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <select
                        name="cognizable"
                        value={formData.cognizable}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Cognizable">Cognizable</option>
                        <option value="Non-Cognizable">Non-Cognizable</option>
                    </select>
                    <select
                        name="bailable"
                        value={formData.bailable}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Bailable">Bailable</option>
                        <option value="Non-Bailable">Non-Bailable</option>
                    </select>
                </div>
                <div>
                    <input
                        type="text"
                        name="court"
                        placeholder="Court Type"
                        value={formData.court}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {loading ? "Adding..." : "Add Section"}
                </button>

                {message && (
                    <p className="mt-2 text-center text-sm font-medium">{message}</p>
                )}
            </form>
        </div>
    );
};

export default AddSection;
