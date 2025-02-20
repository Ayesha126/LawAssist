const mongoose = require('mongoose');

const firSchema = new mongoose.Schema({
    fir_id: {
        type: Number,
        unique: true,
        required: true
    },
    complaint: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Complaint',
       required: true
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IPCSection',
        required: true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Open', 'In Progress', 'Closed']
    }
}, { timestamps: true });

const FIR = mongoose.model('FIR', firSchema);

module.exports = FIR;
