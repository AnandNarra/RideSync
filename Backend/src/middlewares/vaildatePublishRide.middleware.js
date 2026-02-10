const { z } = require("zod");

const publishRideSchema = z.object({
  startLocation: z.object({
    name: z.string(),
    coordinates: z.array(z.number()).length(2)
  }),
  endLocation: z.object({
    name: z.string(),
    coordinates: z.array(z.number()).length(2)
  }),
  route: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(z.array(z.number()))
  }),
  departureTime: z.string().datetime(),
  availableSeats: z.number().min(1).max(6),
  pricePerSeat: z.number().min(1)
});

const validatePublishRide = (req, res, next) => {
  try {
    publishRideSchema.parse(req.body);

    if (new Date(req.body.departureTime) <= new Date()) {
      return res.status(400).json({
        message: "Departure time must be in the future"
      });
    }

    next();
  } catch (err) {
    return res.status(422).json({
      message: "Invalid ride data",
      errors: err.errors
    });
  }
};

module.exports = validatePublishRide;
