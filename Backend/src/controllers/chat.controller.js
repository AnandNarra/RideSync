const Message = require("../models/Message.model");
const Booking = require("../models/Booking.model");
const Ride = require("../models/Rides.model");

/**
 * Verify that the requesting user is either the passenger or driver of this booking.
 */
const verifyBookingParticipant = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId).populate("rideId", "driverId");
    if (!booking) return null;

    const isPassenger = booking.passengerId.toString() === userId;
    const isDriver = booking.rideId?.driverId?.toString() === userId;

    if (!isPassenger && !isDriver) return null;
    return booking;
};

const sendMessage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { text } = req.body;
        const senderId = req.user.id;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required",
            });
        }

        const booking = await verifyBookingParticipant(bookingId, senderId);
        if (!booking) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to send messages in this chat",
            });
        }

        if (booking.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message: "Chat is only available for accepted bookings",
            });
        }

        const message = await Message.create({
            bookingId,
            senderId,
            text: text.trim(),
        });

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const booking = await verifyBookingParticipant(bookingId, userId);
        if (!booking) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view this chat",
            });
        }

        const messages = await Message.find({ bookingId })
            .populate("senderId", "fullName profilePhoto")
            .sort({ createdAt: 1 });

        // Return the other participant's info for the chat header
        const isPassenger = booking.passengerId.toString() === userId;
        let otherUser;
        if (isPassenger) {
            otherUser = await require("../models/User.model")
                .findById(booking.rideId.driverId)
                .select("fullName profilePhoto");
        } else {
            otherUser = await require("../models/User.model")
                .findById(booking.passengerId)
                .select("fullName profilePhoto");
        }

        res.status(200).json({
            success: true,
            otherUser: otherUser || { fullName: "User" },
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
};

module.exports = { sendMessage, getMessages };
