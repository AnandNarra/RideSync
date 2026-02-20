
const Ride = require("../models/Rides.model")
const Booking = require("../models/Booking.model")
const User = require("../models/User.model")
const sendEmail = require("../utils/sendEmail")

const findRides = async (req, res) => {
    try {
        const { from, to, seats } = req.query;

        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "From and To locations are required"
            });
        }

        const query = {
            "startLocation.name": { $regex: new RegExp(`^${from}$`, "i") },
            "endLocation.name": { $regex: new RegExp(`^${to}$`, "i") },
            status: "published",
            availableSeats: { $gt: 0 },
            departureTime: { $gte: new Date() }
        };

        if (seats) {
            query.availableSeats = { $gte: Number(seats) };
        }

        const rides = await Ride.find(query)
            .populate("driverId", "fullName phoneNumber email name profilePhoto")
            .sort({ departureTime: 1 });


        return res.status(200).json({
            success: true,
            count: rides.length,
            data: rides
        });

    } catch (error) {
        console.error("Search Rides Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rides"
        });
    }
}

const bookRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { seatsRequested } = req.body;
        const passengerId = req.user.id;

        if (!seatsRequested || seatsRequested < 1) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid number of seats"
            });
        }

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        if (ride.status !== "published") {
            return res.status(400).json({
                success: false,
                message: "This ride is not available for booking"
            });
        }

        if (ride.availableSeats < seatsRequested) {
            return res.status(400).json({
                success: false,
                message: `Only ${ride.availableSeats} seats available`
            });
        }

        if (new Date(ride.departureTime) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot book a ride that has already departed"
            });
        }

        // Create booking with status 'pending'
        const booking = await Booking.create({
            rideId,
            passengerId,
            seatsRequested,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Booking request sent to driver",
            data: booking
        });

        // Send email notification to driver (fire-and-forget, after response)
        try {
            const driver = await User.findById(ride.driverId).select("fullName email");
            const passenger = await User.findById(passengerId).select("fullName");

            if (driver?.email) {
                const passengerName = passenger?.fullName || "A passenger";
                const route = `${ride.startLocation?.name?.split(',')[0] || 'N/A'} → ${ride.endLocation?.name?.split(',')[0] || 'N/A'}`;
                const departure = ride.departureTime ? new Date(ride.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
                const totalEarnings = (ride.pricePerSeat || 0) * seatsRequested;

                sendEmail(
                    driver.email,
                    "🔔 New Booking Request on RideSync!",
                    `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px 28px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 22px; margin: 0;">🔔 New Booking Request!</h1>
                        </div>
                        <div style="padding: 28px;">
                            <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>${driver.fullName || 'Driver'}</strong>, <strong>${passengerName}</strong> wants to ride with you!</p>
                            <div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Route</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${route}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Departure</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${departure}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Seats</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${seatsRequested}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 700;">Potential Earnings</td><td style="padding: 8px 0; color: #16a34a; font-weight: 700; font-size: 18px; text-align: right;">₹${totalEarnings}</td></tr>
                                </table>
                            </div>
                            <p style="color: #64748b; font-size: 13px; margin: 20px 0 0; text-align: center;">Log in to accept or decline this request 🚗</p>
                        </div>
                        <div style="background: #f1f5f9; padding: 16px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 11px; margin: 0;">RideSync — Share the ride, share the joy</p>
                        </div>
                    </div>`
                );
            }
        } catch (emailErr) {
            console.error("Email notification error (new booking):", emailErr.message);
        }

    } catch (error) {
        console.error("Book Ride Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to book ride"
        });
    }
}

const completeRide = async (req, res) => {
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

        // Only ride owner can complete
        if (ride.driverId.toString() !== driverId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to complete this ride"
            });
        }

        ride.status = "completed";
        await ride.save();

        // Update all accepted bookings to 'completed'
        await Booking.updateMany(
            { rideId, status: "accepted" },
            { status: "completed" }
        );

        res.status(200).json({
            success: true,
            message: "Ride marked as completed"
        });

    } catch (error) {
        console.error("Complete Ride Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete ride"
        });
    }
}

const getMyBookings = async (req, res) => {
    try {
        const passengerId = req.user.id;

        const bookings = await Booking.find({ passengerId })
            .populate({
                path: "rideId",
                populate: {
                    path: "driverId",
                    select: "fullName phoneNumber profilePhoto name"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error("Get My Bookings Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
}
const updateRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.user.id;
        const { startLocation, endLocation, departureTime, totalSeats, availableSeats, pricePerSeat } = req.body;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: "Ride not found"
            });
        }

        // Only ride owner can update
        if (ride.driverId.toString() !== driverId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this ride"
            });
        }

        const updateData = {};
        if (startLocation) updateData.startLocation = startLocation;
        if (endLocation) updateData.endLocation = endLocation;
        if (departureTime) updateData.departureTime = departureTime;
        if (totalSeats) updateData.totalSeats = totalSeats;
        if (availableSeats) updateData.availableSeats = availableSeats;
        if (pricePerSeat) updateData.pricePerSeat = pricePerSeat;

        const updatedRide = await Ride.findByIdAndUpdate(rideId, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: "Ride updated successfully",
            data: updatedRide
        });

    } catch (error) {
        console.error("Update Ride Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update ride",
            error: error.message
        });
    }
}

const updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const passengerId = req.user.id;
        const { seatsRequested } = req.body;

        const booking = await Booking.findById(bookingId).populate("rideId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.passengerId.toString() !== passengerId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to update this booking"
            });
        }

        if (booking.status !== "pending" && booking.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: `Cannot update booking with status: ${booking.status}`
            });
        }

        if (seatsRequested) {
            const seatsDiff = seatsRequested - booking.seatsRequested;
            if (booking.rideId.availableSeats < seatsDiff) {
                return res.status(400).json({
                    success: false,
                    message: "Not enough seats available"
                });
            }
            booking.seatsRequested = seatsRequested;
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: booking
        });

    } catch (error) {
        console.error("Update Booking Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking",
            error: error.message
        });
    }
}

const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const passengerId = req.user.id;

        const booking = await Booking.findById(bookingId).populate("rideId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.passengerId.toString() !== passengerId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to cancel this booking"
            });
        }

        if (booking.status === "cancelled" || booking.status === "completed") {
            return res.status(400).json({
                success: false,
                message: `Booking is already ${booking.status}`
            });
        }

        // If it was accepted, we need to return seats back to the ride
        if (booking.status === "accepted") {
            const ride = await Ride.findById(booking.rideId._id);
            ride.availableSeats += booking.seatsRequested;
            // If ride was filled, change status back to published
            if (ride.status === 'filled') {
                ride.status = 'published';
            }
            await ride.save();
        }

        booking.status = "cancelled";
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
            error: error.message
        });
    }
}

module.exports = { findRides, bookRide, completeRide, getMyBookings, updateRide, updateBooking, cancelBooking }
