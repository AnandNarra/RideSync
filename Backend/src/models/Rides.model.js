
const mongoose = require("mongoose")

const rideSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  startLocation: {
    name: String,
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },

  endLocation: {
    name: String,
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },

  route: {
    type: {
      type: String,
      enum: ["LineString"],
      default: "LineString"
    },
    coordinates: [[Number]] // full route path
  },

  departureTime: {
    type: Date,
    required: true
  },

  availableSeats: {
    type: Number,
    min: 1,
    max: 6,
    required: true
  },

  pricePerSeat: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["published", "full", "filled", "cancelled", "completed"],
    default: "published"
  }

}, { timestamps: true });

rideSchema.index({ "startLocation.coordinates": "2dsphere" });
rideSchema.index({ "endLocation.coordinates": "2dsphere" });


module.exports = mongoose.model("Ride", rideSchema)