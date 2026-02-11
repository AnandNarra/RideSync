const express = require("express")
const { findRides } = require("../controllers/ride.controller")

const router = express.Router()

router.get("/rides/search", findRides)

module.exports = router