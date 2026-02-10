const express = require("express")
const verifyAccessToken = require("../middlewares/auth.middleware")
const roleCheck = require("../middlewares/roleCheck.middleware")
const checkDriverApproved = require("../middlewares/approvedDriver.middleware")

const validatePublishRide = require("../middlewares/vaildatePublishRide.middleware")
const { publishRide, getMyRides } = require("../controllers/driver.controller")

const router = express.Router()

router.post("/rides", verifyAccessToken , roleCheck("driver") , checkDriverApproved ,validatePublishRide, publishRide)

router.get("/rides/my", verifyAccessToken, roleCheck("driver"), checkDriverApproved, getMyRides )

module.exports = router