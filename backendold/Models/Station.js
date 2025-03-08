const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    station_id: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
        building_number: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        area: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        postal_code: { type: String, required: true, trim: true },
      },
    contact: {
      type: String,
      required: true,
    },
    jurisdiction_area: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Station = mongoose.model("Station", stationSchema);
module.exports = Station;
