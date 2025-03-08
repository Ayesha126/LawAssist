import React from "react";
import AddPoliceStation from "./AddPoliceStation";
import ViewPoliceStations from "./ViewPoliceStations";

const PoliceStationsAdmin = () => {
    const handleStationAdded = (newStation) => {
        // Optionally handle the newly added station here if needed
        console.log("New station added:", newStation);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
            <h2 className="text-4xl font-extrabold text-gray-800 text-center tracking-wide mb-8">
                Manage Police Stations
            </h2>
            <AddPoliceStation onStationAdded={handleStationAdded} />
            <div className="mt-8">
                <ViewPoliceStations />
            </div>
        </div>
    );
};

export default PoliceStationsAdmin;