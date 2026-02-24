const express = require("express");
const { getAllPendingRequest, updateDriverStatus, getAdminStats } = require("../controllers/admin.controller");

const verifyAccessToken = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/drivers", verifyAccessToken, getAllPendingRequest)
router.get("/stats", verifyAccessToken, getAdminStats)

// Internal Route for n8n (Secure via Secret Key)
router.patch("/internal/drivers/:driverId", async (req, res) => {
    try {
        const internalSecret = req.headers["x-internal-secret"];
        if (internalSecret !== process.env.INTERNAL_SECRET) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - Invalid Secret",
            });
        }
        return updateDriverStatus(req, res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.patch("/drivers/:driverId", verifyAccessToken, updateDriverStatus)

module.exports = router