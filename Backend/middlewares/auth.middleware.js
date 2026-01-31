const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Authorization denied."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_Secret);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Authorization denied."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Authorization denied.",
            error: error.message
        });
    }
};

module.exports = authMiddleware;
