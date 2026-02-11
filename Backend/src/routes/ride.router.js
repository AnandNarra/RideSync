const express = require("express")
const { findRides, bookRide, completeRide, getMyBookings } = require("../controllers/ride.controller")
const auth = require("../middlewares/auth.middleware")

const router = express.Router()

router.get("/rides/search", findRides)
router.get("/bookings/my", auth, getMyBookings)
router.post("/rides/:rideId/book", auth, bookRide)
router.patch("/rides/:rideId/complete", auth, completeRide)

module.exports = router