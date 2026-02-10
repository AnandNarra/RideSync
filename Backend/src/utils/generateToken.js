const jwt = require('jsonwebtoken')

const generateAccessToken = (userId, userRole) => {

    return jwt.sign(
        { id: userId ,
            role:userRole
        },
        process.env.JWT_ACCESSTOKEN_SECRET,
        { expiresIn: "15m" }
    )

}

const generateRefreshToken = (userId) =>{

    return jwt.sign(
        {
            id : userId
        },
        process.env.JWT_REFRESHTOKEN_SECRET,
        {
            expiresIn : "7d"
        }
    )
}

module.exports = {generateAccessToken , generateRefreshToken }