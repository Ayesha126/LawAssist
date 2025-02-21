import React from "react";
import "../styles/footer.css"; // External CSS for styling
import FooterLogo from "../../assets/footerLogo.jpg";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <img src={FooterLogo} alt="Police Logo" />
                </div>

                <div className="footer-text">
                    <p><strong>AI-powered FIR system for police, ensuring legal accuracy.</strong></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
