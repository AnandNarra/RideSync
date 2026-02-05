const express = require('express')
const { register, login, driverRequest, getMyDriverStatus } = require('../controllers/user.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/user.validator')
const authMiddleware = require('../middlewares/auth.middleware')

const upload = require('../middlewares/multer.middleware.js')

const router = express.Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

router.post('/driverRequest', authMiddleware, upload.fields([
    {
        name:"licensePhoto",
        maxCount:1
    },
    {
        name:"aadhaarPhoto",
        maxCount:1
    }
]) ,  driverRequest)
router.get('/myDriverStatus', authMiddleware, getMyDriverStatus)

module.exports = router
