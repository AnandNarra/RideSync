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
    rejectedReason:{
      type:String,
      default:null,

    },

    status: {
      type: String,
      enum: ["none","pending", "approved", "rejected"],
      default: "none",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
