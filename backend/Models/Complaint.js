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

    // New Fields Added
    complainant_name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    complainant_contact: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 15
    },
    complainant_address: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 500
    },
    assigned_officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    evidence: [{
        type: String,  // Can store URLs to images, videos, or documents
        trim: true
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    }, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
