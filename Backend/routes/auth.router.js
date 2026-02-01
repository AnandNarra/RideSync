const express = require('express')
const { register, login, driverRequest, getMyDriverStatus } = require('../controllers/user.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/user.validator')
const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

router.post('/driverRequest', authMiddleware, driverRequest)
router.get('/myDriverStatus', authMiddleware, getMyDriverStatus)

module.exports = router
