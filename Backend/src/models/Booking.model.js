const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        rideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride",
            required: [true, "Ride ID is required"],
        },
        passengerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Passenger ID is required"],
        },
        seatsRequested: {
            type: Number,
            required: [true, "Number of seats is required"],
            min: [1, "Seats requested must be at least 1"],
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for faster lookups
bookingSchema.index({ rideId: 1 });
bookingSchema.index({ passengerId: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
