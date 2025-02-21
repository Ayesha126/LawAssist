import React from "react";
import "../styles/loader.css"; // Ensure this file exists
import LoaderIcon from "../../assets/loderIcon.jpg"; // Make sure the image exists

const Loader = () => {
    return (
        <div className="loader-container">
            <div className="loader">
                <img src={LoaderIcon} alt="LAWASSIST Logo" className="loader-icon" />
            </div>
            <div className="loader-text">LAWASSIST</div>
        </div>
    );
};

export default Loader;
