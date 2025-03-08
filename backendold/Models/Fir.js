const mongoose = require('mongoose');

const FIRSchema = new mongoose.Schema({
    fir_id: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    complaint: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Complaint', 
        default: null // If filed directly, no complaint reference
    },
    description: { 
        type: String, 
        required: true 
    },
    citizen: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Citizen', 
        default: null 
    },
    sections: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'IPCSection', 
        required: true 
    }],
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true // Assigned Police Officer 
    },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Closed'], 
        default: 'Open' 
    },
    evidence: { 
        type: String, 
        default: null // URL or description of evidence
    }
}, { timestamps: true });

module.exports = mongoose.model('FIR', FIRSchema);
