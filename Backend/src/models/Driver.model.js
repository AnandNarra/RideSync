const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    licensePhoto: {
      type: String,
      required: true,
    },

    aadhaarNumber: {
      type: Number, // ✅ changed from Number
      required: true,
      unique: true,
    },

    aadhaarPhoto: { // ✅ fixed spelling
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 40,
    },

    rejectedReason: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ recommended
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
