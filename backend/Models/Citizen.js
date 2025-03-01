const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema(
  {
    c_id: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
    },
    address: { // Fixed 'Address' to 'address' (consistent casing)
      type: String,
      required: true,
    },
    emergency_contacts: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          contact: { type: String, required: true, trim: true },
        },
      ],
      validate: {
        validator: function (contacts) {
          return contacts.length <= 3; // Maximum 3 contacts allowed
        },
        message: "A citizen can have a maximum of 3 emergency contacts",
      },
      default: [], // Initializes as an empty array
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Citizen = mongoose.model("Citizen", citizenSchema);
module.exports = Citizen;
