const jwt = require('jsonwebtoken')

const generateWebToken = (userId) => {

    return jwt.sign(
        { id: userId },
        process.env.JWT_Secret,
        { expiresIn: "1d" }
    )

}

module.exports = generateWebToken