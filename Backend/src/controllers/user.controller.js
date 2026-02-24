const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/User.model');
const Driver = require('../models/Driver.model');
const uploadOnCloudinary = require('../utils/cloudinary');
const { cleanupUploadedFiles, deleteFile } = require('../utils/cleanupHelper');

const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail');
const axios = require("axios");

const register = async (req, res) => {

  const { name, fullName, email, password, phoneNumber } = req.body;

  if (!name || !fullName || !email || !password || !phoneNumber) {
    if (req.file) deleteFile(req.file.path);
    return res.status(400).json({
      message: "Please fill all required fields",
      success: false
    })
  }

  try {

    const exitingUser = await User.findOne({ email })

    if (exitingUser) {
      if (req.file) deleteFile(req.file.path);
      return res.status(409).json({
        message: "User with this email already exists....",
        success: false
      })
    }

    let profilePhotoUrl = null;
    if (req.file) {
      const profilePhoto = await uploadOnCloudinary(req.file.path);
      if (profilePhoto) {
        profilePhotoUrl = profilePhoto.secure_url;
      }
    }

    await User.create({
      name,
      fullName,
      email,
      password,
      phoneNumber,
      profilePhoto: profilePhotoUrl
    })

    // Send Welcome Email
    const subject = "Welcome to RideSync! 🚗";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Welcome to RideSync, ${name}!</h2>
        <p>We're thrilled to have you join our community of smart travelers.</p>
        <p>With RideSync, you can easily find affordable rides or share your travel costs by offering seats in your car.</p>
        <div style="margin: 20px 0; padding: 15px; background: #eff6ff; border-left: 4px solid #3b82f6;">
          <strong>Ready to get started?</strong>
          <ul>
            <li>Find a ride for your next trip</li>
            <li>Publish a ride if you're driving</li>
            <li>Complete your profile for a better experience</li>
          </ul>
        </div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Happy traveling!</p>
        <p>Best regards,<br>The RideSync Team</p>
      </div>
    `;
    sendEmail(email, subject, html);

    return res.status(201).json({
      message: "user register successfully..."
    })

  } catch (error) {

    console.log(error.message);
    if (req.file) deleteFile(req.file.path);

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
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
      cleanupUploadedFiles(req);
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
    let newDriver;
    if (driverRequest) {
      // Update
      driverRequest.licenseNumber = licenseNumber;
      driverRequest.aadhaarNumber = aadhaarNumber;
      driverRequest.experience = experience;
      driverRequest.licensePhoto = licensePhoto.secure_url;
      driverRequest.aadhaarPhoto = aadhaarPhoto.secure_url;
      driverRequest.status = "pending";
      driverRequest.rejectedReason = null;

      await driverRequest.save();
    } else {
      // Create
      newDriver = await Driver.create({
        userId,
        licenseNumber,
        aadhaarNumber,
        experience,
        licensePhoto: licensePhoto.secure_url,
        aadhaarPhoto: aadhaarPhoto.secure_url,
        status: "pending",
      });
    }

    // Trigger n8n Webhook
    try {
      const driverDoc = driverRequest ? driverRequest : newDriver;

      await axios.post(
        "https://narraanand.app.n8n.cloud/webhook/driver-request",
        {
          driverId: driverDoc._id.toString(),
          userId: userId.toString(),
          name: user.name,
          email: user.email,
          licenseNumber,
          aadhaarNumber,
          experience,
          licensePhoto: licensePhoto.secure_url,
          aadhaarPhoto: aadhaarPhoto.secure_url
        }
      );
    } catch (webhookError) {
      console.error("n8n Webhook Error:", webhookError.message);
      // Don't fail the user request if webhook fails
    }

    // 13. Success response
    return res.status(201).json({
      success: true,
      message: "Driver request submitted successfully",
    });

  } catch (error) {
    console.error("Driver Request Error:", error);
    cleanupUploadedFiles(req); // Ensure temp files are removed on any error

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

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    })

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

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, name, email } = req.body;
    let updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (name) updateData.name = name;

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        if (req.file) deleteFile(req.file.path);
        return res.status(409).json({
          success: false,
          message: "Email is already taken",
        });
      }
      updateData.email = email;
    }

    if (phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber, _id: { $ne: userId } });
      if (existingUser) {
        if (req.file) deleteFile(req.file.path);
        return res.status(409).json({
          success: false,
          message: "Phone number is already taken",
        });
      }
      updateData.phoneNumber = phoneNumber;
    }

    if (req.file) {
      const profilePhotoLocalPath = req.file.path;
      const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);

      if (!profilePhoto) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile photo",
        });
      }

      updateData.profilePhoto = profilePhoto.secure_url;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    if (req.file) deleteFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { register, login, driverRequest, getMyDriverStatus, logout, refreshAccessToken, getMyProfile, updateProfile }
