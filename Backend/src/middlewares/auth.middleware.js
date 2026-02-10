
const jwt = require('jsonwebtoken')
const verifyAccessToken = async (req, res, next) => {

    try {

        const token = req.headers.authorization?.split(' ')[1];  // Bearer <token>

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Authorization denied."
            });

        }

        const decode =  jwt.verify(token, process.env.JWT_ACCESSTOKEN_SECRET)

        req.user = {
            id:decode.id,
            role:decode.role
        }
      next()


    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid token. Authorization denied.",
            error: error.message
        });

    }
}

module.exports = verifyAccessToken;