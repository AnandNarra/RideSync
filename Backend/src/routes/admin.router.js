const express = require("express");
const { getAllPendingRequest, updateDriverStatus, getAdminStats } = require("../controllers/admin.controller");

const verifyAccessToken = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/drivers", verifyAccessToken, getAllPendingRequest)
router.get("/stats", verifyAccessToken, getAdminStats)
router.patch("/drivers/:driverId", verifyAccessToken, updateDriverStatus)

module.exports = router