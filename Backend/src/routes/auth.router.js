const express = require('express')
const { register, login, driverRequest, getMyDriverStatus, logout, getMyProfile, refreshAccessToken, updateProfile } = require('../controllers/user.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/user.validator')

const upload = require('../middlewares/multer.middleware.js')
const verifyAccessToken = require('../middlewares/auth.middleware')

const router = express.Router()



router.post('/register', upload.single('profilePhoto'), validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

router.post('/driverRequest', verifyAccessToken, upload.fields([
    {
        name: "licensePhoto",
        maxCount: 1
    },
    {
        name: "aadhaarPhoto",
        maxCount: 1
    }
]), driverRequest)


router.get('/myDriverStatus', verifyAccessToken, getMyDriverStatus)

router.post('/logout', verifyAccessToken, logout)

router.get('/my-profile', verifyAccessToken, getMyProfile)

router.patch('/update-profile', verifyAccessToken, upload.single('profilePhoto'), updateProfile)

router.post('/auth/token/refresh/', refreshAccessToken)


module.exports = router
