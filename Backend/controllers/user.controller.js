
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


const driverRequest = async (req, res) => {


  try {
    const { licenseNumber, vehicleModel, numberPlate } = req.body;

    const userId = req.user.id;



    if (!licenseNumber || !vehicleModel || !numberPlate) {
      return res.status(400).json({
        message: "Please fill all required fields",
        success: false,
      });
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }


    if (user.role === "driver") {
      return re.status(404).json({
        message: "you already a driver..."
      })
    }

    const existingLicense = await Driver.findOne({ licenseNumber });

    if (existingLicense) {
      return res.status(409).json({
        success: false,
        message: "This license number is already registered",
      });
    }


    let driverRequest = await Driver.findById(userId)

    if (driverRequest) {
      if (driverRequest.status === "pending") {
        return res.status(405).json({
          message: "your request is already on pending...."
        })
      }



      driverRequest.status = "pending",
        driverRequest.licenseNumber = licenseNumber,
        driverRequest.vehicleModel = vehicleModel,
        driverRequest.numberPlate = numberPlate,
        driverRequest.rejectedReason = null,
        await driverRequest.save();
    }
    else {
      driverRequest = await Driver.create({
        userId,
        licenseNumber,
        vehicleModel,
        numberPlate,

      })

      driverRequest.status = "pending"
    }

    return res.status(201).json({
      message: "submited the request to admin"
    })


  } catch (error) {

    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = { register, login, driverRequest }