const { z } = require("zod");

const publishRideSchema = z.object({
    startLocation: z.object({
        name: z.string().min(1, "Start location name is required"),
        coordinates: z.array(z.number()).length(2, "Start coordinates are required")
    }),
    endLocation: z.object({
        name: z.string().min(1, "End location name is required"),
        coordinates: z.array(z.number()).length(2, "End coordinates are required")
    }),
    route: z.object({
        type: z.literal("LineString"),
        coordinates: z.array(z.array(z.number()))
    }),
    departureTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid departure time"
    }),
    availableSeats: z.number().int().min(1).max(6),
    pricePerSeat: z.number().min(1),

    // Vehicle Details (Nested as per model)
    vehicle: z.object({
        vehicleType: z.enum(["Car", "Bike", "SUV", "Luxury", "Other"]),
        vehicleModel: z.string().min(1, "Vehicle model is required").trim(),
        vehicleNumber: z.string().min(1, "Vehicle number is required").trim().toUpperCase(),
        // Note: vehicleImage is handled after upload
    })
});

module.exports = { publishRideSchema };
