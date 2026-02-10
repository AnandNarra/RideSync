const Driver = require("../models/Driver.model");


const checkDriverApproved = async(req,res,next) =>{

    try {

        const driver = await Driver.findOne({userId : req.user.id})

        if(!driver){
            return res.status(403).json({
                message:"Driver profile is not found..."
            })
        }

        if(driver.status !== "approved"){
            return res.status(403).json({
                message:"Driver not approved to publish rides..."
            })
        }

        next();
        
    } catch (error) {

        return res.status(500).json({
            message:"Error verifying driver approval"
        })
        
    }
}

module.exports = checkDriverApproved;