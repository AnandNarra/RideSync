const express = require("express");
const verifyAccessToken = require("../middlewares/auth.middleware");
const { sendMessage, getMessages } = require("../controllers/chat.controller");

const router = express.Router();

router.post("/:bookingId", verifyAccessToken, sendMessage);
router.get("/:bookingId", verifyAccessToken, getMessages);

module.exports = router;
