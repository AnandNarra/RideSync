const { ZodError } = require("zod");
const { cleanupUploadedFiles, deleteFile } = require("../utils/cleanupHelper");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Cleanup any uploaded files on validation failure
    if (req.file) deleteFile(req.file.path);
    if (req.files) cleanupUploadedFiles(req);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    // Handle non-Zod errors
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = validate;
