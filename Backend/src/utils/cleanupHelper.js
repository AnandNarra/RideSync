const fs = require("fs");

/**
 * Safely delete uploaded files from Multer request
 * @param {Object} req - Express request object with files
 */
const cleanupUploadedFiles = (req) => {
    try {
        if (!req.files) return;

        // Handle multiple file fields (e.g., req.files.licensePhoto, req.files.aadhaarPhoto)
        Object.keys(req.files).forEach((fieldName) => {
            const files = req.files[fieldName];

            // files can be an array or single file
            const fileArray = Array.isArray(files) ? files : [files];

            fileArray.forEach((file) => {
                if (file && file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log(`Cleaned up temp file: ${file.path}`);
                }
            });
        });
    } catch (error) {
        console.error("Error cleaning up uploaded files:", error.message);
    }
};

/**
 * Safely delete a single file by path
 * @param {string} filePath - Path to file to delete
 */
const deleteFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error.message);
    }
};

module.exports = { cleanupUploadedFiles, deleteFile };
