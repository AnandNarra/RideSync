
const User = require('../models/User.model')
const Driver = require("../models/Driver.model")
const bcrypt = require('bcrypt');
const generateWebToken = require('../utils/generateToken');

const register = async (req, res) => {

  const { name, fullName, email, password, phoneNumber } = req.body;

  if (!name || !fullName || !email || !password || !phoneNumber) {
    return res.status(400).json({
      message: "Please fill all required fields",
      success: false
    })
  }

  try {

    const exitingUser = await User.findOne({ email })

    if (exitingUser) {
      return res.status(409).json({
        message: "User with this email already exists....",
        success: false
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      fullName,
      email,
      password: hashedPassword,
      phoneNumber
    })

    return res.status(201).json({
      message: "user register successfully..."
    })

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({
      message: "Something went wrong while registering user",
      error: error.message
    })

  }

}

const login = async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist. Please register first."
      })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      })
    }

    const token = generateWebToken(user._id)

    return res.status(201).json({
      success: true,
      message: "user login successfully...",
      token,
      user
    })

  } catch (error) {

    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal server error while login..."
    })

  }

}


const requestToAdmin = async (req, res) => {
  try {
    const { licenseNumber, vehicleModel, numberPlate, seats } = req.body;

    if (!licenseNumber || !vehicleModel || !numberPlate || !seats) {
      return res.status(400).json({
        message: "Please fill all required fields",
        success: false,
      });
    }

    const exitingDriver = await Driver.findOne({ licenseNumber });

    if (exitingDriver) {
      return res.status(409).json({
        message: "Driver already exists with this license number",
        success: false,
      });
    }

    await Driver.create({
      licenseNumber,
      vehicleModel,
      numberPlate,
      seats,
    });

    return res.status(201).json({
      success: true,
      message: "Request sent. Waiting for admin approval",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = { register, login, requestToAdmin }