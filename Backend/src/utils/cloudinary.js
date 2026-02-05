const cloudinary = require("cloudinary").v2;
const fs = require("fs");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete local file after successful upload
    deleteLocalFile(localFilePath);

    return response;

  } catch (error) {
    console.log("Cloudinary Upload Error:", error.message);

    // Delete local file even if upload failed
    deleteLocalFile(localFilePath);

    return null;
  }
};

// Helper function to safely delete local files
const deleteLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Failed to delete local file: ${filePath}`, error.message);
  }
};

module.exports = uploadOnCloudinary;
