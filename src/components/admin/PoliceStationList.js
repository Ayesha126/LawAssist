import React, { useEffect, useState } from "react";
import axios from "axios";

const PoliceStationList = () => {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        axios.get("/api/police-stations")
            .then(response => setStations(response.data))
            .catch(error => console.error("Error fetching police stations:", error));
    }, []);

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Police Stations</h2>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Location</th>
                    </tr>
                </thead>
                <tbody>
                    {stations.map((station) => (
                        <tr key={station.id} className="text-center">
                            <td className="p-2 border">{station.id}</td>
                            <td className="p-2 border">{station.name}</td>
                            <td className="p-2 border">{station.location}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PoliceStationList;
