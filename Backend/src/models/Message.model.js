const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: [true, "Booking ID is required"],
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender ID is required"],
        },
        text: {
            type: String,
            required: [true, "Message text is required"],
            trim: true,
            maxlength: [1000, "Message cannot exceed 1000 characters"],
        },
    },
    { timestamps: true }
);

messageSchema.index({ bookingId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
