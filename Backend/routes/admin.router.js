const express = require("express");
const { getAllPendingRequest, updateDriverStatus } = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/drivers", authMiddleware, getAllPendingRequest)
router.patch("/drivers/:driverId", authMiddleware, updateDriverStatus)

module.exports = router