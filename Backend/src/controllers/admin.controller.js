const Drivers = require("../models/Driver.model");
const User = require("../models/User.model");
const Booking = require("../models/Booking.model");
const sendEmail = require("../utils/sendEmail");


const getAllPendingRequest = async (req, res) => {
  try {
    const drivers = await Drivers.find().populate("userId", "name email role phoneNumber").sort({ createdAt: -1 })
    return res.status(200).json({
      success: true,
      message: "All pending driver requests",
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, rejectedReason } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    // If rejecting, require a reason
    if (status === 'rejected' && !rejectedReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // Update driver request
    const updateData = { status };
    if (status === 'rejected') {
      updateData.rejectedReason = rejectedReason;
    }

    const driver = await Drivers.findByIdAndUpdate(
      driverId,
      updateData,
      { new: true }
    ).populate("userId", "name email role phoneNumber");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver request not found",
      });
    }

    // Update user role based on status
    if (status === 'approved') {
      await User.findByIdAndUpdate(driver.userId._id, { role: 'driver' });

      // Send Approval Email
      const subject = "Welcome to the RideSync Driver Team! 🚗";
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">Congratulations, ${driver.userId.name}!</h2>
          <p>Your driver registration request has been <strong>approved</strong>.</p>
          <p>You can now start publishing your rides and earning with RideSync.</p>
          <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #22c55e;">
            <strong>Next Steps:</strong>
            <ul>
              <li>Go to the App</li>
              <li>Navigate to "Publish Ride"</li>
              <li>Fill in your ride details</li>
            </ul>
          </div>
          <p>Safe driving!</p>
          <p>Best regards,<br>The RideSync Team</p>
        </div>
      `;
      sendEmail(driver.userId.email, subject, html);

    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(driver.userId._id, { role: 'user' });

      // Send Rejection Email
      const subject = "Update on your RideSync Driver Application";
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #dc2626;">Driver Application Status</h2>
          <p>Hi ${driver.userId.name},</p>
          <p>Thank you for your interest in joining RideSync as a driver.</p>
          <p>We regret to inform you that your registration request has been <strong>rejected</strong> at this time.</p>
          <div style="margin: 20px 0; padding: 15px; background: #fef2f2; border-left: 4px solid #ef4444;">
            <strong>Reason for Rejection:</strong><br>
            ${rejectedReason}
          </div>
          <p>You can review the reason above and apply again once the issues are addressed.</p>
          <p>Best regards,<br>The RideSync Team</p>
        </div>
      `;
      sendEmail(driver.userId.email, subject, html);
    }

    return res.status(200).json({
      success: true,
      message: `Driver request ${status} successfully`,
      data: driver,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: "driver" });
    const totalRides = await Booking.countDocuments();
    const cancelledRides = await Booking.countDocuments({ status: "cancelled" });

    return res.status(200).json({
      success: true,
      message: "Admin statistics fetched successfully",
      data: {
        totalUsers,
        totalDrivers,
        totalRides,
        cancelledRides,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = { getAllPendingRequest, updateDriverStatus, getAdminStats };
