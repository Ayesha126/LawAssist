const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Police'],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: function () {
            return this.role === "Police";
        },
    },
    profileImage: { // New field for profile image
        type: String,
        default: null, // Default to null if no image is uploaded
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;