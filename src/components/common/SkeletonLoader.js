import React from "react";

const SkeletonLoader = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-yellow-100">
            {/* Skeleton Header */}
            <div className="w-2/3 h-12 bg-gray-200 animate-pulse rounded-md mb-6"></div>

            {/* Skeleton Cards */}
            <div className="flex flex-wrap gap-6 justify-center">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-80 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
            </div>

            {/* Skeleton Footer */}
            <div className="w-1/2 h-10 bg-gray-200 animate-pulse rounded-md mt-10"></div>
        </div>
    );
};

export default SkeletonLoader;
        