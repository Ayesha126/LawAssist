const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    complaint_id: {
        type: Number,
        required: true,
        unique: true,
        min: 1
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    date_filed: {
        type: Date,
        required: true,
        default: Date.now
    },
    assigned_station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        required: true
    },
    citizen: {
        type: String,  // Storing contact number of the citizen
        ref: 'Citizen',
        required: true
    },
    sections: [{
        section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'IPCSection', required: true },
        cognizable: { type: String, enum: ['Cognizable', 'Non-Cognizable'], required: true }
    }],
    evidence: [{
        type: String,  // Can store URLs to images, videos, or documents
        trim: true
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
