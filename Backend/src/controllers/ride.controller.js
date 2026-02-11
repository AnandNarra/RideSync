
const Ride = require("../models/Rides.model")
const Booking = require("../models/Booking.model")

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
            .populate("driverId", "fullName phoneNumber email name")
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

module.exports = { findRides, bookRide, completeRide, getMyBookings }
