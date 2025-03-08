import React from "react";

const LawAssistLogo = ({ size = 40 }) => {
    return (
        <svg
            className={`w-${size} h-${size} text-white hover:scale-110 transition-transform duration-300 ease-in-out`}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Scales of Justice */}
            <path d="M50 15 L70 30 M50 15 L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="15" r="3" fill="currentColor" />

            {/* Scale Arms */}
            <path d="M30 30 L50 45 L70 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

            {/* Hanging Chains */}
            <line x1="35" y1="35" x2="35" y2="48" stroke="currentColor" strokeWidth="1.5" />
            <line x1="65" y1="35" x2="65" y2="48" stroke="currentColor" strokeWidth="1.5" />

            {/* Scale Plates */}
            <ellipse cx="35" cy="50" rx="8" ry="3" fill="currentColor" />
            <ellipse cx="65" cy="50" rx="8" ry="3" fill="currentColor" />

            {/* Central Column */}
            <rect x="48" y="45" width="4" height="25" fill="currentColor" />

            {/* Base */}
            <rect x="40" y="72" width="20" height="4" fill="currentColor" rx="2" />

            {/* Branding Text */}
            <text x="50" y="88" fontSize="10" fontWeight="bold" textAnchor="middle" fill="currentColor">
                LawAssist
            </text>
        </svg>
    );
};

export default LawAssistLogo;
