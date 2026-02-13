const Drivers = require("../models/Driver.model");
const User = require("../models/User.model");
const Booking = require("../models/Booking.model");


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
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(driver.userId._id, { role: 'user' });
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
