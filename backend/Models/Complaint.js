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
    filed_by: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    date_filed: {
        type: Date,
        required: true,
        default: Date.now
    },
    officer_id: {
        type: Number,
        required: true,
        min: 1
    }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
