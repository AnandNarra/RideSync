
const Ride = require("../models/Rides.model")

const findRides = async (req, res) => {
    try {
        const { from, to, seats } = req.query;

        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: "From and To locations are required"
            });
        }

        const query = {
            "startLocation.name": { $regex: new RegExp(`^${from}$`, "i") },
            "endLocation.name": { $regex: new RegExp(`^${to}$`, "i") },
            status: "published",
            availableSeats: { $gt: 0 },
            departureTime: { $gte: new Date() }
        };

        if (seats) {
            query.availableSeats = { $gte: Number(seats) };
        }

        const rides = await Ride.find(query)
            .populate("driverId", "fullName phoneNumber email name")
            .sort({ departureTime: 1 });


        return res.status(200).json({
            success: true,
            count: rides.length,
            data: rides
        });

    } catch (error) {
        console.error("Search Rides Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rides"
        });
    }
}

module.exports = { findRides }
