
const mongoose = require('mongoose')
const Ride = require('../models/Rides.model')
const Booking = require('../models/Booking.model')
const sendEmail = require('../utils/sendEmail')
const uploadOnCloudinary = require('../utils/cloudinary')
const { deleteFile } = require('../utils/cleanupHelper')

const publishRide = async (req, res) => {
  try {
    const { startLocation, endLocation, route, departureTime, availableSeats, pricePerSeat, vehicle } = req.body;

    // Handle nested vehicle data (parsed from JSON if sent via FormData as a string)
    let vehicleData = vehicle;
    if (typeof vehicle === 'string') {
      try {
        vehicleData = JSON.parse(vehicle);
      } catch (e) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({ message: "Invalid vehicle data format" });
      }
    }

    // Coordinates and route also need parsing if sent via FormData
    const parsedStartLocation = typeof startLocation === 'string' ? JSON.parse(startLocation) : startLocation;
    const parsedEndLocation = typeof endLocation === 'string' ? JSON.parse(endLocation) : endLocation;
    const parsedRoute = typeof route === 'string' ? JSON.parse(route) : route;

    if (!req.file) {
      return res.status(400).json({ message: "Vehicle image is required" });
    }

    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
    }

    const ride = await Ride.create({
      driverId: req.user.id,
      startLocation: parsedStartLocation,
      endLocation: parsedEndLocation,
      route: parsedRoute,
      departureTime,
      availableSeats: Number(availableSeats),
      totalSeats: Number(availableSeats),
      pricePerSeat: Number(pricePerSeat),
      vehicle: {
        ...vehicleData,
        vehicleImage: cloudinaryResponse.secure_url
      }
    });

    res.status(201).json({
      success: true,
      message: "Ride published successfully",
      data: ride
    });

  } catch (error) {
    console.error("Publish Ride Error:", error);
    // Clean up temp file if error occurred before cloudinary upload ran
    if (req.file) deleteFile(req.file.path);
    res.status(500).json({
      message: "Failed to publish ride",
      error: error.message
    })
  }
}

const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user.id })
      .populate("driverId", "name phoneNumber email fullName")
      .sort({ createdAt: -1 });

    // Fetch bookings for each ride
    const rideIds = rides.map(r => r._id);
    const bookings = await Booking.find({ rideId: { $in: rideIds } })
      .populate("passengerId", "fullName name profilePhoto phoneNumber email")
      .sort({ createdAt: -1 });

    // Group bookings by rideId
    const bookingsByRide = {};
    bookings.forEach(b => {
      const key = b.rideId.toString();
      if (!bookingsByRide[key]) bookingsByRide[key] = [];
      bookingsByRide[key].push(b);
    });

    // Attach bookings to each ride
    const ridesWithBookings = rides.map(ride => ({
      ...ride.toObject(),
      bookings: bookingsByRide[ride._id.toString()] || []
    }));

    res.status(200).json({
      success: true,
      message: "the total rides",
      count: ridesWithBookings.length,
      data: ridesWithBookings
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

    let query = { status: { $in: ["pending", "accepted"] } };

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

    // 7. Send email notification to passenger (fire-and-forget)
    try {
      await booking.populate("passengerId", "fullName email");
      await booking.populate("rideId", "startLocation endLocation departureTime pricePerSeat");

      const passengerEmail = booking.passengerId?.email;
      const passengerName = booking.passengerId?.fullName || "Passenger";
      const route = `${booking.rideId?.startLocation?.name?.split(',')[0] || 'N/A'} → ${booking.rideId?.endLocation?.name?.split(',')[0] || 'N/A'}`;
      const departure = booking.rideId?.departureTime ? new Date(booking.rideId.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
      const totalPrice = (booking.rideId?.pricePerSeat || 0) * booking.seatsRequested;

      if (passengerEmail) {
        sendEmail(
          passengerEmail,
          "✅ Your RideSync Booking has been Accepted!",
          `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px 28px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; margin: 0;">🎉 Booking Accepted!</h1>
            </div>
            <div style="padding: 28px;">
              <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>${passengerName}</strong>, great news! Your booking has been <span style="color: #16a34a; font-weight: 700;">accepted</span> by the driver.</p>
              <div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Route</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${route}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Departure</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${departure}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Seats</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${booking.seatsRequested}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Total</td><td style="padding: 8px 0; color: #16a34a; font-weight: 700; font-size: 18px; text-align: right;">₹${totalPrice}</td></tr>
                </table>
              </div>
              <p style="color: #64748b; font-size: 13px; margin: 20px 0 0; text-align: center;">Get ready for your ride! 🚗</p>
            </div>
            <div style="background: #f1f5f9; padding: 16px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">RideSync — Share the ride, share the joy</p>
            </div>
          </div>`
        );
      }
    } catch (emailErr) {
      console.error("Email notification error (accept):", emailErr.message);
    }

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

    // Send email notification to passenger (fire-and-forget)
    try {
      await booking.populate("passengerId", "fullName email");

      const passengerEmail = booking.passengerId?.email;
      const passengerName = booking.passengerId?.fullName || "Passenger";
      const route = booking.rideId?.startLocation?.name
        ? `${booking.rideId.startLocation.name.split(',')[0]} → ${booking.rideId.endLocation.name.split(',')[0]}`
        : 'N/A';
      const departure = booking.rideId?.departureTime ? new Date(booking.rideId.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

      if (passengerEmail) {
        sendEmail(
          passengerEmail,
          "❌ Your RideSync Booking was Declined",
          `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #4a1d1d 100%); padding: 32px 28px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Booking Declined</h1>
            </div>
            <div style="padding: 28px;">
              <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>${passengerName}</strong>, unfortunately your booking request was <span style="color: #dc2626; font-weight: 700;">declined</span> by the driver.</p>
              <div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Route</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${route}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Departure</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${departure}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Seats</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${booking.seatsRequested}</td></tr>
                </table>
              </div>
              <p style="color: #64748b; font-size: 13px; margin: 20px 0 0; text-align: center;">Don't worry — there are plenty of rides available! 🔍</p>
            </div>
            <div style="background: #f1f5f9; padding: 16px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">RideSync — Share the ride, share the joy</p>
            </div>
          </div>`
        );
      }
    } catch (emailErr) {
      console.error("Email notification error (reject):", emailErr.message);
    }

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