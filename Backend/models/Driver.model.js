const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    numberPlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    role: {
      type: String,
      enum: ["driver"],
      default: "driver",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
