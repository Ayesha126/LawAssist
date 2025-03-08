import React from "react";

const LoginSkeleton = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-yellow-100 relative">
            {/* Background Elements */}
            <div className="absolute w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 top-10 left-10 animate-pulse"></div>
            <div className="absolute w-56 h-56 bg-yellow-300 rounded-full blur-3xl opacity-30 bottom-10 right-10 animate-pulse"></div>

            {/* Skeleton Card */}
            <div className="relative bg-white bg-opacity-60 backdrop-blur-lg border border-white/50 p-8 rounded-2xl shadow-lg max-w-md w-full">
                <div className="w-48 h-8 bg-gray-300 animate-pulse rounded mb-6 mx-auto"></div>

                {/* Username */}
                <div className="mb-4">
                    <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>

                {/* Password */}
                <div className="mb-6">
                    <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>

                {/* Button */}
                <div className="w-full h-12 bg-blue-300 animate-pulse rounded-lg"></div>

                {/* Register Link */}
                <div className="mt-4 text-center">
                    <div className="w-48 h-5 bg-gray-300 animate-pulse rounded mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default LoginSkeleton;
