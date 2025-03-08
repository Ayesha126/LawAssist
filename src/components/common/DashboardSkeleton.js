import React from "react";

const DashboardSkeleton = () => {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            {/* Header */}
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
