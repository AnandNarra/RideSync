const express = require("express");
const { getAllPendingRequest, updateDriverStatus } = require("../controllers/admin.controller");

const verifyAccessToken = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/drivers", verifyAccessToken, getAllPendingRequest)
router.patch("/drivers/:driverId", verifyAccessToken, updateDriverStatus)

module.exports = router