
const Ride = require('../models/Rides.model')

const publishRide = async(req,res) =>{
    try {
        const ride = await Ride.create({
            driverId:req.user.id,
            ...req.body
            
        });

        res.status(201).json({
            success:true,
            message:"Ride published successfully",
            data:ride
        });
        
    } catch (error) {

        res.status(500).json({
            message:"Failed to publish ride"
        })
        
    }
}

const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.user.id }).populate("driverId", "name phoneNumber email fullName")
      .sort({ departureTime: -1 });

    res.status(200).json({
      success: true,
      message:"the total rides ",
      count: rides.length,
      data: rides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rides"
    });
  }
};

module.exports = { publishRide, getMyRides};