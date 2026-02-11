
const mongoose = require('mongoose')
const Ride = require('../models/Rides.model')
const Booking = require('../models/Booking.model')

const publishRide = async (req, res) => {
  try {
    const ride = await Ride.create({
      driverId: req.user.id,
      ...req.body,
      totalSeats: req.body.availableSeats
    });

    res.status(201).json({
      success: true,
      message: "Ride published successfully",
      data: ride
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to publish ride"
    })

  }
}

const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user.id }).populate("driverId", "name phoneNumber email fullName")
      .sort({ departureTime: -1 });

    res.status(200).json({
      success: true,
      message: "the total rides ",
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rides"
    });
  }
};

const getBookingRequests = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { rideId } = req.query;

    let query = { status: "pending" };

    if (rideId) {
      // If rideId is provided, verify it belongs to this driver
      const ride = await Ride.findOne({ _id: rideId, driverId });
      if (!ride) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to view requests for this ride"
        });
      }
      query.rideId = rideId;
    } else {
      // Find all rides by this driver
      const rides = await Ride.find({ driverId }).select("_id");
      const rideIds = rides.map(r => r._id);
      query.rideId = { $in: rideIds };
    }

    // Find pending bookings
    const bookings = await Booking.find(query)
      .populate("passengerId", "fullName phoneNumber email name profilePhoto")
      .populate("rideId", "startLocation endLocation departureTime availableSeats pricePerSeat")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error("Get Booking Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking requests"
    });
  }
};

const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const driverId = req.user.id;

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "pending") {
      return res.status(404).json({
        success: false,
        message: "Booking request not found or already processed"
      });
    }

    // 2. Find and verify the ride
    const ride = await Ride.findById(booking.rideId);
    if (!ride || ride.driverId.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to accept this booking"
      });
    }

    // 3. check seats
    if (ride.availableSeats < booking.seatsRequested) {
      return res.status(400).json({
        success: false,
        message: "Not enough seats available"
      });
    }

    // 4. Atomic update to deduct seats
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: ride._id,
        availableSeats: { $gte: booking.seatsRequested }
      },
      {
        $inc: { availableSeats: -booking.seatsRequested }
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(400).json({
        success: false,
        message: "Failed to update seats. Maybe someone else booked?"
      });
    }

    // 5. If seats are now 0, mark as filled
    if (updatedRide.availableSeats === 0) {
      updatedRide.status = "filled";
      await updatedRide.save();
    }

    // 6. Update booking status
    booking.status = "accepted";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      data: booking
    });

  } catch (error) {
    console.error("Accept Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept booking",
      error: error.message
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const driverId = req.user.id;

    const booking = await Booking.findById(bookingId).populate("rideId");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking request not found"
      });
    }

    // Robust check for rideId existence after population
    if (!booking.rideId) {
      return res.status(404).json({
        success: false,
        message: "Associated ride not found"
      });
    }

    if (booking.rideId.driverId.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to reject this booking"
      });
    }

    booking.status = "rejected";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking request rejected",
      data: booking
    });

  } catch (error) {
    console.error("Reject Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject booking",
      error: error.message
    });
  }
};

const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    if (ride.driverId.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this ride"
      });
    }

    ride.status = "cancelled";
    await ride.save();

    // Also cancel all associated bookings that are not rejected or completed
    await Booking.updateMany(
      { rideId, status: { $in: ["pending", "accepted"] } },
      { status: "cancelled" }
    );

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel Ride Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel ride",
      error: error.message
    });
  }
};

module.exports = { publishRide, getMyRides, getBookingRequests, acceptBooking, rejectBooking, cancelRide };