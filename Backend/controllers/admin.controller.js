const Drivers = require("../models/Driver.model");

const getAllPendingRequest = async (req, res) => {
  try {
    const drivers = await Drivers.find().populate("userId", "name email role").sort({createdAt:-1})
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

module.exports = { getAllPendingRequest };
