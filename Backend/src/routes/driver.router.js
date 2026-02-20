const express = require("express")
const verifyAccessToken = require("../middlewares/auth.middleware")
const roleCheck = require("../middlewares/roleCheck.middleware")
const checkDriverApproved = require("../middlewares/approvedDriver.middleware")

const validatePublishRide = require("../middlewares/vaildatePublishRide.middleware")
const { publishRide, getMyRides, getBookingRequests, acceptBooking, rejectBooking, cancelRide } = require("../controllers/driver.controller")
const upload = require("../middlewares/multer.middleware")

const router = express.Router()

router.post("/rides", verifyAccessToken, roleCheck("driver"), checkDriverApproved, upload.single('vehicleImage'), validatePublishRide, publishRide)

router.get("/rides/my", verifyAccessToken, roleCheck("driver"), checkDriverApproved, getMyRides)
router.patch("/rides/:rideId/cancel", verifyAccessToken, roleCheck("driver"), checkDriverApproved, cancelRide)

// Booking Management
router.get("/bookings", verifyAccessToken, roleCheck("driver"), checkDriverApproved, getBookingRequests)
router.patch("/bookings/:bookingId/accept", verifyAccessToken, roleCheck("driver"), checkDriverApproved, acceptBooking)
router.patch("/bookings/:bookingId/reject", verifyAccessToken, roleCheck("driver"), checkDriverApproved, rejectBooking)

module.exports = router