const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/User.model');
const Driver = require('../models/Driver.model');
const uploadOnCloudinary = require('../utils/cloudinary');
const { cleanupUploadedFiles } = require('../utils/cleanupHelper');

const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')

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

    await User.create({
      name,
      fullName,
      email,
      password,
      phoneNumber
    })

    // const newUser = new User(req.body)
    // await newUser.save()

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

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(409).json({
        success: false,
        message: "User does not exist. Please register first."
      })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(409).json({
        success: false,
        message: "Invalid password"
      })
    }

    const accessToken = generateAccessToken(user._id, user.role)

    const refreshToken = generateRefreshToken(user._id)

    user.refreshToken = refreshToken
    await user.save()

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })


    return res.status(201).json({
      success: true,
      message: "user login successfully...",
      accessToken,
      user: { _id: user._id, role: user.role, name: user.name }
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
    // 1. Get data
    const { licenseNumber, aadhaarNumber, experience } = req.body;
    const userId = req.user.id;

    // 2. Validate input fields
    if (!licenseNumber || !aadhaarNumber || !experience) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // 3. Validate experience
    if (experience < 0 || experience > 40) {
      return res.status(400).json({
        success: false,
        message: "Experience must be between 0 and 40 years",
      });
    }

    // 4. Validate files
    if (!req.files?.licensePhoto || !req.files?.aadhaarPhoto) {
      return res.status(400).json({
        success: false,
        message: "Both license and Aadhaar photos are required",
      });
    }

    // 5. Get file paths
    const licensePhotoLocalPath = req.files.licensePhoto[0].path;
    const aadhaarPhotoLocalPath = req.files.aadhaarPhoto[0].path;

    // 6. Check user
    const user = await User.findById(userId);

    if (!user) {
      cleanupUploadedFiles(req);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 7. Check role
    if (user.role === "driver") {
      cleanupUploadedFiles(req);
      return res.status(400).json({
        success: false,
        message: "You are already a driver",
      });
    }



    // 9. Find existing request
    let driverRequest = await Driver.findOne({ userId });

    // 10. Check pending request
    if (driverRequest && driverRequest.status === "pending") {
      cleanupUploadedFiles(req);
      return res.status(409).json({
        success: false,
        message: "Your request is already pending",
      });
    }

    // 11. Check duplicate license/aadhaar (other users)
    const existingDriver = await Driver.findOne({
      $or: [{ licenseNumber }, { aadhaarNumber }],
      userId: { $ne: userId },
    });

    if (existingDriver) {
      cleanupUploadedFiles(req);
      return res.status(409).json({
        success: false,
        message:
          "This license number or Aadhaar number is already registered",
      });
    }

    // 8. Upload to Cloudinary

    const licensePhoto = await uploadOnCloudinary(licensePhotoLocalPath);
    const aadhaarPhoto = await uploadOnCloudinary(aadhaarPhotoLocalPath);

    if (!licensePhoto || !aadhaarPhoto) {
      cleanupUploadedFiles(req);
      return res.status(400).json({
        success: false,
        message: "Failed to upload images",
      });
    }


    // 12. Update or Create
    if (driverRequest) {
      // Update
      driverRequest.licenseNumber = licenseNumber;
      driverRequest.aadhaarNumber = aadhaarNumber;
      driverRequest.experience = experience;
      driverRequest.licensePhoto = licensePhoto.url;
      driverRequest.aadhaarPhoto = aadhaarPhoto.url;
      driverRequest.status = "pending";
      driverRequest.rejectedReason = null;

      await driverRequest.save();
    } else {
      // Create
      await Driver.create({
        userId,
        licenseNumber,
        aadhaarNumber,
        experience,
        licensePhoto: licensePhoto.url,
        aadhaarPhoto: aadhaarPhoto.url,
        status: "pending",
      });
    }

    // 13. Success response
    return res.status(201).json({
      success: true,
      message: "Driver request submitted successfully",
    });

  } catch (error) {
    console.error("Driver Request Error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "License or Aadhaar already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMyDriverStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const driverRequest = await Driver.findOne({ userId });

    if (!driverRequest) {
      return res.status(200).json({
        success: true,
        data: { status: 'none' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: driverRequest.status,
        rejectedReason: driverRequest.rejectedReason
      }
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


const logout = async (req, res) => {

  try {

    const { userId } = req.user

    await User.findByIdAndUpdate(userId, { refreshToken: null })

    res.clearCookie('refreshToken')

    res.status(200).json({
      success: true,
      message: "User logout successfully..."
    })



  } catch (error) {

    console.error(error);
    res.status(400).json({
      error: true,
      message: error.message
    })




  }
}

const refreshAccessToken = async (req, res) => {

  try {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token found in cookies.")
    }

    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_SECRET)
    const userId = decodedRefreshToken.id;
    const exitingUser = await User.findById(userId)

    if (!exitingUser) {
      throw new Error("User not found")
    }

    const newAccessToken = generateAccessToken(userId, exitingUser.role);

    return res.status(200).json({
      accessToken: newAccessToken
    })


  } catch (error) {

    res.status(401).json({
      message: error.message
    })

  }

}

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw new Error("User doesn't exits")
    }

    return res.status(200).json({
      message: "Use found successfully...",
      user: existingUser
    })


  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: true,
      message: error.message
    })
  }

}

module.exports = { register, login, driverRequest, getMyDriverStatus, logout, refreshAccessToken, getMyProfile }
