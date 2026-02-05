const bcrypt = require('bcrypt');
const generateWebToken = require('../utils/generateToken');
const User = require('../models/User.model');
const Driver = require('../models/Driver.model');
const uploadOnCloudinary = require('../utils/cloudinary');

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
    user.password = undefined;

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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 7. Check role
    if (user.role === "driver") {
      return res.status(400).json({
        success: false,
        message: "You are already a driver",
      });
    }

   
    
    // 9. Find existing request
    let driverRequest = await Driver.findOne({ userId });

    // 10. Check pending request
    if (driverRequest && driverRequest.status === "pending") {
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

module.exports = driverRequest;



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


module.exports = { register, login, driverRequest, getMyDriverStatus }
