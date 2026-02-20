const { publishRideSchema } = require("../validators/ride.validator");

const validatePublishRide = (req, res, next) => {
  try {
    // Clone body to avoid mutating req.body directly before multer/express-json fully settles if needed
    const data = { ...req.body };

    // Parse JSON strings if they come from FormData
    ["startLocation", "endLocation", "route", "vehicle"].forEach((field) => {
      if (typeof data[field] === "string") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (e) {
          throw new Error(`Invalid JSON for field: ${field}`);
        }
      }
    });

    // Transform availableSeats and pricePerSeat to numbers if they are strings
    if (typeof data.availableSeats === "string") data.availableSeats = Number(data.availableSeats);
    if (typeof data.pricePerSeat === "string") data.pricePerSeat = Number(data.pricePerSeat);

    // Validate with Zod
    const result = publishRideSchema.safeParse(data);

    if (!result.success) {
      return res.status(422).json({
        message: "Validation failed",
        errors: result.error.errors
      });
    }

    // Check departure time
    if (new Date(data.departureTime) <= new Date()) {
      return res.status(400).json({
        message: "Departure time must be in the future"
      });
    }

    // Update req.body with parsed data for the controller
    req.body = result.data;

    next();
  } catch (err) {
    return res.status(422).json({
      message: "Invalid ride data",
      error: err.message
    });
  }
};

module.exports = validatePublishRide;
