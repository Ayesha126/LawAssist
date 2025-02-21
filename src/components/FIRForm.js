import React, { useState } from "react";
import "../styles/firform.css";

const FIRForm = () => {
    const [formData, setFormData] = useState({
        district: "",
        policeStation: "",
        year: "",
        firNo: "",
        date: "",
        act1: "",
        section1: "",
        act2: "",
        section2: "",
        act3: "",
        section3: "",
        otherActs: "",
        occurrenceDay: "",
        occurrenceDate: "",
        occurrenceTime: "",
        receivedDate: "",
        receivedTime: "",
        diaryReference: "",
        diaryTime: "",
        typeOfInfo: "Written",
        placeDirection: "",
        placeAddress: "",
        complainantName: "",
        fatherHusbandName: "",
        dob: "",
        nationality: "",
        passportNo: "",
        passportIssueDate: "",
        passportIssuePlace: "",
        occupation: "",
        complainantAddress: "",
        accusedDetails: "",
        delayReason: "",
        stolenProperties: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("FIR Form Data Submitted:", formData);
    };

    return (
        <div className="fir-form-container">
            <h2>First Information Report (FIR)</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>District:</label>
                    <input type="text" name="district" value={formData.district} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Police Station:</label>
                    <input type="text" name="policeStation" value={formData.policeStation} onChange={handleChange} />
                </div>

                <div className="form-group-row">
                    <div className="form-group">
                        <label>Year:</label>
                        <input type="text" name="year" value={formData.year} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>FIR No:</label>
                        <input type="text" name="firNo" value={formData.firNo} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Date:</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} />
                    </div>
                </div>

                <h3>Acts & Sections</h3>
                <div className="form-group-row">
                    <div className="form-group">
                        <label>Act 1:</label>
                        <input type="text" name="act1" value={formData.act1} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Section 1:</label>
                        <input type="text" name="section1" value={formData.section1} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Other Acts & Sections:</label>
                    <textarea name="otherActs" value={formData.otherActs} onChange={handleChange}></textarea>
                </div>

                <h3>Occurrence of Offense</h3>
                <div className="form-group-row">
                    <div className="form-group">
                        <label>Day:</label>
                        <input type="text" name="occurrenceDay" value={formData.occurrenceDay} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Date:</label>
                        <input type="date" name="occurrenceDate" value={formData.occurrenceDate} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Time:</label>
                        <input type="time" name="occurrenceTime" value={formData.occurrenceTime} onChange={handleChange} />
                    </div>
                </div>

                <h3>Complainant Details</h3>
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" name="complainantName" value={formData.complainantName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Father/Husband Name:</label>
                    <input type="text" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Address:</label>
                    <textarea name="complainantAddress" value={formData.complainantAddress} onChange={handleChange}></textarea>
                </div>

                <h3>Details of Accused</h3>
                <div className="form-group">
                    <label>Accused Details:</label>
                    <textarea name="accusedDetails" value={formData.accusedDetails} onChange={handleChange}></textarea>
                </div>

                <h3>Other Information</h3>
                <div className="form-group">
                    <label>Reasons for Delay:</label>
                    <textarea name="delayReason" value={formData.delayReason} onChange={handleChange}></textarea>
                </div>

                <div className="form-group">
                    <label>Particulars of Stolen Properties:</label>
                    <textarea name="stolenProperties" value={formData.stolenProperties} onChange={handleChange}></textarea>
                </div>

                <button type="submit" className="submit-btn">Submit FIR</button>
            </form>
        </div>
    );
};

export default FIRForm;
