const mongoose = require('mongoose');

const ipcSectionSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    offense: {
        type: String,
        required: true
    },
    punishment: {
        type: String,
        required: true
    },
    cognizable: {
        type: String,
        enum: ['Cognizable', 'Non-Cognizable'],
        required: true
    },
    bailable: {
        type: String,
        enum: ['Bailable', 'Non-Bailable'],
        required: true
    },
    court: {
        type: String,
        required: true
    }
}, { timestamps: true });

const IPCSection = mongoose.model('IPCSection', ipcSectionSchema);
module.exports = IPCSection;
