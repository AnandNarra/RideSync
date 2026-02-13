const express = require("express")
const { findRides, bookRide, completeRide, getMyBookings, updateRide, updateBooking, cancelBooking } = require("../controllers/ride.controller")
const auth = require("../middlewares/auth.middleware")

const router = express.Router()

router.get("/rides/search", findRides)
router.get("/bookings/my", auth, getMyBookings)
router.post("/rides/:rideId/book", auth, bookRide)
router.patch("/rides/:rideId/complete", auth, completeRide)
router.patch("/rides/:rideId", auth, updateRide)

// Booking management for passengers
router.patch("/bookings/:bookingId", auth, updateBooking)
router.patch("/bookings/:bookingId/cancel", auth, cancelBooking)

module.exports = router